# Lyra / Deribit Arb Bot \_/ 🤖

A bot providing automated arbs between Lyra & Deribit.
Atm the moment you must run this bot yourself for reporting & execution.

![Example arb - Deribit / Lyra](https://raw.githubusercontent.com/Lyra-Grants/assets/main/example_arb.png)
#### Arb Identification

- [x] Identify Arbs
- [x] Use strategy - identify different arbs
- [x] Report strategy & arbs via telegram

#### Arb Execution

- [x] Market Order Trade Execution
- [x] Execute trade - Lyra
- [x] Execute trade - Deribit
- [x] Revert mechanism (price moves, arb invalidated)
- [x] Trade / logging - reporting via Telegram
- [x] Polling mechanism - js call
- [ ] Documentation

### Strategy Settings

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

For full set up settings visit the [Lyra Arb Bot Wiki](https://github.com/Lyra-Grants/arb-bot/wiki/1.-Settings)

### Environment Variables

- `TESTNET` - true/false (if true prints to console, doesn't post to telegram)
- `REPORT_ONLY` - Report arbs that meet strategy - don't execute.
- `ALCHEMY_ID` - alchemy ID.

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

### Roadmap

2 versions of the bot, one public reporting bot that manages reporting arbs, one private bot set up by the user.
Private bot has public bot functionality and in addition adds trade execution.

- [ ] Reporting Bot (RB) - add to own TG channel, receives strat params posts arbs.
- [ ] RB - store user strategies in external db.
- [ ] RB - report user strategies to channels.
- [ ] Execution Bot (EB) - add collateral management.
- [ ] EB - Fully automated arbitrage via Telegram.

Completely automated strategies executable via Telegram.

### Resources

- [Lyra Finance Repositories](https://github.com/lyra-finance)

## Contributing

Lyra grantsDao welcomes contributors. Regardless of the time you have available, everyone can provide meaningful contributions to the project by submitting bug reports, feature requests or even the smallest of fixes! To submit your contribution, please fork, fix, commit and create a pull-request describing your work in detail. For more details, please have a look at the [Contribution guidelines](https://github.com/Lyra-Grants/docs/blob/main/CONTRIBUTING.md).

## Contact

Join the community on the [Lyra Discord server](https://discord.gg/lyra)!
