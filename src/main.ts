import "dotenv/config";
import { AI_GENERATE } from "./getText";
import { Telegraf } from "telegraf";
import axios from "axios";
import { parse } from "./parser";
import { cronTaskPlanner } from "./cron";
import { unlink } from "fs/promises";

const bot = new Telegraf(process.env.TG_KEY!, { handlerTimeout: 40000 });

// (async function () {})();

const interval = setInterval(async () => {
  if (new Date().getHours() >= 0 && new Date().getHours() <= 8)
    return console.log(new Date(), "Ночь! Без постов.");

  const catImg: [{ id: string; url: string; width: number; height: number }] = await axios(
    `https://api.thecatapi.com/v1/images/search`
  ).then((res) => res.data);

  const caption = await AI_GENERATE.yandexChat(
    "Расскажи один интересный факт о кошках, без предисловия. Факт должна быть короткий, до 1024 символов."
  );
  // const caption = await parse(interval);

  bot.telegram.sendPhoto(process.env.CATS_CHANNEL_NAME!, catImg[0].url, { caption });
  // bot.telegram.sendMessage(process.env.CATS_CHANNEL_NAME!, "caption");

  const dogImg: { message: string; status: string } = await axios(
    `https://dog.ceo/api/breeds/image/random`
  ).then((res) => res.data);

  const fact = await AI_GENERATE.sberChat(
    "Расскажи один короткий и интересный факт о собаках, без предисловия. Факт должна быть короткий, до 1024 символов."
  );
  // const imgPath = await AI_GENERATE.sberPic(fact);

  bot.telegram.sendPhoto(
    process.env.DOGS_CHANNEL_NAME!,
    dogImg.message,
    // { source: imgPath },
    {
      caption: fact,
    }
  );
  // .then(async () => {
  //   await unlink(imgPath);
  //   console.log(`File ${imgPath} has been deleted.\n\n`);
  // });
}, 3600000);

cronTaskPlanner(bot);

bot.catch((err, ctx) => {
  console.error("asdasd", err);
  ctx.reply("Упс... Что-то пошло не так. Попробуйте снова.");
});

bot
  .launch()
  .then(() => {
    console.log(new Date(), "Launched!");
  })
  .catch((err) => {
    console.log(new Date(), "Launch Error: ", JSON.stringify(err, null, 2));
  });
