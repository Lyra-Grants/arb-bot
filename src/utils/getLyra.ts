import Lyra from '@lyrafinance/lyra-js'
import { alchemyProvider } from '../clients/ethersClient'

export default function getLyra(): Lyra {
  const lyra = new Lyra({
    provider: alchemyProvider,
  })
  return lyra
}
