import { Telegraf } from 'telegraf'
import { goBot } from './bot'
import { PostTelegram } from './integrations/telegram'
import { TELEGRAM_ACCESS_TOKEN } from './secrets'

async function Initialize(): Promise<void> {
  try {
    RegisterShutdownEvents()
    await Notifier(false)
    await goBot()
  } catch (error) {
    console.error(error)
  }
}

async function Notifier(isDown = true) {
  await PostTelegram(`Arb Bot ${isDown ? 'Down' : 'Up'}\n`, new Telegraf(TELEGRAM_ACCESS_TOKEN))
}

function RegisterShutdownEvents(): void {
  process.on('beforeExit', async (code) => {
    await Notifier().then(process.exit(code))
  })
}

Initialize()
