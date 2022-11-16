import { Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { getBalance, getTokenBalance } from './actions/balance'
import { Tokens } from './constants/token'
import { GetPrice } from './integrations/coingecko'
import { ArbConfig } from './types/arbConfig'
import { Wallet } from './wallets/wallet'
import * as arbConfig from './strategy/strategy.json'
import { polling } from './strategy'
import getLyra from './utils/getLyra'

export async function goBot() {
  const lyra = getLyra()

  // read strats
  const config = readConfig()
  if (!config) {
    return
  }

  // get wallet balances / prices
  if (!REPORT_ONLY) {
    const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
    await Promise.all([getBalances(lyra.provider, signer), GetPrice()])
  } else {
    await GetPrice()
  }

  polling(config)
}

export const getBalances = async (provider: Provider, signer: ethers.Wallet) => {
  console.log('Balances:')

  const ethBalance = await getBalance(signer.address, provider)
  console.log(`Eth: ${ethBalance}`)

  Object.values(Tokens).map(async (value, index) => {
    const bal = await getTokenBalance(value, provider, signer)
    console.log(`${Object.keys(Tokens)[index]}: ${bal}`)
  })
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
