import { ethers, network } from 'hardhat'
import { BigNumber } from '@ethersproject/bignumber'
import { CRV_CVX_ETH, DAI, LIDO_ST_ETH, USDC, USDT } from '../../constants/externalAddresses'
import { IERC20__factory } from '../../typechain-types'
import { formatEther } from '@ethersproject/units'

export const whales = {
  [USDC]: '0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0',
  [DAI]: '0x5a16552f59ea34e44ec81e58b3817833e9fd5436',
  [USDT]: '0x5754284f345afc66a98fbb0a0afe71e0f007b949',
  [CRV_CVX_ETH]: '0x38ee5f5a39c01cb43473992c12936ba1219711ab',
  [LIDO_ST_ETH]: '0x06920c9fc643de77b99cb7670a944ad31eaaa260',
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
  console.log('WHALE balance', formatEther(await whale.getBalance()))
  await assetContract.transfer(recipient, amount)
  console.log('WHALE after transfer')
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [whaleAddress],
  })
}
