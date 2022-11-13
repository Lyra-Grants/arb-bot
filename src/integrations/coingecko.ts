import { CoinGeckoClient } from '../clients/coinGeckoClient'
import { Underlying } from '../types/arbs'
import printObject from '../utils/printObject'

export async function GetPrice(): Promise<void> {
  try {
    await CoinGeckoClient.simple
      .price({
        ids: ['ethereum', 'lyra-finance', 'bitcoin', 'solana'],
        vs_currencies: 'usd',
        include_24hr_change: true,
      })
      .then((resp) => {
        //printObject(resp.data)
        global.ETH_PRICE = resp.data['ethereum'].usd
        global.BTC_PRICE = resp.data['bitcoin'].usd
        global.SOL_PRICE = resp.data['solana'].usd
      })
  } catch (error) {
    console.log(error)
  }
}

export function GetMarketPrice(market: Underlying) {
  if (market == Underlying.BTC) {
    return global.BTC_PRICE
  }
  if (market == Underlying.SOL) {
    return global.ETH_PRICE
  }
  if (market == Underlying.ETH) {
    return global.ETH_PRICE
  }

  const marketNotFound = 'Market Price not found.'
  throw new Error(marketNotFound)
}
