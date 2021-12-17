import { EthereumProvider } from 'hardhat/types'

export enum Seconds {
  MINUTE = 60,
  HOUR = 3600,
  DAY = 86400,
  WEEK = 604800,
}

/**
 * Return a valid expiry timestamp that's today + # days, 0800 UTC.
 * @param now
 * @param days
 */
export const createValidExpiry = days => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setUTCHours(8, 0, 0, 0)
  return date.getTime() / 1000
}

export const waitNDays = async (n: number, provider: EthereumProvider) => {
  await provider.send('evm_increaseTime', [Seconds.DAY * n])
  await provider.send('evm_mine')
}

export const waitWeek = (provider: EthereumProvider) => waitNDays(7, provider)
