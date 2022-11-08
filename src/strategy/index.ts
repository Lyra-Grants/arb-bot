import { makeTradeLyra } from '../actions/maketrade'
import { makeTradeDeribit } from '../actions/maketradeDeribit'
import { TelegramClient } from '../clients/telegramClient'
import { TokenNames } from '../constants/token'
import { PostTelegram } from '../integrations/telegram'
import { GetArbitrageDeals } from '../lyra/arbitrage'
import { ArbTelegram } from '../templates/arb'
import { Strategy } from '../types/arbConfig'
import { OptionType, ProviderType } from '../types/arbs'
import { Arb, ArbDto, DeribitTradeArgs, LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'

export async function executeStrat(strategy: Strategy) {
  const arbs = await GetArbitrageDeals(strategy)

  if (REPORT_ONLY) {
    // TELEGRAM REPORT
    await PostTelegram(ArbTelegram(arbs), TelegramClient)
  } else {
    const arb = filterArbs(arbs)

    if (!arb) {
      console.log('No arb available')
      return
    }
    await executeArb(arb, strategy)
    //  console.log(arb)
  }
}

export async function executeArb(arb: Arb, strategy: Strategy) {
  // BUY SIDE
  const buyResult = await trade(arb, strategy, true)
  if (!buyResult.isSuccess) {
    console.log(`Buy failed: ${buyResult.failReason}`)
    return
  }

  // // SELL SIDE
  const sellResult = await trade(arb, strategy, false)
  if (!sellResult.isSuccess) {
    console.log(`Sell failed: ${sellResult.failReason}`)
    return
  }
}

export function filterArbs(arbDto: ArbDto) {
  // todo use config to filter the arbs
  // for now just get first one
  if (arbDto.arbs.length > 0) {
    //arbDto.arbs.filter((x) => x.type === OptionType.CALL)

    return arbDto.arbs[0]
  }
}

// return {
//   isSuccess: false,
//   pricePerOption: 0,
//   failReason: '',
//   provider: provider,
// }

export async function trade(arb: Arb, strategy: Strategy, isBuy = true): Promise<TradeResult> {
  const provider = isBuy ? arb?.buy.provider : arb.sell.provider
  const size = getSize(strategy)

  if (provider === ProviderType.LYRA) {
    return await tradeLyra(arb, strategy, size, isBuy)
  } else {
    return await tradeDeribit(arb, size, isBuy)
  }
}

export const calcColateral = (arb: Arb, strategy: Strategy, size: number, isBuy: boolean) => {
  // get collat / ranges
  // todo not working - comes out of range
  // hits too much colateral

  // Collat only required for sells
  if (isBuy) {
    return 0
  }

  if (arb.type === OptionType.PUT) {
    const cashColat = ((arb.strike * size) / 100) * strategy.colatPercent
    console.log(`PUT collat: ${cashColat}`)
    return cashColat
  } else {
    const baseColat = (size / 100) * strategy.colatPercent
    console.log(`CALL collat: ${baseColat}`)
    return baseColat
  }
}

export const tradeLyra = async (arb: Arb, strategy: Strategy, size: number, isBuy = true) => {
  const colat = calcColateral(arb, strategy, size, isBuy)

  const tradeArgs: LyraTradeArgs = {
    size: size,
    market: strategy.market,
    call: arb.type == OptionType.CALL,
    buy: isBuy,
    strike: isBuy ? (arb.buy.id as number) : (arb.sell.id as number),
    collat: colat,
    base: true,
    stable: TokenNames.sUSD,
  }

  const result = await makeTradeLyra(tradeArgs)
  return result
}

export async function tradeDeribit(arb: Arb, size: number, isBuy = true) {
  const args: DeribitTradeArgs = {
    amount: size,
    instrumentName: isBuy ? (arb.buy.id as string) : (arb.sell.id as string),
    buy: isBuy,
  }

  const result = await makeTradeDeribit(args)
  return result
}

export const getSize = (strategy: Strategy) => {
  // number of contracts to purchase
  // todo more complex rules around sizing
  // eg. check depth of orderbook on deribit
  // check slippage on Lyra
  // at moment just return default from config

  return strategy.defaultTradeSize
}
