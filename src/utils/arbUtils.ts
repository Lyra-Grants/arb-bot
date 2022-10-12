import moment from 'moment'
import { chain, groupBy, pick } from 'lodash'
import { STRIKE_CUTOFF } from '../constants/arbConstants'
import { OptionsMap, OptionType, ProviderType } from '../types/arbs'
import { getDeribitRates } from '../providers/deribit'
import { getLyraRates } from '../providers/Lyra'
import Lyra from '@lyrafinance/lyra-js'

type Strikes = {
  allStrikes?: number[]
  callStrikes?: number[]
  putStrikes?: number[]
  basePrice?: number
}

export const useStrikes = (): Strikes => {
  const basePrice = ETH_PRICE
  // Call : 0.8x spot -> 2x spot
  // Put : 0.5x spot -> 1.2x spot

  if (!basePrice) return {}

  const roundedBase = Math.floor(basePrice / 100) * 100
  const callStart = Math.ceil((roundedBase * 0.9) / 100) * 100
  const callEnd = roundedBase * STRIKE_CUTOFF
  const putStart = Math.ceil(roundedBase / STRIKE_CUTOFF / 100) * 100
  const putEnd = Math.floor((roundedBase * 1.1) / 100) * 100

  const callStrikes: number[] = []
  const putStrikes: number[] = []
  const allStrikes: number[] = []

  for (let i = callStart; i <= callEnd; i += 100) callStrikes.push(i)
  for (let i = putStart; i <= putEnd; i += 100) putStrikes.push(i)
  for (let i = putStart; i <= callEnd; i += 100) allStrikes.push(i)

  return { allStrikes, callStrikes, putStrikes, basePrice }
}

export const useExpirations = (deribitRates?: OptionsMap[], minDays = 0, maxMonths = 3) => {
  const currentDate = moment(new Date())

  const deribitTerms = chain(deribitRates)
    .uniqBy('term')
    .sortBy('expiration')
    .filter(({ term, expiration }) => {
      const momentExpiration = moment(expiration)
      const duration = moment.duration(momentExpiration.diff(currentDate))
      const monthsPassed = duration.asMonths()
      const daysPassed = duration.asDays()

      return monthsPassed <= maxMonths && daysPassed > minDays
    })
    .map(({ term, expiration }) => [term, +moment(expiration).set('hour', 8)] as [string, number])
    .value()

  return [deribitTerms]
}

export const getExpirationTerm = (expiration: number) => {
  const term = moment(expiration).format('DDMMMYY').toUpperCase()

  return term.startsWith('0') ? term.slice(1) : term
}

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] }
}

export async function useRatesData(marketName: string, lyraClient: Lyra, filterSell = false) {
  const providers: ProviderType[] = [ProviderType.LYRA, ProviderType.DERIBIT]

  const [deribit, lyra] = await Promise.all([getDeribitRates(marketName), getLyraRates(marketName, lyraClient)])

  const rates = {
    [ProviderType.DERIBIT]: deribit,
    [ProviderType.LYRA]: lyra,
  }

  const allRates = chain(rates)
    .values()
    .flatten()
    .filter((optionsMap: OptionsMap) =>
      filterSell ? Object.values(pick(optionsMap, Object.values(OptionType))).some((option) => option?.bidPrice) : true,
    )
    .groupBy('term')
    .mapValues((optionsMap: OptionsMap) => groupBy(optionsMap, 'strike'))
    .value() as unknown as TermStrikesOptions

  const termProviders = chain(allRates)
    .mapValues((strikeOptions) => {
      const termProviders = chain(strikeOptions).values().max().map('provider').value()
      return providers.filter((provider) => termProviders.includes(provider))
    })
    .value()

  return { allRates, termProviders }
}
