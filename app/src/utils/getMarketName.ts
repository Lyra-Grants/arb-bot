import { Network } from '@lyrafinance/lyra-js'
import { Underlying } from '../types/arbs'

export function getMarketName(network: Network, underlying: Underlying) {
  if (network == Network.Optimism) {
    if (underlying == Underlying.BTC) {
      return 'sBTC-sUSD'
    }

    return 'sETH-sUSD'
  }
  if (underlying == Underlying.BTC) {
    // no btc market yet on Arb
    return undefined
  }
  return 'ETH-USDC'
}
