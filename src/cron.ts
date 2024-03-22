import cron from "node-cron";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { generatePost } from "./getText";

//  ┌────────────── second (optional)
//  │ ┌──────────── minute
//  │ │ ┌────────── hour
//  │ │ │ ┌──────── day of month
//  │ │ │ │ ┌────── month
//  │ │ │ │ │ ┌──── day of week
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *
// https://crontab.guru/

export function cronTaskPlanner(bot: Telegraf<Context<Update>>) {
  cron.schedule(
    "0 9 * * *",
    () => {
      console.log(new Date(), "С добрым утром! 🌞");
      bot.telegram.sendMessage(process.env.CATS_CHANNEL_NAME!, "С добрым утром 🌞");
    },
    { timezone: "Asia/Yekaterinburg" }
  );

  cron.schedule(
    "0 14 * * *",
    () => {
      console.log(new Date(), "Не забудьте покушать!");
      bot.telegram.sendMessage(
        process.env.CATS_CHANNEL_NAME!,
        "Хорошего дня!\n\n Не забудьте покушать 🍧🍨🧁🥞🧋"
      );
    },
    { timezone: "Asia/Yekaterinburg" }
  );

  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log(new Date(), "Спокойной ночи! 🌚");
      const nightFact = await generatePost(
        "Расскажи короткую сказку на ночь. Без предисловия, сразу начинай рассказ."
      );
      try {
        bot.telegram.sendMessage(
          process.env.CATS_CHANNEL_NAME!,
          `Пора спать🌚 Вот сказка, чтобы лучше спалось... \n\n${nightFact}`
        );
      } catch (error: any) {
        console.error(new Date(), error.message);
      }
    },
    { timezone: "Asia/Yekaterinburg" }
  );
}
