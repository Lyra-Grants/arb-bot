export function StatSymbol(asset: string) {
  if (asset.toLowerCase() == 'eth') {
    return '🔷'
  }
  if (asset.toLowerCase() == 'btc') {
    return '🔶'
  }
  if (asset.toLowerCase() == 'sol') {
    return '🟣'
  }
}
