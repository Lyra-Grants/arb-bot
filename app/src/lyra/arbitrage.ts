import { Deal, OptionType, ProviderType, Underlying } from '../types/arbs'
import { useRatesData } from '../utils/arbUtils'
import { maxBy, minBy } from 'lodash'
import moment from 'moment'
import { Arb, ArbDto } from '../types/lyra'
import { Strategy } from '../types/arbConfig'
import printObject from '../utils/printObject'
import { Network } from '@lyrafinance/lyra-js'

export function GetPrice(market: Underlying, network: Network) {
  if (network === Network.Arbitrum) {
    if (market == Underlying.ETH) {
      return ETH_PRICE_ARB
    }
    // if (market == Underlying.BTC) {
    //   return BTC_PRICE_ARB
    // }
  }

  if (network === Network.Optimism) {
    if (market == Underlying.ETH) {
      return ETH_PRICE_OPT
    }
    if (market == Underlying.BTC) {
      return BTC_PRICE_OPT
    }
  }
  return 0
}

export async function GetArbitrageDeals(strategy: Strategy, network: Network) {
  const price = GetPrice(strategy.market, network)
  const deals = await useDeals(strategy, network)
  // console.log('----------------')
  // printObject(deals)
  // console.log('----------------')
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
    market: strategy.market,
  }

  // console.log('*******************************')
  // printObject(event.arbs)
  // console.log('*******************************')
  return event
}

export async function useDeals(strategy: Strategy, network: Network) {
  const { allRates } = await useRatesData(strategy.market, network)
  const res: Deal[] = []
  const providers = [ProviderType.LYRA, ProviderType.DERIBIT]

  Object.values(allRates).forEach((strike) =>
    Object.values(strike).forEach((interception) => {
      const providerFiltered = providers
        ? interception.filter((option) => option && providers.includes(option.provider))
        : interception
      if (providerFiltered?.length < 2) return

      const maxCall = maxBy(providerFiltered, (o) => o[OptionType.CALL]?.bidPrice)?.CALL
      const minCall = minBy(providerFiltered, (o) => o[OptionType.CALL]?.askPrice)?.CALL
      const maxPut = maxBy(providerFiltered, (o) => o[OptionType.PUT]?.bidPrice)?.PUT
      const minPut = minBy(providerFiltered, (o) => o[OptionType.PUT]?.askPrice)?.PUT

      const callDeal =
        maxCall?.bidPrice &&
        minCall?.askPrice &&
        maxCall.provider !== minCall.provider &&
        maxCall.bidPrice - minCall.askPrice

      const putDeal =
        maxPut?.bidPrice && minPut?.askPrice && maxPut.provider !== minPut.provider && maxPut.bidPrice - minPut.askPrice

      if (callDeal && callDeal > strategy.profitThreshold) {
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
      if (putDeal && putDeal > strategy.profitThreshold) {
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
