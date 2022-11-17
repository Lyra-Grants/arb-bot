import { CoinGeckoClient } from '../clients/coinGeckoClient'
import { Underlying } from '../types/arbs'

export async function GetPrice(): Promise<void> {
  try {
    await CoinGeckoClient.simple
      .price({
        ids: ['ethereum', 'bitcoin'],
        vs_currencies: 'usd',
        include_24hr_change: true,
      })
      .then((resp) => {
        //printObject(resp.data)
        global.ETH_PRICE = resp.data['ethereum'].usd
        global.BTC_PRICE = resp.data['bitcoin'].usd
      })
  } catch (error) {
    console.log(error)
  }
}

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
