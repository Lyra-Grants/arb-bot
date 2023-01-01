import { ethers } from 'ethers'
import { defaultResult, makeTradeLyra } from '../actions/maketrade'
import { makeTradeDeribit } from '../actions/maketradeDeribit'
import { getBalances } from '../bot'
import { TelegramClient } from '../clients/telegramClient'
import { TokenNames } from '../constants/token'
import { GetMarketPrice, GetSpotPrice } from '../integrations/coingecko'
import { PostTelegram } from '../integrations/telegram'
import { GetArbitrageDeals } from '../lyra/arbitrage'
import { REPORT_ONLY } from '../secrets'
import { ArbTelegram } from '../templates/arb'
import { TradeTelegram } from '../templates/trade'
import { ArbConfig, Strategy } from '../types/arbConfig'
import { OptionType, ProviderType, Underlying } from '../types/arbs'
import { Arb, ArbDto, DeribitTradeArgs, LyraTradeArgs } from '../types/lyra'
import { TradeResult } from '../types/trade'
import getLyra from '../utils/getLyra'
import printObject from '../utils/printObject'
import { Wallet } from '../wallets/wallet'

export async function polling(config: ArbConfig) {
  const ms = config?.pollingInterval ? config?.pollingInterval * 60000 : 300000
  console.debug(`Polling every ${ms / 60000} mins`)

  //await GetSpotPrice()
  // await Promise.all([
  //   config.strategy.map(async (strat) => {
  //     reportStrat(strat)
  //   }),
  // ])

  const poll = async () => {
    try {
      await GetSpotPrice()
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

export async function reportStrat(strategy: Strategy) {
  const arbDto: ArbDto = {
    arbs: [],
    market: strategy.market,
  }

  const spot = GetMarketPrice(arbDto.market)

  await PostTelegram(ArbTelegram(arbDto, strategy, spot, true), TelegramClient)
}

export async function executeStrat(strategy: Strategy) {
  const arbDto = await GetArbitrageDeals(strategy)
  //printObject(arbDto)

  const spot = GetMarketPrice(arbDto.market)
  arbDto.arbs = filterArbs(arbDto, strategy, spot) ?? []

  if (arbDto.arbs.length == 0) {
    console.log('No arb available')
    return
  }

  if (REPORT_ONLY) {
    await PostTelegram(ArbTelegram(arbDto, strategy, spot, false), TelegramClient)
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
    // shut down after execution
    process.exit()
  }
}

export async function executeArb(arb: Arb, strategy: Strategy) {
  const revertTrade = false
  let positionId = 0
  const isBuy = strategy.isBuyFirst
  console.log('-----------------------------------------------')
  console.log('First TradeLeg')
  console.log('-----------------------------------------------')
  const result1 = await tradeSide(arb, strategy, isBuy, revertTrade, positionId)
  if (!result1?.isSuccess) {
    // don't do 2nd part of trade, retry?
    console.log('ARB FAIL - 1st Leg Failed.')
    return
  }

  console.log('-----------------------------------------------')
  console.log('Second TradeLeg')
  console.log('-----------------------------------------------')
  const result2 = await tradeSide(arb, strategy, !isBuy, revertTrade, positionId)
  if (!result2?.isSuccess) {
    console.log('-----------------------------------------------')
    console.log('Reverting FirstTrade')
    console.log('-----------------------------------------------')
    positionId = result1.lyraResult ? result1.lyraResult.positionId : 0
    console.log(`PositionId: ${positionId}`)
    // revert 1st leg
    await tradeSide(arb, strategy, isBuy, !revertTrade, positionId)
    console.log('ARB FAIL - 2nd Leg Failed.')
    return
  }

  console.log('ARB SUCCESS - BOTH TRADES EXECUTED')
  //todo: report success
}

export async function tradeSide(
  arb: Arb,
  strategy: Strategy,
  isBuy: boolean,
  revertTrade: boolean,
  positionId: number,
) {
  const result = await trade(arb, strategy, positionId, isBuy, revertTrade)
  if (!result?.isSuccess) {
    console.log(`${isBuy ? 'Buy' : 'Sell'} failed: ${result?.failReason}`)
  } else {
    console.log(`TRADE SIDE SUCCESS`)
  }
  return result
}

export function filterArbs(arbDto: ArbDto, strategy: Strategy, spot: number) {
  printObject(arbDto)

  if (arbDto.arbs.length > 0) {
    return arbDto.arbs
      .filter((x) => strategy.optionTypes.includes(x.type)) // CALL / PUT or BOTH
      .filter((x) => x.apy >= strategy.minAPY) // MIN APY
      .filter((x) => (strategy.sellLyraOnly ? x.sell.provider == ProviderType.LYRA : true)) // SELL on LYRA Only
      .filter((x) =>
        strategy.spotStrikeDiff > 0
          ? (x.type == OptionType.CALL ? x.strike - spot : spot - x.strike) >= strategy.spotStrikeDiff
          : true,
      )
  }
  return []
}

export async function trade(
  arb: Arb,
  strategy: Strategy,
  positionId: number,
  isBuy = true,
  revertTrade = false,
): Promise<TradeResult | undefined> {
  const provider = isBuy ? arb?.buy.provider : arb.sell.provider
  const size = getSize(strategy)

  if (provider === ProviderType.LYRA) {
    return await tradeLyra(arb, strategy, size, positionId, isBuy, revertTrade)
  } else {
    return await tradeDeribit(arb, strategy, size, isBuy, revertTrade)
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
  revertTrade: boolean,
) {
  await PostTelegram(TradeTelegram(arb, tradeResult, strategy, size, isBuy, revertTrade), TelegramClient)
}

export async function enoughColateralInWallet(
  colatAmount: number,
  optionType: OptionType,
  market: Underlying,
): Promise<boolean> {
  // refresh balances
  const lyra = getLyra()
  const signer = new ethers.Wallet(Wallet().privateKey, lyra.provider)
  await getBalances(lyra.provider, signer, false)
  let currentBalance = 0

  // assume covered call
  // todo account for stable denominated call
  if (optionType == OptionType.CALL) {
    if (market == Underlying.ETH) {
      // check sEth balance
      currentBalance = global.BALANCES[TokenNames.sETH]
    }
    if (market == Underlying.BTC) {
      currentBalance = global.BALANCES[TokenNames.sBTC]
    }
  } else {
    // puts
    currentBalance = global.BALANCES[TokenNames.sUSD]
  }

  return currentBalance >= colatAmount
}

export const tradeLyra = async (
  arb: Arb,
  strategy: Strategy,
  size: number,
  positionId: number,
  isBuy = true,
  revertTrade = false,
) => {
  const strike = isBuy ? (arb.buy.id as number) : (arb.sell.id as number)

  if (revertTrade) {
    isBuy = !isBuy
  }

  const colat = calcColateral(arb, strategy, size, isBuy)

  // colat is 0 for buys, so not required to check wallet
  if (colat > 0) {
    // check wallet, can we cover colateral?
    const enoughColat = await enoughColateralInWallet(colat, arb.type, strategy.market)

    if (!enoughColat) {
      const colateralResult = defaultResult(ProviderType.LYRA, 'Not enough funds in wallet to cover collateral.')
      await reportTrade(arb, colateralResult, strategy, size, isBuy, revertTrade)
      return colateralResult
    }
  }

  const tradeArgs: LyraTradeArgs = {
    size: size,
    market: strategy.market,
    call: arb.type == OptionType.CALL,
    buy: isBuy,
    strike: strike,
    collat: colat,
    stable: TokenNames.sUSD,
    positionId: positionId,
  }

  const result = await makeTradeLyra(tradeArgs)
  await reportTrade(arb, result, strategy, size, isBuy, revertTrade)
  return result
}

export async function tradeDeribit(arb: Arb, strategy: Strategy, size: number, isBuy = true, revertTrade = false) {
  if (revertTrade) {
    isBuy = !isBuy
  }

  const args: DeribitTradeArgs = {
    amount: size,
    instrumentName: isBuy ? (arb.buy.id as string) : (arb.sell.id as string),
    buy: isBuy,
  }

  const result = await makeTradeDeribit(args)
  await reportTrade(arb, result, strategy, size, isBuy, revertTrade)
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
