import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { MockERC20__factory } from '../../../typechain-types'
import { getAssetFromWhale } from '../funds'

export async function getFunds(
  asset: string,
  amount: BigNumber,
  reciever: string,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  if (mockERC20Owners?.[asset]) {
    const mockERC20Owner = mockERC20Owners[asset]
    await MockERC20__factory.connect(asset, mockERC20Owner).mint(reciever, amount)
  } else {
    await getAssetFromWhale(asset, amount, reciever)
  }
}
