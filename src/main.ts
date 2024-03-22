import "dotenv/config";
import { Telegraf } from "telegraf";
import axios from "axios";
import { parse } from "./parser";
import { cronTaskPlanner } from "./cron";

const bot = new Telegraf(process.env.TG_KEY!, { handlerTimeout: 20000 });

const interval = setInterval(async () => {
  if (new Date().getHours() >= 0 && new Date().getHours() <= 8) return console.log(new Date(),'Ночь! Без постов.');
  const catImg: [{ id: string; url: string; width: number; height: number }] = await axios(
    `https://api.thecatapi.com/v1/images/search`
  ).then((res) => res.data);

  bot.telegram.sendPhoto(process.env.CATS_CHANNEL_NAME!, catImg[0].url, {
    caption: await parse(interval),
  });

  // const dogImg: { message: string; status: string } = await axios(
  //   `https://dog.ceo/api/breeds/image/random`
  // ).then((res) => res.data);
  // console.log("В работе");
  // const post = await generatePost();
  // console.log("Получил, отправляю...", post);
  // bot.telegram.sendPhoto(process.env.DOGS_CHANNEL_NAME!, dogImg.message, {
  //   caption: post,
  // });
}, 1800000);

cronTaskPlanner(bot);

bot.catch((err, ctx) => {
  console.error(err);
  ctx.reply("Упс... Что-то пошло не так. Попробуйте снова.");
});

bot.launch();
