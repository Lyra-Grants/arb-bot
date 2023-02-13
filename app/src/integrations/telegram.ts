import { TELEGRAM_CHANNEL, TESTNET } from '../secrets'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

export async function PostTelegram(post: string, telegramClient: Telegraf<Context<Update>>) {
  if (TESTNET) {
    console.log(post)
  } else {
    try {
      const response = await telegramClient.telegram.sendMessage(TELEGRAM_CHANNEL, post, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      })
    } catch (e: any) {
      console.log(e)
    }
  }
}
