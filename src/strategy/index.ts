import { makeTradeLyra } from '../actions/maketrade'
import { makeTradeDeribit } from '../actions/maketradeDeribit'
import { TelegramClient } from '../clients/telegramClient'
import { TokenNames } from '../constants/token'
import { GetMarketPrice } from '../integrations/coingecko'
import { PostTelegram } from '../integrations/telegram'
import { GetArbitrageDeals } from '../lyra/arbitrage'
import { REPORT_ONLY } from '../secrets'
import { ArbTelegram } from '../templates/arb'
import { TradeTelegram } from '../templates/trade'
import { ArbConfig, Strategy } from '../types/arbConfig'
import { OptionType, ProviderType } from '../types/arbs'
import { Arb, ArbDto, DeribitTradeArgs, LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'
import printObject from '../utils/printObject'

export async function polling(config: ArbConfig) {
  const ms = config?.pollingInterval ? config?.pollingInterval * 60000 : 300000
  console.debug(`Polling every ${ms / 60000} mins`)

  const poll = async () => {
    try {
      await Promise.all([
        config.strategy.map(async (strat) => {
          executeStrat(strat)
        }),
      ])
    } catch (e) {
      console.warn('Failed to poll')
    }

    setTimeout(poll, ms)
  }

  await poll()
}

export async function executeStrat(strategy: Strategy) {
  const arbDto = await GetArbitrageDeals(strategy)

  //printObject(arbDto)

  arbDto.spot = GetMarketPrice(arbDto.market)
  arbDto.arbs = filterArbs(arbDto, strategy) ?? []

  if (arbDto.arbs.length == 0) {
    console.log('No arb available')
    return
  }

  if (REPORT_ONLY) {
    // REPORT
    // console.log('----')
    // console.log(arbDto.arbs)
    // console.log('----')
    await PostTelegram(ArbTelegram(arbDto, strategy), TelegramClient)
  } else {
    // EXECUTE
    // only execute top 1 arb
    if (strategy.mostProfitableOnly) {
      //printObject(arbDto.arbs[0])
      await executeArb(arbDto.arbs[0], strategy)
    } else {
      // execute all arbs
      arbDto.arbs.map(async (arb) => {
        await executeArb(arb, strategy)
      })
    }
  }
}

export async function executeArb(arb: Arb, strategy: Strategy) {
  const result1 = await tradeSide(arb, strategy, strategy.isBuyFirst)
  if (!result1.isSuccess) {
    // don't do 2nd part of trade
    // retry?
    return
  }

  const result2 = await trade(arb, strategy, !strategy.isBuyFirst)
  if (!result2.isSuccess) {
    // todo: undo first trade?
    return
  }

  console.log('Arb Success')
  //todo: report success
}

export async function tradeSide(arb: Arb, strategy: Strategy, isBuy: boolean) {
  const result = await trade(arb, strategy, isBuy)
  if (!result.isSuccess) {
    console.log(`${isBuy ? 'Buy' : 'Sell'} failed: ${result.failReason}`)
  }
  return result
}

export function filterArbs(arbDto: ArbDto, strategy: Strategy) {
  console.log('filtering arbs')

  console.log(arbDto.arbs)
  if (arbDto.arbs.length > 0) {
    return arbDto.arbs
      .filter((x) => strategy.optionTypes.includes(x.type)) // CALL / PUT or BOTH
      .filter((x) => x.apy >= strategy.minAPY) // MIN APY
      .filter((x) => (strategy.sellLyraOnly ? x.sell.provider == ProviderType.LYRA : true)) // SELL on LYRA Only
      .filter(
        (x) =>
          strategy.spotStrikeDiff === 0 ??
          (x.type == OptionType.CALL ? x.strike - arbDto.spot : arbDto.spot - x.strike) >= strategy.spotStrikeDiff,
      )
  }
  return []
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
    return await tradeDeribit(arb, strategy, size, isBuy)
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

export async function reportTrade(
  arb: Arb,
  tradeResult: TradeResult,
  strategy: Strategy,
  size: number,
  isBuy: boolean,
) {
  await PostTelegram(TradeTelegram(arb, tradeResult, strategy, size, isBuy), TelegramClient)
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
  await reportTrade(arb, result, strategy, size, isBuy)
  return result
}

export async function tradeDeribit(arb: Arb, strategy: Strategy, size: number, isBuy = true) {
  const args: DeribitTradeArgs = {
    amount: size,
    instrumentName: isBuy ? (arb.buy.id as string) : (arb.sell.id as string),
    buy: isBuy,
  }

  const result = await makeTradeDeribit(args)
  await reportTrade(arb, result, strategy, size, isBuy)
  return result
}

export const getSize = (strategy: Strategy) => {
  // number of contracts to purchase
  // todo more complex rules around sizing
  // eg. check depth of orderbook on deribit
  // check slippage on Lyra
  // at moment just return default from config

  return strategy.tradeSize
}
