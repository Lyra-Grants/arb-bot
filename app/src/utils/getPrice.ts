import { Network } from '@lyrafinance/lyra-js'
import { Underlying } from '../types/arbs'
import fromBigNumber from '../utils/fromBigNumber'
import getLyra from '../utils/getLyraSDK'

export function GetMarketPrice(market: Underlying, network: Network) {
  if (network == Network.Arbitrum) {
    if (market == Underlying.BTC) {
      return global.BTC_PRICE_ARB
    }
    if (market == Underlying.ETH) {
      return global.ETH_PRICE_ARB
    }
  }

  if (network == Network.Optimism) {
    if (market == Underlying.BTC) {
      return global.BTC_PRICE_OPT
    }
    if (market == Underlying.ETH) {
      return global.ETH_PRICE_OPT
    }
  }

  const marketNotFound = 'Market Price not found.'
  throw new Error(marketNotFound)
}

export async function GetSpotPrice(network: Network): Promise<void> {
  const lyra = getLyra(network)
  const [btcMarket, ethMarket] = await Promise.all([lyra.market(Underlying.BTC), lyra.market(Underlying.ETH)])

  if (network == Network.Arbitrum) {
    global.BTC_PRICE_ARB = fromBigNumber(btcMarket.spotPrice)
    global.ETH_PRICE_ARB = fromBigNumber(ethMarket.spotPrice)
    console.log(`${network} Spot Prices Fetched`)
    console.log(`Eth Price: ${BTC_PRICE_ARB}`)
    console.log(`Btc Price: ${ETH_PRICE_ARB}`)
  }

  if (network == Network.Optimism) {
    global.BTC_PRICE_OPT = fromBigNumber(btcMarket.spotPrice)
    global.ETH_PRICE_OPT = fromBigNumber(ethMarket.spotPrice)
    console.log(`${network} Spot Prices Fetched`)
    console.log(`Eth Price: ${BTC_PRICE_OPT}`)
    console.log(`Btc Price: ${ETH_PRICE_OPT}`)
  }
}
