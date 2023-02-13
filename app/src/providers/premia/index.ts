import { BigNumber, Contract } from 'ethers'
import { useExpirations, useStrikes } from '../../utils/arbUtils'
import { fixedFromFloat, fixedToNumber } from '../../utils/fixedMath'
import premiaPoolAbi from './premiaPoolAbi.json'
import { OptionsMap, OptionType, ProviderType } from '../../types/arbs'
import printObject from '../../utils/printObject'
import getLyra from 'src/utils/getLyraSDK'
import { Network } from '@lyrafinance/lyra-js'

// todo hook this up to infura
// todo => update to support both networks
const provider = getLyra(Network.Optimism).provider
const ethPoolContract = new Contract('0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a', premiaPoolAbi, provider)

const convertPrice = ([price, fee]: [price: BigNumber, fee: BigNumber]) => fixedToNumber(price) + fixedToNumber(fee)

const reqOption = async (strike: number, expiration: number, call: boolean) => {
  const expSecs = Math.floor(expiration / 1000)

  return ethPoolContract
    .quote(
      '0x0000000000000000000000000000000000000000',
      BigNumber.from(expSecs),
      fixedFromFloat(strike),
      '1000000000000000000',
      call,
    )
    .then(convertPrice)
    .catch(console.error)
}

export async function getPremiaRates(lyraRates?: OptionsMap[]): Promise<OptionsMap[] | undefined> {
  const [expirations] = useExpirations(lyraRates, 1)
  console.log(expirations)
  const { allStrikes = [], callStrikes = [], putStrikes = [], basePrice = 0 } = useStrikes()

  const toEth = (val: number) => basePrice * val
  console.log(toEth)

  if (!(callStrikes && putStrikes && allStrikes)) return undefined

  const requests = expirations.map(([term, exp]) =>
    allStrikes.map(async (strike) => {
      const instrumentMeta = {
        provider: ProviderType.PREMIA,
        expiration: exp,
        term,
        strike: strike,
      }

      console.log(instrumentMeta)
      return {
        ...instrumentMeta,
        [OptionType.CALL]: callStrikes.includes(strike)
          ? {
              ...instrumentMeta,
              type: OptionType.CALL,
              askPrice: await reqOption(strike, exp, true).then(toEth),
            }
          : undefined,
        [OptionType.PUT]: putStrikes.includes(strike)
          ? {
              ...instrumentMeta,
              type: OptionType.PUT,
              askPrice: await reqOption(strike, exp, false),
            }
          : undefined,
      } as OptionsMap
    }),
  )

  const data = await Promise.all(requests.flat())
  printObject(data)
  return data
}
