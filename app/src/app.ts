import { Telegraf } from 'telegraf'
import { Run } from './bot'
import { PostTelegram } from './integrations/telegram'
import { LOG_CHANNEL, LOG_TOKEN } from './config'

async function Initialize(): Promise<void> {
  try {
    RegisterShutdownEvents()
    await Notifier('Initialize', false)
    await Run()
  } catch (error) {
    console.error(error)
    await Notifier('Initialize')
    throw error // do this to restart the app!
  }
}

async function Notifier(message: string, isDown = true) {
  await PostTelegram(`🫘 Arb Bot (LYRA) ${isDown ? 'Down' : 'Up'} (${message}) \n`, new Telegraf(LOG_TOKEN), LOG_CHANNEL)
}

function RegisterShutdownEvents(): void {
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception! Shutting down.')
    await Notifier('Uncaught Exception')
    await PostTelegram(`Error:\n\n ${error.message}`, new Telegraf(LOG_TOKEN), LOG_CHANNEL)
    console.error(error)
  })

  process.on('beforeExit', async (code) => {
    console.log('before exit.')
    await Notifier('Before Exit').then(process.exit(code))
  })
}

Initialize()
