import Lyra from '@lyrafinance/lyra-js'
import { Deal, OptionType, ProviderType, Underlying } from '../types/arbs'
import { useRatesData } from '../utils/arbUtils'
import { maxBy, minBy } from 'lodash'
import moment from 'moment'
import { Arb, ArbDto } from '../types/lyra'
import { ArbConfig } from '../types/arbConfig'

export function GetPrice(market: Underlying) {
  let price = ETH_PRICE

  if (market == Underlying.BTC) {
    price = BTC_PRICE
  }
  if (market == Underlying.SOL) {
    price = SOL_PRICE
  }

  return price
}

export async function GetArbitrageDeals(config: ArbConfig, lyra: Lyra, market: Underlying) {
  const price = GetPrice(market)
  const deals = await useDeals(config, lyra, market)

  const data = deals.map((deal) => {
    const momentExp = moment(deal?.expiration)
    const duration = moment.duration(momentExp.diff(moment())).asYears()

    const arb: Arb = {
      ...deal,
      apy: (deal.amount / price / duration) * 100,
      discount: (deal.amount / (deal.sell?.bidPrice as number)) * 100,
    }
    return arb
  })

  data.sort((a, b) => b.apy - a.apy)

  const event: ArbDto = {
    arbs: data,
    market: market,
  }

  return event
}

export async function useDeals(config: ArbConfig, lyra: Lyra, marketName: Underlying) {
  const { allRates } = await useRatesData(lyra, marketName)
  const res: Deal[] = []
  const providers = [ProviderType.LYRA, ProviderType.DERIBIT]

  console.log(allRates)

  Object.values(allRates).forEach((strike) =>
    Object.values(strike).forEach((interception) => {
      const providerFiltered = providers
        ? interception.filter((option) => option && providers.includes(option.provider))
        : interception
      if (providerFiltered?.length < 2) return

      const maxCall = maxBy(providerFiltered, 'CALL.bidPrice')?.CALL
      const minCall = minBy(providerFiltered, 'CALL.askPrice')?.CALL
      const maxPut = maxBy(providerFiltered, 'PUT.bidPrice')?.PUT
      const minPut = minBy(providerFiltered, 'PUT.askPrice')?.PUT

      const callDeal =
        maxCall?.bidPrice &&
        minCall?.askPrice &&
        maxCall.provider !== minCall.provider &&
        maxCall.bidPrice - minCall.askPrice

      const putDeal =
        maxPut?.bidPrice && minPut?.askPrice && maxPut.provider !== minPut.provider && maxPut.bidPrice - minPut.askPrice

      if (callDeal && callDeal > config.profitThreshold) {
        res.push({
          type: OptionType.CALL,
          term: maxCall.term,
          strike: maxCall.strike,
          expiration: maxCall.expiration,
          amount: callDeal,
          buy: minCall,
          sell: maxCall,
        })
      }
      if (putDeal && putDeal > config.profitThreshold) {
        res.push({
          type: OptionType.PUT,
          term: maxPut.term,
          strike: maxPut.strike,
          expiration: maxPut.expiration,
          amount: putDeal,
          buy: minPut,
          sell: maxPut,
        })
      }
    }),
  )

  return res
}
