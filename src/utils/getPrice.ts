import { Underlying } from '../types/arbs'
import fromBigNumber from '../utils/fromBigNumber'
import getLyra from '../utils/getLyra'

export function GetMarketPrice(market: Underlying) {
  if (market == Underlying.BTC) {
    return global.BTC_PRICE
  }
  if (market == Underlying.ETH) {
    return global.ETH_PRICE
  }

  const marketNotFound = 'Market Price not found.'
  throw new Error(marketNotFound)
}

// rather the CG, get it from Lyra
export async function GetSpotPrice(): Promise<void> {
  const lyra = getLyra()
  const [btcMarket, ethMarket] = await Promise.all([lyra.market(Underlying.BTC), lyra.market(Underlying.ETH)])
  global.BTC_PRICE = fromBigNumber(btcMarket.spotPrice)
  global.ETH_PRICE = fromBigNumber(ethMarket.spotPrice)

  console.log('Spot Prices Fetched')
  console.log(`Eth Price: ${ETH_PRICE}`)
  console.log(`Btc Price: ${BTC_PRICE}`)
}
