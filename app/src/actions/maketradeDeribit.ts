import { RpcWebSocketClient } from 'rpc-websocket-client'
import { getDeribitUrl } from '../providers/deribit'
import {
  DERIBIT_CLIENT_ID,
  DERIBIT_CLIENT_SECRET,
  DERIBIT_TESTNET,
  DERIBIT_TESTNET_CLIENT_ID,
  DERIBIT_TESTNET_CLIENT_SECRET,
} from '../config'
import { ProviderType } from '../types/arbs'
import { DeribitError, DeribitResult, DeribitTradeArgs, DeribitTradeResult } from '../types/lyra'
import { TradeResult } from '../types/trade'
import { defaultResult } from './maketrade'

// DOCS: https://docs.deribit.com/?javascript#private-get_settlement_history_by_currency

export enum DeribitMethods {
  PrivateBuy = '/private/buy',
  PrivateSell = '/private/sell',
  PublicAuth = '/public/auth',
}

export enum DeribitOrderType {
  Limit = 'limit',
  Market = 'market',
}

export async function authenticateAndTradeDeribit(args: DeribitTradeArgs): Promise<DeribitResult> {
  const rpc = new RpcWebSocketClient()
  await rpc.connect(getDeribitUrl())
  console.log(`Deribit ${DERIBIT_TESTNET ? 'TESTNET' : ''}: Connected!`)

  const config = getAuthConfig()
  const tradeConfig = getTradeConfig(args)

  // authenticate
  const auth = rpc
    .call(config.method, config.params)
    .then((data) => {
      console.log(data)
      console.log(`Deribit ${DERIBIT_TESTNET ? 'TESTNET' : ''}: Authenticated!`)
    })
    .catch((err) => {
      console.log(err)
    })

  // trade
  let tradeError = false
  const trade = rpc
    .call(tradeConfig.method, tradeConfig.params)
    .then((data) => {
      console.log(`Deribit ${DERIBIT_TESTNET ? 'TESTNET' : ''}: Trade!`)
      try {
        return data
      } catch (ex) {
        tradeError = true
        const error: DeribitError = {
          message: `Deribit Error`,
          code: -1,
        }
        console.log(ex)
        return error
      }
    })
    .catch((err) => {
      tradeError = true
      return err
    })
    .finally(() => rpc.ws.close())

  const [, tradeResult] = await Promise.all([auth, trade])

  const result: DeribitResult = {
    tradeError: tradeError,
    deribitError: tradeError ? (tradeResult as DeribitError) : undefined,
    deribitTradeResult: tradeError ? undefined : (tradeResult as DeribitTradeResult),
  }
  return result
}

export const makeTradeDeribit = async (args: DeribitTradeArgs): Promise<TradeResult> => {
  const deribitResponse = await authenticateAndTradeDeribit(args)
  console.log('--RESPONSE--')
  console.log(deribitResponse)
  console.log('--END-RESPONSE--')

  // deal with error when trading
  if (deribitResponse.tradeError) {
    const result: TradeResult = {
      isSuccess: false,
      pricePerOption: 0,
      failReason: deribitResponse.deribitError?.message ?? '',
      provider: ProviderType.DERIBIT,
      deribitResult: undefined,
      lyraResult: undefined,
    }
    return result
  }

  // todo: deal with market order posted but no response
  // check if any trades
  const isSuccess = deribitResponse?.deribitTradeResult?.trades
    ? deribitResponse?.deribitTradeResult.trades?.length > 0
    : false

  if (!isSuccess) {
    return defaultResult(ProviderType.DERIBIT, 'Market Order, no trade filled.')
  }

  // should this aggregated?
  const trade = deribitResponse?.deribitTradeResult?.trades[0]

  if (trade) {
    // SUCCESSFULL TRADE Boom!
    const result: TradeResult = {
      isSuccess: true,
      pricePerOption: trade?.price * trade?.index_price,
      failReason: '',
      provider: ProviderType.DERIBIT,
      deribitResult: deribitResponse.deribitTradeResult,
      lyraResult: undefined,
    }
    return result
  }
  return defaultResult(ProviderType.DERIBIT, 'Unknown Error.')
}

export function getTradeConfig(args: DeribitTradeArgs) {
  const config = {
    method: args.buy ? DeribitMethods.PrivateBuy : DeribitMethods.PrivateSell,
    params: {
      instrument_name: args.instrumentName,
      amount: args.amount,
      type: DeribitOrderType.Market,
    },
  }
  return config
}

export function getAuthConfig() {
  const config = {
    method: DeribitMethods.PublicAuth,
    params: {
      grant_type: 'client_credentials',
      client_id: DERIBIT_TESTNET ? DERIBIT_TESTNET_CLIENT_ID : DERIBIT_CLIENT_ID,
      client_secret: DERIBIT_TESTNET ? DERIBIT_TESTNET_CLIENT_SECRET : DERIBIT_CLIENT_SECRET,
    },
  }
  return config
}
