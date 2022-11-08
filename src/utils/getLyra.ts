import Lyra from '@lyrafinance/lyra-js'
import { optimismInfuraProvider } from '../clients/ethersClient'

export default function getLyra(): Lyra {
  const lyra = new Lyra({
    provider: optimismInfuraProvider,
    subgraphUri: 'https://api.thegraph.com/subgraphs/name/lyra-finance/mainnet',
  })
  return lyra
}
