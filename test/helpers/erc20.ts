import { parseUnits, formatUnits } from '@ethersproject/units'
import { ERC20Interface__factory } from '../../typechain-types'
import { AddressZero, MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Wallet } from '@ethersproject/wallet'

export const addTokenDecimalsToAmount = async (token: string, amount: number, signer: SignerWithAddress | Wallet) => {
  const decimals = await getERC20Decimals(signer, token)
  // toFixed is used to avoid error "fractional component exceeds decimals"
  const amountInputDecimals = amount.toString().split('.')[1]?.length
  // using toFixed only if amount accuracy exceeds decimals of token, otherwise it will lead to rounding errors
  // for example `0.3.toFixed(18)` will return '0.299999999999999989'
  const isAmountAccuracyExceedsDecimals = amountInputDecimals && amountInputDecimals > decimals
  const normalizedAmount = isAmountAccuracyExceedsDecimals ? amount.toFixed(decimals) : amount
  return parseUnits(normalizedAmount.toString(), decimals)
}

export const getERC20BalanceOf = async (
  signer: SignerWithAddress | Wallet,
  tokenAddress: string,
  holderAddress?: string
) => {
  try {
    return ERC20Interface__factory.connect(tokenAddress, signer).balanceOf(holderAddress || (await signer.getAddress()))
  } catch (e) {
    throw e
  }
}

export const getERC20Decimals = async (signer: SignerWithAddress | Wallet, tokenAddress: string) => {
  return ERC20Interface__factory.connect(tokenAddress, signer).decimals()
}

export const getERC20Allowance = async (
  signer: SignerWithAddress | Wallet,
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
  signer: SignerWithAddress | Wallet
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
  signer: SignerWithAddress | Wallet
  tokenAddress: string
  owner?: string
  spender: string
}) => {
  owner = owner || (await signer.getAddress())
  const allowance = await getERC20Allowance(signer, tokenAddress, owner, spender)
  return allowance.eq(MaxUint256)
}

export const getEthOrERC20BalanceFormatted = async (signer: SignerWithAddress | Wallet, tokenAddress: string) => {
  const isETH = tokenAddress === AddressZero
  const signerAddress = await signer.getAddress()
  const balance = isETH ? await signer.getBalance() : await getERC20BalanceOf(signer, tokenAddress, signerAddress)
  const decimals = isETH ? 18 : await getERC20Decimals(signer, tokenAddress)

  return Number(formatUnits(balance, decimals))
}

export const approveERC20 = async (
  tokenAddress: string,
  amount: BigNumber,
  signer: SignerWithAddress | Wallet,
  spenderAddress: string
) => ERC20Interface__factory.connect(tokenAddress, signer).approve(spenderAddress, amount)
