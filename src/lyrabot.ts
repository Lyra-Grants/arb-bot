import { Provider } from '@ethersproject/providers'
import Lyra from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { getBalance, getTokenBalance } from './actions/balance'
import { makeTradeDeribit, makeTradeLyra } from './actions/maketrade'
import { optimismInfuraProvider } from './clients/ethersClient'
import { TokenNames, Tokens } from './constants/token'
import { GetPrice } from './integrations/coingecko'
import { GetArbitrageDeals } from './lyra/arbitrage'
import { ArbConfig } from './types/arbConfig'
import { OptionType, ProviderType, Underlying } from './types/arbs'
import { Arb, ArbDto, LyraTradeArgs } from './types/lyra'
import { TradeResult } from './types/trade'
import printObject from './utils/printObject'
import { Wallet } from './wallets/wallet'

export async function initializeLyraBot() {
  const lyra = new Lyra({
    provider: optimismInfuraProvider,
    subgraphUri: 'https://api.thegraph.com/subgraphs/name/lyra-finance/mainnet',
    blockSubgraphUri: 'https://api.thegraph.com/subgraphs/name/lyra-finance/optimism-mainnet-blocks',
  })

  const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
  await getBalances(lyra.provider, signer)

  // created a default config
  const config: ArbConfig = {
    markets: [Underlying.ETH],
    optionTypes: [OptionType.CALL, OptionType.PUT],
    profitThreshold: 0,
  }

  await GetPrice()
  const arbs = await GetArbitrageDeals(config, lyra, Underlying.ETH)
  //printObject(arbs)
  //const arbBtc = await GetArbitrageDeals(lyra, 'btc')
  //printObject(arbBtc)
  //const arbSol = await GetArbitrageDeals(lyra, 'sol')
  //printObject(arbSol)

  // pick an arb to perform
  const arb = filterArbs(arbs)

  if (!arb) {
    console.log('No arb available')
    return
  }

  // BUY SIDE
  //await trade(arb, Underlying.ETH, lyra, signer, true)

  // // SELL SIDE
  await trade(arb, Underlying.ETH, lyra, signer, false)
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

export async function trade(
  arb: Arb,
  market: Underlying,
  lyra: Lyra,
  signer: ethers.Wallet,
  isBuy = true,
): Promise<TradeResult> {
  const provider = isBuy ? arb?.buy.provider : arb.sell.provider

  if (provider === ProviderType.LYRA) {
    return await tradeLyra(arb, market, lyra, signer, isBuy)
  } else {
    return await tradeDeribit(arb, market, isBuy)
  }
}

export function filterArbs(arbDto: ArbDto) {
  // todo use config to filter the arbs
  // for now just get first one
  if (arbDto.arbs.length > 0) {
    return arbDto.arbs.filter((x) => x.type === OptionType.CALL)[0]
  }
}

export async function tradeLyra(arb: Arb, market: Underlying, lyra: Lyra, signer: ethers.Wallet, isBuy = true) {
  // sell on Lyra

  console.log(arb)

  const amount = 0.001

  // todo COLAT is different for CALL / PUTS
  // PUTS -> based on STRIKE x Size = 100% colat
  // CALLS -> covered call amount of base

  const colat = 0.001

  const tradeArgs: LyraTradeArgs = {
    amount: amount, // how to determine size?
    market: market,
    call: arb.type == OptionType.CALL,
    buy: isBuy,
    strike: isBuy ? arb.buy.id : arb.sell.id,
    collat: colat,
    base: true,
    stable: TokenNames.sUSD,
  }

  const result = await makeTradeLyra(lyra, signer, tradeArgs)
  return result
}

export async function tradeDeribit(arb: Arb, market: Underlying, isBuy = true) {
  //todo implement trade
  // sell on Lyra

  console.log(arb)

  const amount = 0.001
  const colat = 0.001

  const result = await makeTradeDeribit()
  return result
}
