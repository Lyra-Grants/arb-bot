import { Provider } from '@ethersproject/providers'
import Lyra from '@lyrafinance/lyra-js'
import { ethers } from 'ethers'
import { getBalance, getTokenBalance } from './actions/balance'
import { makeTradeLyra } from './actions/maketrade'
import { optimismInfuraProvider } from './clients/ethersClient'
import { TokenNames, Tokens } from './constants/token'
import { GetPrice } from './integrations/coingecko'
import { GetArbitrageDeals } from './lyra/arbitrage'
import { ArbConfig, ColatPercent } from './types/arbConfig'
import { OptionType, ProviderType, Underlying } from './types/arbs'
import { Arb, ArbDto, DeribitTradeArgs, LyraTradeArgs } from './types/lyra'
import { TradeResult } from './types/trade'
import printObject from './utils/printObject'
import { Wallet } from './wallets/wallet'
import { makeTradeDeribit } from './actions/maketradeDeribit'

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
    colatPercent: ColatPercent.Fifty,
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
  await trade(arb, Underlying.ETH, lyra, signer, config, true)

  // SELL SIDE
  await trade(arb, Underlying.ETH, lyra, signer, config, false)
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
  config: ArbConfig,
  isBuy = true,
): Promise<TradeResult> {
  const provider = isBuy ? arb?.buy.provider : arb.sell.provider

  if (provider === ProviderType.LYRA) {
    // return {
    //   isSuccess: false,
    //   pricePerOption: 0,
    //   failReason: '',
    //   provider: provider,
    // }
    return await tradeLyra(arb, market, lyra, signer, config, isBuy)
  } else {
    return await tradeDeribit(arb, isBuy)
  }
}

export function filterArbs(arbDto: ArbDto) {
  // todo use config to filter the arbs
  // for now just get first one
  if (arbDto.arbs.length > 0) {
    return arbDto.arbs.filter((x) => x.type === OptionType.CALL)[0]
  }
}

export const calcColateral = (arb: Arb, size: number, colatPercent: ColatPercent, lyra: Lyra) => {
  // get collat / ranges
  // todo not working - comes out of range
  // hits too much colateral

  if (arb.type === OptionType.PUT) {
    const cashColat = ((arb.strike * size) / 100) * colatPercent
    console.log(`PUT collat: ${cashColat}`)
    return cashColat
  } else {
    const baseColat = (size / 100) * colatPercent
    console.log(`CALL collat: ${baseColat}`)
    return baseColat
  }
}

export const tradeLyra = async (
  arb: Arb,
  market: Underlying,
  lyra: Lyra,
  signer: ethers.Wallet,
  config: ArbConfig,
  isBuy = true,
) => {
  // sell on Lyra
  console.log(arb)
  const size = 0.001

  const colat = calcColateral(arb, size, config.colatPercent, lyra)

  const tradeArgs: LyraTradeArgs = {
    size: size,
    market: market,
    call: arb.type == OptionType.CALL,
    buy: isBuy,
    strike: isBuy ? (arb.buy.id as number) : (arb.sell.id as number),
    collat: colat,
    base: true,
    stable: TokenNames.sUSD,
  }

  const result = await makeTradeLyra(lyra, signer, tradeArgs)
  return result
}

export async function tradeDeribit(arb: Arb, isBuy = true) {
  const amount = 1 // eth minimum 1 contract
  console.log(arb)

  const args: DeribitTradeArgs = {
    amount: amount,
    instrumentName: isBuy ? (arb.buy.id as string) : (arb.sell.id as string),
    buy: isBuy,
  }

  const result = await makeTradeDeribit(args)
  return result
}
