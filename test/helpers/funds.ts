import { ethers, network } from 'hardhat'
import { BigNumber } from '@ethersproject/bignumber'
import { CRV_CVX_ETH, DAI, LIDO_ST_ETH, USDC, USDT } from '../../constants/externalAddresses'
import { IERC20__factory } from '../../typechain-types'

export const whales = {
  [USDC]: '0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0',
  [DAI]: '0x5a16552f59ea34e44ec81e58b3817833e9fd5436',
  [USDT]: '0x5754284f345afc66a98fbb0a0afe71e0f007b949',
  [CRV_CVX_ETH]: '0x38ee5f5a39c01cb43473992c12936ba1219711ab',
  [LIDO_ST_ETH]: '0x3BA21b6477F48273f41d241AA3722FFb9E07E247',
} as const

export type AseetsWithWhales = keyof typeof whales

export const getAssetFromWhale = async (asset: string, amount: BigNumber, recipient: string) => {
  const whaleAddress = whales[asset]
  if (!whaleAddress) {
    throw new Error(`whale for ${asset} is not defined`)
  }
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [whaleAddress],
  })
  const whale = await ethers.getSigner(whaleAddress)
  const assetContract = IERC20__factory.connect(asset, whale)
  await assetContract.transfer(recipient, amount)
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [whaleAddress],
  })
}
