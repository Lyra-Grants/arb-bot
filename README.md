# Lyra Arb Bot \_/ 🤖

A bot providing automated arbs between Lyra & Deribit.

- [x] Identify Arbs
- [x] Add Market Order
- [x] Execute trade - Lyra
- [x] Execute trade - Deribit
- [x] Add configs / strategy mechanism
- [ ] Add revert mechanism (price moves, arb invalidated)
- [ ] Trade / logging - reporting - Telegram bot to report trades?
- [x] Polling mechanism - websocket or js call
- [ ] Documentation

### Configuration / Stragegy Requirements

#### Arb Identification Settings

- [x] Markets ETH / BTC
- [x] Option Types [Call, Put]
- [x] Profit Threshold
- [x] Minimum APY
- [x] Sell Lyra Only
- [x] Spot / Strike Difference

#### Arb Execution Settings

- [x] Max Colat
- [x] Trade Size
- [x] Colat Percent
- [x] Buy First
- [x] Most Profitable Only

Run locally:

```
yarn install
yarn start
```

### Environment Variables

- `TESTNET` - true/false (if true prints to console, doesn't post to telegram)
- `REPORT_ONLY` - Report arbs that meet strategy - don't execute.
- `INFURA_ID_OPTIMISM` - for everything else

### Integrations

#### Deribit

- `DERIBIT_CLIENT_ID` - deribit client id
- `DERIBIT_CLIENT_SECRET` - deribit client secret
- `DERIBIT_TESTNET` - true/false use the testnet endpoint
- `DERIBIT_TESTNET_CLIENT_ID` - deribit TESTNET client id
- `DERIBIT_TESTNET_CLIENT_SECRET` - deribit TESTNET client secret

#### Ether Wallet

- `WALLET_ADDRESS` - your wallet address
- `PRIVATE_KEY` - wallet private key
- `PUBLIC_KEY` - wallet public key

### Resources

- [Lyra Finance Repositories](https://github.com/lyra-finance)

## Contributing

Lyra grantsDao welcomes contributors. Regardless of the time you have available, everyone can provide meaningful contributions to the project by submitting bug reports, feature requests or even the smallest of fixes! To submit your contribution, please fork, fix, commit and create a pull-request describing your work in detail. For more details, please have a look at the [Contribution guidelines](https://github.com/Lyra-Grants/docs/blob/main/CONTRIBUTING.md).

## Contact

Join the community on the [Lyra Discord server](https://discord.gg/lyra)!
