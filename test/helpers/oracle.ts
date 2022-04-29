import { parseUnits } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Oracle } from '../../typechain-types'
import { ONTokenPrices } from './onToken'

export const chainlinkUsdPriceFeedDecimals = 8

export const setStablePrices = (oracle: Oracle, signer: SignerWithAddress, prices: ONTokenPrices) => {
  return Promise.all(
    Object.entries(prices).map(([asset, price]) =>
      oracle.connect(signer).setStablePrice(asset, parseUnits(price.toString(), chainlinkUsdPriceFeedDecimals))
    )
  )
}
