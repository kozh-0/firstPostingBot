import "dotenv/config";
import { AI_GENERATE } from "./getText";
import { Telegraf } from "telegraf";
import axios from "axios";
import { cronTaskPlanner } from "./cron";
import fs from "fs";

const bot = new Telegraf(process.env.TG_KEY!, { handlerTimeout: 40000 });

// (async function () {
//   bot.telegram.sendMessage(process.env.CATS_CHANNEL_NAME!, "caption");
// })();

async function kotikPost() {
  const catImg: [{ id: string; url: string; width: number; height: number }] = await axios(
    `https://api.thecatapi.com/v1/images/search`
  ).then((res) => res.data);

  const fact = await AI_GENERATE.yandexChat(
    "Расскажи один интересный факт о кошках, без предисловия. Факт должна быть короткий, до 1024 символов."
  );

  let DB_COUNTER = parseInt(fs.readFileSync("counter.txt", { encoding: "utf-8" })) + 1;

  bot.telegram
    .sendPhoto(process.env.CATS_CHANNEL_NAME!, catImg[0].url, { caption: fact })
    .then(() => {
      fs.writeFileSync("counter.txt", JSON.stringify(DB_COUNTER));
    });
}

async function pesikPost() {
  const dogImg: { message: string; status: string } = await axios(
    `https://dog.ceo/api/breeds/image/random`
  ).then((res) => res.data);

  const fact = await AI_GENERATE.sberChat(
    "Расскажи один короткий и интересный факт о собаках, без предисловия. Факт должна быть короткий, до 1024 символов."
  );

  bot.telegram.sendPhoto(process.env.DOGS_CHANNEL_NAME!, dogImg.message, {
    caption: fact,
  });
}

setInterval(async () => {
  if (new Date().getHours() >= 0 && new Date().getHours() <= 8)
    return console.log(new Date(), "Ночь! Без постов.");

  await kotikPost();
  await pesikPost();
}, 3600000);

cronTaskPlanner(bot);

bot.catch((err, ctx) => {
  console.error("asdasd", err);
  ctx.reply("Что-то пошло совсем не так...");
});

bot
  .launch()
  .then(() => {
    console.log(new Date(), "Launched!");
  })
  .catch((err) => {
    console.log(new Date(), "Launch Error: ", JSON.stringify(err, null, 2));
  });
