import { Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { getBalance, getTokenBalance } from './actions/balance'
import { TokenNames, Tokens } from './constants/token'
import { GetPrice } from './integrations/coingecko'
import { ArbConfig, Strategy } from './types/arbConfig'
import { Wallet } from './wallets/wallet'
import * as arbConfig from './strategies.json'
import { polling, reportTrade } from './strategy'
import getLyra from './utils/getLyra'
import { REPORT_ONLY } from './secrets'
import { BalancesTelegram } from './templates/balances'
import { TelegramClient } from './clients/telegramClient'
import { PostTelegram } from './integrations/telegram'
import { authenticateAndTradeDeribit, makeTradeDeribit } from './actions/maketradeDeribit'
import { Arb, DeribitTradeArgs, LyraTradeArgs } from './types/lyra'
import printObject from './utils/printObject'
import { OptionType, Underlying } from './types/arbs'
import { makeTradeLyra } from './actions/maketrade'
import { testRevertTradeDeribit, testRevertTradeLyra } from './test-trade'

export async function goBot() {
  const lyra = getLyra()
  global.BALANCES = {}

  // read strats
  const config = readConfig()
  if (!config) {
    return
  }

  // get wallet balances / prices
  if (!REPORT_ONLY) {
    const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
    await Promise.all([getBalances(lyra.provider, signer)])
  }

  // test trade reverts
  await testRevertTradeLyra()

  // test
  await testRevertTradeDeribit()

  //await polling(config)
}

export const getBalances = async (provider: Provider, signer: ethers.Wallet) => {
  const ethBalance = await getBalance(signer.address, provider)
  global.BALANCES['ETH'] = ethBalance

  await Promise.all(
    Object.values(Tokens).map(async (value, index) => {
      const bal = await getTokenBalance(value, provider, signer)
      global.BALANCES[Object.keys(Tokens)[index] as string] = bal
    }),
  )

  await PostTelegram(BalancesTelegram(global.BALANCES), TelegramClient)
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
