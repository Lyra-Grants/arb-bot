import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs/plugin/utc'

export function VaultLink(asset: string) {
  return `${LyraDappUrl()}/vaults/${asset.toLowerCase()}`
}

export function PortfolioLink(account: string) {
  return `${LyraDappUrl()}/portfolio?see=${account}`
}

export function PositionLink(asset: string, account: string, positionId: number): string {
  return `${LyraDappUrl()}/position?market=${asset}&id=${positionId}&see=${account}`
}

export function ExpiryLink(asset: string, date: string) {
  return `${LyraDappUrl()}/trade/${asset.toLowerCase()}?expiry=${date}`
}

export function EtherScanTransactionLink(transactionHash: string) {
  return `${EtherScanUrl()}/tx/${transactionHash}`
}

export function FormattedDate(date: Date) {
  dayjs.extend(dayjsPluginUTC)
  return dayjs(date).utc().format('DD MMM YY')
}

export function FormattedDateShort(date: Date) {
  dayjs.extend(dayjsPluginUTC)
  return dayjs(date).utc().format('DDMMMYY').toUpperCase()
}

export function FormattedDateTime(date: Date) {
  dayjs.extend(dayjsPluginUTC)
  return dayjs(date).utc().format('MMM-DD-YY HH:mm:ss') + ' UTC'
}

export function EtherScanUrl() {
  return 'https://optimistic.etherscan.io'
}

export function LyraDappUrl() {
  return 'https://app.lyra.finance'
}

export function FN(value: number, decimals: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// formatted number signed
export function FNS(value: number, decimals: number) {
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function StatSymbol(asset: string) {
  if (asset.toLowerCase() == 'eth') {
    return '🔷'
  }
  if (asset.toLowerCase() == 'btc') {
    return '🔶'
  }
}

export function BuySellSymbol(isBuy: boolean) {
  if (isBuy) {
    return '🟢'
  }
  return '🔴'
}

export function YesNoSymbol(isYes: boolean) {
  if (isYes) {
    return '✅'
  }
  return '❌'
}
