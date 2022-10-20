import moment from 'moment'
import { pick } from 'lodash'
import { Instrument, OptionsMap, OptionType, ProviderType, Underlying } from '../../types/arbs'
import { RpcWebSocketClient } from 'rpc-websocket-client'
import { GetPrice } from '../../lyra/arbitrage'
import { deribitUrl, deribitUrlTestnet } from '../../constants/api'
import { DERIBIT_TESTNET } from '../../secrets'

// const authRequest = {
//   jsonrpc: "2.0",
//   id: 9929,
//   method: "public/auth",
//   params: {
//     grant_type: "client_credentials",
//     client_id: "id",
//     client_secret: "secret",
//   },
// };

// DOCS: https://docs.deribit.com/?javascript#private-get_settlement_history_by_currency

const options = {
  method: 'public/get_book_summary_by_currency',
  params: {
    currency: 'ETH',
    kind: 'option',
  },
}

// const btcOptions = {
//   method: 'public/get_book_summary_by_currency',
//   params: {
//     currency: 'BTC',
//     kind: 'option',
//   },
// }

// const solOptions = {
//   method: 'public/get_book_summary_by_currency',
//   params: {
//     currency: 'SOL',
//     kind: 'option',
//   },
// }

//     @ response data
//     ask_price: null,
//     base_currency: "ETH",
//     bid_price: 0.001,
//     creation_timestamp: 1652457190958,
//     estimated_delivery_price: 2090.99,
//     high: null,
//     instrument_name: "ETH-27MAY22-2400-C",
//     interest_rate: 0,
//     last: 0.1855,
//     low: null,
//     mark_price: 0.006397,
//     mid_price: null,
//     open_interest: 0,
//     price_change: null,
//     quote_currency: "ETH",
//     underlying_index: "SYN.ETH-27MAY22",
//     underlying_price: 2093.2846136477665,
//     volume: 0,
export type DeribitItem = {
  ask_price: null | number
  bid_price: null | number
  mid_price: null | number
  mark_price: number
  base_currency: string
  creation_timestamp: number
  estimated_delivery_price: number
  high: null
  instrument_name: string
  interest_rate: number
  last: number
  low: number
  open_interest: number
  price_change: null
  quote_currency: string
  underlying_index: string
  underlying_price: number
  volume: number
}

const parseDeribitOption = (
  { instrument_name, ask_price, bid_price, mid_price }: DeribitItem,
  ethPrice: number,
): Instrument & Pick<OptionsMap, 'term' | 'strike' | 'expiration'> => {
  // 'ETH-27MAY22-2400-C'
  const [, term, strike, callOrPut] = instrument_name.split('-')

  return {
    provider: ProviderType.DERIBIT,
    term,
    strike: parseFloat(strike),
    type: callOrPut === 'P' ? OptionType.PUT : OptionType.CALL,
    expiration: +moment(term, 'DDMMMYY'),
    askPrice: (ask_price ?? 0) * ethPrice,
    midPrice: (mid_price ?? 0) * ethPrice,
    bidPrice: (bid_price ?? 0) * ethPrice,
    id: instrument_name,
  }
}

async function useDeribitData(market: Underlying) {
  let marketData: DeribitItem[] = []
  const rpc = new RpcWebSocketClient()
  await rpc.connect(getDeribitUrl())
  console.log('Get Deribit Options: Connected!')

  options.params.currency = market
  const config = options

  await rpc
    .call(config.method, config.params)
    .then((data) => {
      marketData = data as DeribitItem[]
      rpc.ws.close()
    })
    .catch((err) => {
      console.log(err)
    })

  return [marketData]
}

export async function getDeribitRates(market: Underlying) {
  const [data] = await useDeribitData(market)
  const price = GetPrice(market)

  const optionsMap = data
    .filter(({ mid_price, ask_price, bid_price }) => ask_price && bid_price)
    .map((item) => parseDeribitOption(item, price))
    .reduce<OptionsMap[]>((acc, option) => {
      const found = acc.find(({ term, strike }) => option.term === term && option.strike === strike)

      if (found) {
        found[option.type] = option as any
      } else {
        acc.push({
          ...pick(option, ['term', 'strike', 'expiration', 'provider', 'id']),
          [option.type]: option,
        })
      }

      return acc
    }, [])
  // console.log('------------DERIBIT-------------')
  // console.log(optionsMap)
  // console.log('------------DERIBIT END-------------')

  return optionsMap
}

export function getDeribitUrl() {
  if (DERIBIT_TESTNET) {
    return deribitUrlTestnet
  }
  return deribitUrl
}
