import Chance from 'chance'
import { ethers } from 'hardhat'
import { mockErc2OwnersPrivateKeys } from '../../utils/accounts'
import { deployMockERC20 } from './erc20'
import { OTokenPrices } from './otoken'
import { calculateMarginRequired, OtokenCollateralsAmounts, OTokenParams } from './testMintRedeemSettle'

// {
//   oTokenParams: {
//     collateralAssets: [USDC, DAI],
//     underlyingAsset: WETH,
//     strikeAsset: USDC,
//     strikePriceFormatted: 3800,
//     expiryDays: 7,
//     isPut: true,
//   },
//   initialPrices: {
//     [USDC]: 1,
//     [DAI]: 1,
//     [WETH]: 4200,
//   },
//   expiryPrices: {
//     [USDC]: 1,
//     [DAI]: 1,
//     [WETH]: 3500,
//   },
//   vaults: [
//     {
//       collateralAmountsFormatted: [2000, 4000],
//       oTokenAmountFormatted: 1,
//     },
//     {
//       collateralAmountsFormatted: [4000, 0],
//       oTokenAmountFormatted: 1,
//     },
//   ],
// },

export declare type Seed = number | string;

export const getSeed = (): Seed => {
  if (!process.env.CHANCE_SEED) {
    const seedGenerator = new Chance();
    return seedGenerator.hash();
  }
  return process.env.CHANCE_SEED;
};

export const generateFuzzyTestParams = async (
  testSeed: Seed,
  canHaveBurn?: boolean,
  canHaveLong?: boolean
) => {
  console.log(`testSeed=${testSeed}`)
  const chance = new Chance(testSeed)
  const isITM = chance.bool()
  const isPut = chance.bool()

  const {
    oTokenParams: shortOtokenParams,
    mockERC20Owners,
    underlyingInitialPriceFormatted,
    strikeInitialPriceFormatted,
  } = await genShortOtokenParams(chance, isPut, isITM)

  const longOtokenParams = canHaveLong ? genLongOtokenParams(chance, shortOtokenParams) : undefined

  const vaultsNumber = chance.integer({ min: 1, max: 40 })

  const initialPrices = genInitialPrices(
    chance,
    shortOtokenParams,
    underlyingInitialPriceFormatted,
    strikeInitialPriceFormatted
  )
  const expiryPrices = genExpiryPrices(chance, shortOtokenParams, initialPrices, isPut, isITM)

  const vaults: {
    collateralAmountsFormatted: OtokenCollateralsAmounts<OTokenParams>
    oTokenAmountFormatted: number
    burnAmountFormatted?: number
    longToDeposit: OTokenParams
    longToDepositAmountFormatted: number
  }[] = []

  for (let l = 0; l < vaultsNumber; l++) {
    vaults.push(genVaultParams(chance, shortOtokenParams, initialPrices, canHaveBurn, longOtokenParams))
  }

  const requiredLongAmount = vaults.reduce((acc, x) => (acc += x.longToDepositAmountFormatted || 0), 0)
  const longsOwners =
    requiredLongAmount !== 0
      ? [
          {
            oTokenParams: longOtokenParams,
            collateralAmountsFormatted: genVaultCollateralAmounts(
              chance,
              longOtokenParams,
              requiredLongAmount,
              initialPrices
            ),
            oTokenAmountFormatted: requiredLongAmount,
          },
        ]
      : undefined

  return {
    oTokenParams: shortOtokenParams,
    initialPrices,
    expiryPrices,
    longsOwners,
    vaults,
    mockERC20Owners,
  }
}

export const genShortOtokenParams = async (chance: Chance.Chance, isPut: boolean, isITM: boolean) => {
  const collateralsNumber = chance.integer({ min: 1, max: 6 })
  const collateralsDecimals = [...new Array(collateralsNumber)].map(() => chance.integer({ min: 6, max: 18 }))

  const mockERC20Owners = {}

  const collateralAssets = await Promise.all(
    collateralsDecimals.map(async (decimals, i) => {
      const owner = await ethers.getSigner(new ethers.Wallet(mockErc2OwnersPrivateKeys[i]).address)
      const address = await deployMockERC20(owner, decimals)
      mockERC20Owners[address] = owner
      return address
    })
  )

  const underlyingDecimals = chance.integer({ min: 4, max: 18 })
  const underlyingAssetOwner = await ethers.getSigner(
    new ethers.Wallet(mockErc2OwnersPrivateKeys[collateralsNumber]).address
  )
  const underlyingAsset = await deployMockERC20(underlyingAssetOwner, underlyingDecimals)
  mockERC20Owners[underlyingAsset] = underlyingAssetOwner

  const strikeDecimals = chance.integer({ min: 4, max: 18 })
  const strikeAssetOwner = await ethers.getSigner(
    new ethers.Wallet(mockErc2OwnersPrivateKeys[collateralsNumber + 1]).address
  )
  const strikeAsset = await deployMockERC20(strikeAssetOwner, strikeDecimals)
  mockERC20Owners[strikeAsset] = strikeAssetOwner

  const underlyingInitialPriceFormatted = chance.floating({ min: 500, max: 100000, fixed: 2 })
  const strikeInitialPriceFormatted = chance.floating({ min: 1, max: 500, fixed: 2 })
  const strikePriceMultiplier = chance.floating({ min: 1, max: 2, fixed: 4 })
  const strikePriceFormatted = Number(
    (
      (isPut
        ? underlyingInitialPriceFormatted / strikePriceMultiplier
        : underlyingInitialPriceFormatted * strikePriceMultiplier) / strikeInitialPriceFormatted
    ).toFixed(2)
  )

  const expiryDays = 7

  return {
    oTokenParams: {
      collateralAssets,
      underlyingAsset,
      strikeAsset,
      strikePriceFormatted,
      expiryDays,
      isPut,
    },
    mockERC20Owners,
    underlyingInitialPriceFormatted,
    strikeInitialPriceFormatted,
  }
}

export const genLongOtokenParams = (chance: Chance.Chance, shortOTokenParams: OTokenParams) => {
  const {
    collateralAssets,
    expiryDays,
    strikeAsset,
    strikePriceFormatted: shortStrikePriceFormatted,
    underlyingAsset,
    isPut,
  } = shortOTokenParams

  const isLongHigherStrike = chance.bool()
  const strikePriceFormatted = isLongHigherStrike
    ? chance.floating({ min: shortStrikePriceFormatted + 1, max: shortStrikePriceFormatted * 10 })
    : chance.floating({ min: 100, max: shortStrikePriceFormatted - 1 })

  return {
    collateralAssets,
    underlyingAsset,
    strikeAsset,
    strikePriceFormatted,
    expiryDays,
    isPut,
  }
}

export const genVaultParams = (
  chance: Chance.Chance,
  shortOtokenParams: OTokenParams,
  prices: OTokenPrices,
  canHaveBurn?: boolean,
  longOtokenParams?: OTokenParams
) => {
  const mintAmountFormatted = chance.floating({ min: 0.1, max: 500, fixed: 2 })

  const collateralAmountsFormatted = genVaultCollateralAmounts(chance, shortOtokenParams, mintAmountFormatted, prices)

  const shouldHaveBurn = canHaveBurn && chance.bool()
  const burnAmountFormatted = shouldHaveBurn
    ? chance.floating({ min: 0.001, max: mintAmountFormatted, fixed: 4 })
    : undefined
  const shouldDepositLong = longOtokenParams && chance.bool()
  const longToDeposit = longOtokenParams && shouldDepositLong ? longOtokenParams : undefined
  const longToDepositAmountFormatted = longToDeposit ? chance.floating({ min: 0.1, max: 500, fixed: 2 }) : undefined

  return {
    collateralAmountsFormatted,
    oTokenAmountFormatted: mintAmountFormatted,
    burnAmountFormatted,
    longToDeposit,
    longToDepositAmountFormatted,
  }
}

export const genInitialPrices = (
  chance: Chance.Chance,
  shortOtokenParams: OTokenParams,
  underlyingInitialPriceFormatted: number,
  strikeInitialPriceFormatted: number
) => {
  const initialPrices = {}

  shortOtokenParams.collateralAssets.forEach(x => {
    initialPrices[x] = chance.floating({ min: 20, max: 20000, fixed: 2 })
  })
  initialPrices[shortOtokenParams.strikeAsset] = strikeInitialPriceFormatted
  initialPrices[shortOtokenParams.underlyingAsset] = underlyingInitialPriceFormatted

  return initialPrices
}

export const genExpiryPrices = (
  chance: Chance.Chance,
  shortOtokenParams: OTokenParams,
  initialPrices: OTokenPrices,
  isPut: boolean,
  isITM: boolean
) => {
  const { strikePriceFormatted, strikeAsset, underlyingAsset, collateralAssets } = shortOtokenParams

  const expiryPrices = {}

  expiryPrices[strikeAsset] = chance.floating({
    min: 0.5 * initialPrices[strikeAsset],
    max: 2 * initialPrices[strikeAsset],
    fixed: 2,
  })

  const strikePriceInCash = expiryPrices[strikeAsset] * strikePriceFormatted

  collateralAssets.forEach(x => {
    expiryPrices[x] = chance.floating({ min: initialPrices[x] * 0.75, max: initialPrices[x] * 5, fixed: 2 })
  })

  const putUnderlyingPrice = isITM
    ? chance.floating({ min: strikePriceInCash / 2, max: strikePriceInCash - 1, fixed: 2 })
    : chance.floating({ min: strikePriceInCash + 1, max: strikePriceInCash * 5, fixed: 2 })

  const callUnderlyingPrice = isITM
    ? chance.floating({ min: strikePriceInCash + 1, max: strikePriceInCash * 2, fixed: 2 })
    : chance.floating({ min: strikePriceInCash / 5, max: strikePriceInCash - 1, fixed: 2 })

  expiryPrices[underlyingAsset] = isPut ? putUnderlyingPrice : callUnderlyingPrice

  return expiryPrices
}

export const genVaultCollateralAmounts = <T extends OTokenParams>(
  chance: Chance.Chance,
  oTokenParams: T,
  mintAmountFormatted: number,
  prices: OTokenPrices
): number[] & { length: T['collateralAssets']['length'] } => {
  const { marginRequiredUsd } = calculateMarginRequired(mintAmountFormatted, oTokenParams, prices)

  const excessCollateralValueRatio = chance.floating({ min: 1, max: 5, fixed: 2 })
  const collateralValuesRaw = oTokenParams.collateralAssets.map(x =>
    chance.floating({ min: 0, max: marginRequiredUsd, fixed: 2 })
  )
  const collateralValuesSum = collateralValuesRaw.reduce((acc, curr) => acc + curr, 0)
  const collateralValuesNormalized = collateralValuesRaw.map(
    x => (x / collateralValuesSum) * marginRequiredUsd * excessCollateralValueRatio
  )
  const collateralAmountsFormatted = collateralValuesNormalized.map(
    (x, i) => x / prices[oTokenParams.collateralAssets[i]]
  )

  return collateralAmountsFormatted
}
