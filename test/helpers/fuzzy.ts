import Chance from 'chance'
import { ethers } from 'hardhat'
import { mockErc2OwnersPrivateKeys } from '../../utils/accounts'
import { calculateMarginRequired } from './e2e/margin'
import { ONtokenCollateralsAmounts, ONTokenParams } from './e2e/types'
import { deployMockERC20 } from './erc20'
import { ONTokenPrices } from './onToken'

// {
//   onTokenParams: {
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
//       onTokenAmountFormatted: 1,
//     },
//     {
//       collateralAmountsFormatted: [4000, 0],
//       onTokenAmountFormatted: 1,
//     },
//   ],
// },

export declare type Seed = number | string

export const getSeed = (): Seed => {
  if (!process.env.CHANCE_SEED) {
    const seedGenerator = new Chance()
    return seedGenerator.hash()
  }
  return process.env.CHANCE_SEED
}

export const generateFuzzyTestParams = async (testSeed: Seed, canHaveBurn?: boolean, canHaveLong?: boolean) => {
  console.log(`testSeed=${testSeed}`)
  const chance = new Chance(testSeed)
  const isITM = chance.bool()
  const isPut = chance.bool()

  const {
    onTokenParams: shortONtokenParams,
    mockERC20Owners,
    underlyingInitialPriceFormatted,
    strikeInitialPriceFormatted,
  } = await genShortONtokenParams(chance, isPut, isITM)

  const longONtokenParams = canHaveLong ? genLongONtokenParams(chance, shortONtokenParams) : undefined

  const vaultsNumber = chance.integer({ min: 1, max: 40 })

  const initialPrices = genInitialPrices(
    chance,
    shortONtokenParams,
    underlyingInitialPriceFormatted,
    strikeInitialPriceFormatted
  )
  const expiryPrices = genExpiryPrices(chance, shortONtokenParams, initialPrices, isPut, isITM)

  const vaults: {
    collateralAmountsFormatted: ONtokenCollateralsAmounts<ONTokenParams>
    onTokenAmountFormatted: number
    burnAmountFormatted?: number
    longToDeposit: ONTokenParams
    longToDepositAmountFormatted: number
  }[] = []

  for (let l = 0; l < vaultsNumber; l++) {
    vaults.push(genVaultParams(chance, shortONtokenParams, initialPrices, canHaveBurn, longONtokenParams))
  }

  const requiredLongAmount = vaults.reduce((acc, x) => (acc += x.longToDepositAmountFormatted || 0), 0)
  const longsOwners =
    requiredLongAmount !== 0
      ? [
          {
            onTokenParams: longONtokenParams,
            collateralAmountsFormatted: genVaultCollateralAmounts(
              chance,
              longONtokenParams,
              requiredLongAmount,
              initialPrices
            ),
            onTokenAmountFormatted: requiredLongAmount,
          },
        ]
      : undefined

  return {
    onTokenParams: shortONtokenParams,
    initialPrices,
    expiryPrices,
    longsOwners,
    vaults,
    mockERC20Owners,
  }
}

export const genShortONtokenParams = async (chance: Chance.Chance, isPut: boolean, isITM: boolean) => {
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

  const collateralConstraints = new Array<number>(collateralAssets.length).fill(0)

  return {
    onTokenParams: {
      collateralAssets,
      collateralConstraints,
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

export const genLongONtokenParams = (chance: Chance.Chance, shortONTokenParams: ONTokenParams) => {
  const {
    collateralAssets,
    expiryDays,
    strikeAsset,
    strikePriceFormatted: shortStrikePriceFormatted,
    underlyingAsset,
    isPut,
  } = shortONTokenParams

  const isLongHigherStrike = chance.bool()
  const strikePriceFormatted = isLongHigherStrike
    ? chance.floating({ min: shortStrikePriceFormatted + 1, max: shortStrikePriceFormatted * 10 })
    : chance.floating({ min: 100, max: shortStrikePriceFormatted - 1 })

  const collateralConstraints = new Array<number>(collateralAssets.length).fill(0)

  return {
    collateralAssets,
    collateralConstraints,
    underlyingAsset,
    strikeAsset,
    strikePriceFormatted,
    expiryDays,
    isPut,
  }
}

export const genVaultParams = (
  chance: Chance.Chance,
  shortONtokenParams: ONTokenParams,
  prices: ONTokenPrices,
  canHaveBurn?: boolean,
  longONtokenParams?: ONTokenParams
) => {
  const mintAmountFormatted = chance.floating({ min: 0.1, max: 500, fixed: 2 })

  const collateralAmountsFormatted = genVaultCollateralAmounts(chance, shortONtokenParams, mintAmountFormatted, prices)

  const shouldHaveBurn = canHaveBurn && chance.bool()
  const burnAmountFormatted = shouldHaveBurn
    ? chance.floating({ min: 0.001, max: mintAmountFormatted, fixed: 4 })
    : undefined
  const shouldDepositLong = longONtokenParams && chance.bool()
  const longToDeposit = longONtokenParams && shouldDepositLong ? longONtokenParams : undefined
  const longToDepositAmountFormatted = longToDeposit ? chance.floating({ min: 0.1, max: 500, fixed: 2 }) : undefined

  return {
    collateralAmountsFormatted,
    onTokenAmountFormatted: mintAmountFormatted,
    burnAmountFormatted,
    longToDeposit,
    longToDepositAmountFormatted,
  }
}

export const genInitialPrices = (
  chance: Chance.Chance,
  shortONtokenParams: ONTokenParams,
  underlyingInitialPriceFormatted: number,
  strikeInitialPriceFormatted: number
) => {
  const initialPrices = {}

  shortONtokenParams.collateralAssets.forEach(x => {
    initialPrices[x] = chance.floating({ min: 20, max: 20000, fixed: 2 })
  })
  initialPrices[shortONtokenParams.strikeAsset] = strikeInitialPriceFormatted
  initialPrices[shortONtokenParams.underlyingAsset] = underlyingInitialPriceFormatted

  return initialPrices
}

export const genExpiryPrices = (
  chance: Chance.Chance,
  shortONtokenParams: ONTokenParams,
  initialPrices: ONTokenPrices,
  isPut: boolean,
  isITM: boolean
) => {
  const { strikePriceFormatted, strikeAsset, underlyingAsset, collateralAssets } = shortONtokenParams

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

export const genVaultCollateralAmounts = <T extends ONTokenParams>(
  chance: Chance.Chance,
  onTokenParams: T,
  mintAmountFormatted: number,
  prices: ONTokenPrices
): number[] & { length: T['collateralAssets']['length'] } => {
  const { marginRequiredUsd } = calculateMarginRequired(mintAmountFormatted, onTokenParams, prices)

  const excessCollateralValueRatio = chance.floating({ min: 1, max: 5, fixed: 2 })
  const collateralValuesRaw = onTokenParams.collateralAssets.map(x =>
    chance.floating({ min: 0, max: marginRequiredUsd, fixed: 2 })
  )
  const collateralValuesSum = collateralValuesRaw.reduce((acc, curr) => acc + curr, 0)
  const collateralValuesNormalized = collateralValuesRaw.map(
    x => (x / collateralValuesSum) * marginRequiredUsd * excessCollateralValueRatio
  )
  const collateralAmountsFormatted = collateralValuesNormalized.map(
    (x, i) => x / prices[onTokenParams.collateralAssets[i]]
  )

  return collateralAmountsFormatted
}
