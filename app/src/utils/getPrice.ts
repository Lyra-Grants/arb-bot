import { Network } from '@lyrafinance/lyra-js'
import { Underlying } from '../types/arbs'
import fromBigNumber from '../utils/fromBigNumber'
import getLyra from '../utils/getLyraSDK'
import { getMarketName } from './getMarketName'

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
  const ethMarketName = getMarketName(network, Underlying.ETH)
  const btcMarketName = getMarketName(network, Underlying.BTC)

  if (btcMarketName) {
    const btcMarket = await lyra.market(btcMarketName)
    if (network == Network.Arbitrum) {
      //global.BTC_PRICE_ARB = fromBigNumber(btcMarket.spotPrice)
    }
    if (network == Network.Optimism) {
      global.BTC_PRICE_OPT = fromBigNumber(btcMarket.spotPrice)
      console.log(`Opt BTC Price: ${BTC_PRICE_OPT}`)
    }
  }
  if (ethMarketName) {
    const ethMarket = await lyra.market(ethMarketName)

    if (network == Network.Arbitrum) {
      global.ETH_PRICE_ARB = fromBigNumber(ethMarket.spotPrice)
      console.log(`Arb ETH Price: ${ETH_PRICE_ARB}`)
    }
    if (network == Network.Optimism) {
      global.ETH_PRICE_OPT = fromBigNumber(ethMarket.spotPrice)
      console.log(`Opt ETH Price: ${ETH_PRICE_OPT}`)
    }
  }
}
