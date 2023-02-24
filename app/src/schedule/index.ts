import { Network } from '@lyrafinance/lyra-js'
import { scheduleJob } from 'node-schedule'
import { SendTweet } from '../integrations/twitter'
import { GetArbitrageDeals } from '../lyra/arbitrage'
import { ArbTwitter } from '../templates/arb'
import { ArbConfig } from '../types/arbConfig'

const markets = ['eth', 'btc']

export function ArbitrageJob(config: ArbConfig, network: Network): void {
  scheduleJob('0 */4 * * *', async () => {
    const arbDto = await GetArbitrageDeals(config.strategy[0], network)
    const tweet = ArbTwitter(arbDto, network)
    if (tweet) {
      await SendTweet(tweet)
    }
  })
}
