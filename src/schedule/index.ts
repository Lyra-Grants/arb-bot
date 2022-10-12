import { scheduleJob } from 'node-schedule'
import { GetPrice } from '../integrations/coingecko'

export function PricingJob(): void {
  console.log('30 min pricing job running')
  scheduleJob('*/30 * * * *', async () => {
    await GetPrice()
  })
}
