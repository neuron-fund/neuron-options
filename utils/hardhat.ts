import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, getNamedAccounts } from 'hardhat'

export const namedAccountsSigners = async (
  getAccounts: typeof getNamedAccounts
): Promise<Record<string, SignerWithAddress>> => {
  const accounts = await getAccounts()
  const result = {}
  for (const [key, value] of Object.entries(accounts)) {
    result[key] = await ethers.getSigner(value)
  }
  return result
}
