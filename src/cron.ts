import cron from "node-cron";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { AI_GENERATE } from "./getText";
import { unlink } from "fs/promises";

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
      const nightFact = await AI_GENERATE.yandex(
        "Расскажи короткую сказку на ночь, где главные персонажи котики. Без предисловия, сразу начинай рассказ."
      );
      const imgPath = await AI_GENERATE.sberPic(nightFact);
      try {
        bot.telegram
          .sendPhoto(
            process.env.CATS_CHANNEL_NAME!,
            { source: imgPath },
            { caption: `Пора спать🌚 Вот сказка, чтобы лучше спалось... \n\n${nightFact}` }
          )
          .then(async () => {
            await unlink(imgPath);
            console.log(`File ${imgPath} has been deleted.\n\n`);
          });
      } catch (error: any) {
        console.error(new Date(), error.message);
      }
    },
    { timezone: "Asia/Yekaterinburg" }
  );
}
