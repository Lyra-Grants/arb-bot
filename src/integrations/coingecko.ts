import { CoinGeckoClient } from '../clients/coinGeckoClient'
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
        printObject(resp.data)
        global.ETH_PRICE = resp.data['ethereum'].usd
        global.ETH_24HR = resp.data['ethereum'].usd_24h_change
        global.BTC_PRICE = resp.data['bitcoin'].usd
        global.BTC_24HR = resp.data['bitcoin'].usd_24h_change
        global.SOL_PRICE = resp.data['solana'].usd
        global.SOL_24HR = resp.data['solana'].usd_24h_change
      })
  } catch (error) {
    console.log(error)
  }
}
