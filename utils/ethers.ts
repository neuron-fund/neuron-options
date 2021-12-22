import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'hardhat'

export const AddressZero = ethers.constants.AddressZero

/**
 *
 * @param a tested number
 * @param b expected number
 * @param deviation deviation
 */
export const bigNumberDeviatedEqual = (a: BigNumber, b: BigNumber, deviation: number) => {
  const bottomLimit = b.sub(deviation)
  const topLimit = b.add(deviation)
  return a.gt(bottomLimit) && a.lt(topLimit)
}
