import cron from "node-cron";
import fs from "fs";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { AI_GENERATE } from "./getAiContent";
import { getWeather } from "./getWeather";
import axios from "axios";

async function kotikPost(bot: Telegraf<Context<Update>>) {
  const catImg: [{ id: string; url: string; width: number; height: number }] = await axios(
    `https://api.thecatapi.com/v1/images/search`,
  ).then((res) => res.data);

  const fact = await AI_GENERATE.yandexChat(
    "Расскажи один оригинальный факт о кошках, без предисловия. Факт должна быть короткий и отличающийся от предыдущего.",
  );

  let DB_COUNTER = parseInt(fs.readFileSync("counter.txt", { encoding: "utf-8" })) + 1;

  await bot.telegram
    .sendPhoto(process.env.CATS_CHANNEL_NAME!, catImg[0].url, {
      caption: `${DB_COUNTER}. ${fact.toLowerCase().includes("звук") ? fact + "\n\n#Звуки" : fact}`,
    })
    .then(() => {
      fs.writeFileSync("counter.txt", JSON.stringify(DB_COUNTER));
    });
}

async function pesikPost(bot: Telegraf<Context<Update>>) {
  const dogImg: { message: string; status: string } = await axios(
    `https://dog.ceo/api/breeds/image/random`,
  ).then((res) => res.data);

  const fact = await AI_GENERATE.yandexChat(
    "Расскажи один оригинальный факт о собаках, без предисловия. Факт должна быть короткий и отличающийся от предыдущего.",
  );

  await bot.telegram.sendPhoto(process.env.DOGS_CHANNEL_NAME!, dogImg.message, {
    caption: fact,
  });
}

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
    "0 9,12,15,18,20 * * *",
    async () => {
      console.log(new Date(), "Рассылка фактов");
      await kotikPost(bot);
      await pesikPost(bot);
    },
    { timezone: "Asia/Yekaterinburg" },
  );

  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log(new Date(), "С добрым утром! 🌞");

      CHANNELS.forEach(async (channel) => {
        bot.telegram.sendMessage(
          channel,
          `С добрым утром, ${channel.includes("dog") ? "песики" : "котики"}! 🌞\n\n${await getWeather()}`,
        );
      });
    },
    { timezone: "Asia/Yekaterinburg" },
  );

  cron.schedule(
    "30 13 * * *",
    async () => {
      console.log(new Date(), "Обед!");
      const { content } = await AI_GENERATE.sberChat("Что съесть на обед, дай одну рекомендацию");
      CHANNELS.forEach(async (channel) => {
        bot.telegram.sendMessage(
          channel,
          `Хорошего дня!\nНе забудьте покушать 🍧🍨🧁🥞🧋\n\n${content}`,
        );
      });
    },
    { timezone: "Asia/Yekaterinburg" },
  );

  cron.schedule(
    "0 23 * * *",
    async () => {
      console.log(new Date(), "Спокойной ночи! 🌚");

      // Потому-что for of ожидает асинхронные операции, а методы цикла - синхронны и ничего не ждут
      // CHANNELS.forEach(async (channel) => {
      for (const channel of CHANNELS) {
        const catOrDog = channel.includes("dog") ? "песики" : "котики";

        const taleObj = await AI_GENERATE.taleGenerate(
          `Расскажи милую сказку на ночь, где главные персонажи ${catOrDog}. Без предисловия, сразу начинай рассказ. Сказка должна быть короткая, до 3024 символов`,
        );

        try {
          await bot.telegram.sendPhoto(
            channel,
            { source: taleObj.img.filePath },
            { caption: "Пора спать🌚 Вот сказка, чтобы лучше спалось..." },
          );
          // Отдельным сообщением т.к. с вложениями 1024 символа, просто текст - 4096
          await bot.telegram.sendMessage(channel, taleObj.tale);
        } catch (error: any) {
          console.error("ERR: cron tale:", new Date(), error.message);
        }
        // finally {
        // Тут не отслеживается удален ли файл
        // await unlink(taleObj.img.filePath);
        // console.log(`File ${taleObj.img.filePath} has been deleted.\n\n`);
        // }
      }
    },
    { timezone: "Asia/Yekaterinburg" },
  );
}
