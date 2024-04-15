import cron from "node-cron";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { AI_GENERATE } from "./getText";
import { unlink } from "fs/promises";
import { getWeather } from "./getWeather";

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

const CHANNELS = [process.env.CATS_CHANNEL_NAME!, process.env.DOGS_CHANNEL_NAME!];

export default function cronTaskPlanner(bot: Telegraf<Context<Update>>) {
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log(new Date(), "С добрым утром! 🌞");

      CHANNELS.forEach(async (channel) => {
        bot.telegram.sendMessage(
          channel,
          `С добрым утром, ${channel.includes("dog") ? "песики" : "котики"}! 🌞\n\n${await getWeather()}`
        );
      });
    },
    { timezone: "Asia/Yekaterinburg" }
  );

  cron.schedule(
    "0 14 * * *",
    async () => {
      console.log(new Date(), "Обед!");
      const { content } = await AI_GENERATE.sberChat("Что съесть на обед, дай одну рекомендацию");
      CHANNELS.forEach(async (channel) => {
        bot.telegram.sendMessage(
          channel,
          `Хорошего дня!\nНе забудьте покушать 🍧🍨🧁🥞🧋\n\n${content}`
        );
      });
    },
    { timezone: "Asia/Yekaterinburg" }
  );

  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log(new Date(), "Спокойной ночи! 🌚");

      // Потому-что for of ожидает асинхронные операции, а методы цикла - синхронны и ничего не ждут
      // CHANNELS.forEach(async (channel) => {
      for (const channel of CHANNELS) {
        const catOrDog = channel.includes("dog") ? "песики" : "котики";

        const taleObj = await AI_GENERATE.taleGenerate(
          `Расскажи милую сказку на ночь, где главные персонажи ${catOrDog}. Без предисловия, сразу начинай рассказ. Сказка должна быть короткая, до 3024 символов`
        );

        try {
          await bot.telegram.sendPhoto(
            channel,
            { source: taleObj.imgPath },
            { caption: "Пора спать🌚 Вот сказка, чтобы лучше спалось..." }
          );
          // Отдельным сообщением т.к. с вложениями 1024 символа, просто текст - 4096
          await bot.telegram.sendMessage(channel, taleObj.tale);
        } catch (error: any) {
          console.error(new Date(), error.message);
        } finally {
          // Тут не отслеживается удален ли файл
          await unlink(taleObj.imgPath);
          console.log(`File ${taleObj.imgPath} has been deleted.\n\n`);
        }
      }
    },
    { timezone: "Asia/Yekaterinburg" }
  );
}
