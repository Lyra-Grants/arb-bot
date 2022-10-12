import Lyra from '@lyrafinance/lyra-js'
import { optimismInfuraProvider } from './clients/ethersClient'
import { GetPrice } from './integrations/coingecko'
import { GetArbitrageDeals } from './lyra/arbitrage'

import { TESTNET } from './secrets'
import printObject from './utils/printObject'

export async function initializeLyraBot() {
  const lyra = new Lyra({
    provider: optimismInfuraProvider,
    subgraphUri: 'https://api.thegraph.com/subgraphs/name/lyra-finance/mainnet',
    blockSubgraphUri: 'https://api.thegraph.com/subgraphs/name/lyra-finance/optimism-mainnet-blocks',
  })

  if (TESTNET) {
    //const signer = new ethers.Wallet(TestWallet().privateKey, lyraClient.provider)
    //faucet(lyraClient, signer)
    //maketrade(lyraClient, signer)
  }

  await GetPrice()
  const arbEth = await GetArbitrageDeals(lyra, 'eth')
  printObject(arbEth)
  const arbBtc = await GetArbitrageDeals(lyra, 'btc')
  printObject(arbBtc)
  const arbSol = await GetArbitrageDeals(lyra, 'sol')
  printObject(arbSol)
}
