import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { facts } from "./facts";
import axios from "axios";
// import { generateText } from "./getText";

const bot = new Telegraf(process.env.TG_KEY!, { handlerTimeout: 20000 });

bot.start((ctx) => {
  ctx.reply("Приветствую!");
});

bot.on(message("text"), async (ctx) => {
  const input = ctx.message.text.trim();
  if (!input) return;

  //   const text = generateText();
  //   ctx.telegram.sendPhoto(process.env.CHANNEL_NAME!, temporaryImageLink, { caption: text });
  ctx.reply("Отправлено: " + input);
});

let count = 17;
const interval = setInterval(async () => {
  if (!facts[count]) {
    clearInterval(interval);
    return bot.telegram.sendMessage(
      process.env.CHANNEL_NAME!,
      "Посты временно закончились... \n\n Скоро будут новые факты!🐱"
    );
  }

  const img: [{ id: string; url: string; width: number; height: number }] = await axios(
    `https://api.thecatapi.com/v1/images/search`
  ).then((res) => res.data);

  bot.telegram.sendPhoto(process.env.CHANNEL_NAME!, img[0].url, {
    caption: `${count + 1}. ${facts[count].title}\n\n${facts[count].descr}`,
  });

  count += 1;
  console.log(count);
}, 1800000);

// bot.on("voice", (ctx) => ctx.reply("Какой чудный у вас голос 😉"));
// bot.on("sticker", (ctx) => ctx.reply("Классный стикер 🙃"));
// bot.on("photo", (ctx) => ctx.reply("👍"));

bot.catch((err, ctx) => {
  console.error(err);
  ctx.reply("Упс... Что-то пошло не так. Попробуйте снова.");
});

bot.launch();
console.log("Запустился");
