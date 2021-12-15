import { Signer } from '@ethersproject/abstract-signer'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { ERC20Interface__factory } from '../../typechain-types'
import { AddressZero, MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'

export const addTokenDecimalsToAmount = async (token: string, amount: number, signer: Signer) => {
  const stirkePriceAssetDecimals = await ERC20Interface__factory.connect(token, signer).decimals()
  return parseUnits(amount.toString(), stirkePriceAssetDecimals)
}

export const getERC20BalanceOf = async (signer: Signer, tokenAddress: string, holderAddress?: string) => {
  try {
    return ERC20Interface__factory.connect(tokenAddress, signer).balanceOf(holderAddress || (await signer.getAddress()))
  } catch (e) {
    throw e
  }
}

export const getERC20Decimals = async (signer: Signer, tokenAddress: string) => {
  return ERC20Interface__factory.connect(tokenAddress, signer).decimals()
}

export const getERC20Allowance = async (
  signer: Signer,
  tokenAddress: string,
  ownerAddress: string,
  spenderAdress: string
) => {
  return ERC20Interface__factory.connect(tokenAddress, signer).allowance(ownerAddress, spenderAdress)
}

export const checkIsFullBalanceERC20Allowance = async ({
  signer,
  tokenAddress,
  owner,
  spender,
}: {
  signer: Signer
  tokenAddress: string
  owner?: string
  spender: string
}) => {
  owner = owner || (await signer.getAddress())
  const allowance = await getERC20Allowance(signer, tokenAddress, owner, spender)
  const balance = await getERC20BalanceOf(signer, tokenAddress)
  return allowance.gte(balance)
}

export const checkIsMaxERC20Allowance = async ({
  signer,
  tokenAddress,
  owner,
  spender,
}: {
  signer: Signer
  tokenAddress: string
  owner?: string
  spender: string
}) => {
  owner = owner || (await signer.getAddress())
  const allowance = await getERC20Allowance(signer, tokenAddress, owner, spender)
  return allowance.eq(MaxUint256)
}

export const getEthOrERC20BalanceFormatted = async (signer: Signer, tokenAddress: string) => {
  const isETH = tokenAddress === AddressZero
  const signerAddress = await signer.getAddress()
  const balance = isETH ? await signer.getBalance() : await getERC20BalanceOf(signer, tokenAddress, signerAddress)
  const decimals = isETH ? 18 : await getERC20Decimals(signer, tokenAddress)

  return Number(formatUnits(balance, decimals))
}

export const approveERC20 = async (tokenAddress: string, amount: BigNumber, signer: Signer, spenderAddress: string) =>
  ERC20Interface__factory.connect(tokenAddress, signer).approve(spenderAddress, amount)
