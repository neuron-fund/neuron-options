import { ethers, network } from 'hardhat'
import { BigNumber } from '@ethersproject/bignumber'
import { CRV_CVX_ETH, DAI, LIDO_ST_ETH, USDC, USDT } from '../../constants/externalAddresses'
import { IERC20__factory } from '../../typechain-types'
import { parseEther } from '@ethersproject/units'

export const whales = {
  [USDC]: '0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0',
  [DAI]: '0x5a16552f59ea34e44ec81e58b3817833e9fd5436',
  [USDT]: '0x5754284f345afc66a98fbb0a0afe71e0f007b949',
  [CRV_CVX_ETH]: '0x7E1444BA99dcdFfE8fBdb42C02F0005D14f13BE1',
  [LIDO_ST_ETH]: '0x1982b2F5814301d4e9a8b0201555376e62F82428',
} as const

export type AseetsWithWhales = keyof typeof whales

export const getAssetFromWhale = async (asset: string, amount: BigNumber, recipient: string) => {
  const localSigner = (await ethers.getSigners())[0]
  const whaleAddress = whales[asset]
  if (!whaleAddress) {
    throw new Error(`whale for ${asset} is not defined`)
  }
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [whaleAddress],
  })
  await network.provider.request({
    method: 'hardhat_setBalance',
    params: [whaleAddress, parseEther('0.5')._hex.replace(/0x0+/, '0x')],
  })
  const whale = await ethers.getSigner(whaleAddress)
  const assetContract = IERC20__factory.connect(asset, whale)
  await assetContract.transfer(recipient, amount)
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [whaleAddress],
  })
}
