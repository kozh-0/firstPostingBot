import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { AI_GENERATE } from "./getText";
import { unlink } from "fs/promises";
import { getWeather } from "./getWeather";

export default async function botInteractor(bot: Telegraf<Context<Update>>) {
  // Взаимодействие с ботом
  bot.on("text", async (ctx) => {
    if (ctx.message.chat.id !== parseInt(process.env.USER_TG_ID!)) {
      return await ctx.reply("Доступ запрещен");
    }

    const input = ctx.message.text.trim();
    if (input.toLowerCase() === "ау") return ctx.reply("Я фурычу!");
    if (input.toLowerCase() === "погода") return ctx.reply(await getWeather());

    if (input.toLowerCase().startsWith("yandex")) {
      ctx.sendChatAction("typing");
      console.log("yandex");
      const res = await AI_GENERATE.yandexChat(input);
      return ctx.reply(res);
    }

    if (input.toLowerCase().startsWith("sber")) {
      ctx.sendChatAction("typing");
      console.log("sber");
      const res = await AI_GENERATE.sberChat(input);
      console.log(res);

      if (res.image) {
        ctx.replyWithPhoto({ source: res.image }, { caption: res.content }).then(async () => {
          await unlink(res.image!);
          console.log(`File ${res.image} has been deleted.\n\n`);
        });
      }
      return ctx.reply(res.content);
    }
  });

  bot.catch((err, ctx) => {
    console.error(err);
    ctx.reply("Что-то пошло совсем не так...");
  });
}
