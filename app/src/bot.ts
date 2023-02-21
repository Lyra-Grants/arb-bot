import { ethers } from 'ethers'
import { getBalance, getTokenBalance } from './actions/balance'
import { Tokens } from './constants/token'
import { ArbConfig } from './types/arbConfig'
import { Wallet } from './wallets/wallet'
import * as arbConfig from './strategies.json'
import { polling } from './strategy'
import getLyraSDK from './utils/getLyraSDK'
import { REPORT_ONLY } from './secrets'
import { BalancesTelegram } from './templates/balances'
import { TelegramClient } from './clients/telegramClient'
import { PostTelegram } from './integrations/telegram'
import { testRevertTradeDeribit, testRevertTradeLyra } from './test-trade'
import { Provider } from '@ethersproject/providers'
import { Network } from '@lyrafinance/lyra-js'

const networks = [Network.Arbitrum, Network.Optimism]

export async function Run() {
  const lyra = getLyraSDK(Network.Optimism)
  global.BALANCES = {}

  // read strats
  const config = readConfig()
  if (!config) {
    return
  }

  // get wallet balances / prices
  if (!REPORT_ONLY) {
    const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
    await Promise.all([getBalances(lyra.provider, signer, true)])
  }

  // await testRevertTradeLyra()
  // await testRevertTradeDeribit()

  networks.map(async (network) => {
    await polling(config, network)
  })
}

export const getBalances = async (provider: Provider, signer: ethers.Wallet, postTelegram: boolean) => {
  const ethBalance = await getBalance(signer.address, provider)
  global.BALANCES['ETH'] = ethBalance

  await Promise.all(
    Object.values(Tokens).map(async (value, index) => {
      const bal = await getTokenBalance(value, provider, signer)
      global.BALANCES[Object.keys(Tokens)[index] as string] = bal
    }),
  )
  if (postTelegram) {
    await PostTelegram(BalancesTelegram(global.BALANCES), TelegramClient)
  }
}

export function readConfig(): ArbConfig | undefined {
  try {
    const config: ArbConfig = arbConfig as unknown as ArbConfig
    return config
  } catch (ex) {
    console.log('Error Reading Config')
    console.log(ex)
    return undefined
  }
}
