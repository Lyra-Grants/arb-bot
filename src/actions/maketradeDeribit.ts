import { RpcWebSocketClient } from 'rpc-websocket-client'
import { deribitUrl } from '../constants/api'
import { DeribitItem } from '../providers/deribit'
import { DERIBIT_CLIENT_ID, DERIBIT_CLIENT_SECRET } from '../secrets'
import { ProviderType, Underlying } from '../types/arbs'
import { TradeResult } from '../types/trade'
import { defaultResult } from './maketrade'

const authConfig = {
  method: 'public/auth',
  params: {
    grant_type: 'client_credentials',
    client_id: DERIBIT_CLIENT_ID,
    client_secret: DERIBIT_CLIENT_SECRET,
  },
}
// DOCS: https://docs.deribit.com/?javascript#private-get_settlement_history_by_currency

export async function authenticateDeribit(market: Underlying) {
  const rpc = new RpcWebSocketClient()
  await rpc.connect(deribitUrl)
  console.log('Get Deribit Options: Connected!')

  const config = authConfig

  await rpc
    .call(config.method, config.params)
    .then((data) => {
      console.log(data)
      rpc.ws.close()
    })
    .catch((err) => {
      console.log(err)
    })
}

export const makeTradeDeribit = async (): Promise<TradeResult> => {
  const result = defaultResult(ProviderType.DERIBIT)

  // todo -> implement DERIBIT BUY

  return result
}
