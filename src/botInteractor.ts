import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { AI_GENERATE } from "./getAiContent";
import { getWeather } from "./getWeather";

export default async function botInteractor(bot: Telegraf<Context<Update>>) {
  // Взаимодействие с ботом
  bot.on("text", async (ctx) => {
    try {
      if (ctx.message.chat.id !== parseInt(process.env.MY_USER_TG_ID!)) {
        console.log(`Чужак ${ctx.message.from.username}: ${ctx.message.text}`);
        return await ctx.reply("Доступ запрещен ¯\\_(ツ)_/¯");
      }

      const input = ctx.message.text.trim();
      if (input.toLowerCase() === "ау") return ctx.reply("Я фурычу!");
      if (input.toLowerCase() === "погода") return ctx.reply(await getWeather());

      if (input.toLowerCase().startsWith("pic")) {
        ctx.sendChatAction("typing");
        const { buffer, filePath } = await AI_GENERATE.yandexImage(input);
        return await ctx.replyWithPhoto(
          { source: filePath },
          { caption: `🎨 Сгенерировано Yandex ART` },
        );
      }

      if (input.toLowerCase() === "tale") {
        ctx.sendChatAction("typing");
        const taleObj = await AI_GENERATE.taleGenerate(
          `Расскажи милую сказку на ночь, где главные персонажи ${input}. Без предисловия, сразу начинай рассказ. Сказка должна быть короткая, до 3024 символов`,
        );
        await ctx.replyWithPhoto(
          { source: taleObj.img.filePath },
          { caption: "Пора спать🌚 Вот сказка, чтобы лучше спалось..." },
        );
        // * Отдельным сообщением т.к. с вложениями 1024 символа, просто текст - 4096
        await ctx.sendMessage(taleObj.tale);
      }
      if (input.toLowerCase().startsWith("yandex")) {
        ctx.sendChatAction("typing");
        console.log("yandex");
        const res = await AI_GENERATE.yandexChat(input);
        return ctx.reply(res);
      }

      // if (input.toLowerCase().startsWith("sber")) {
      //   ctx.sendChatAction("typing");
      //   console.log("sber");
      //   const res = await AI_GENERATE.sberChat(input);
      //   console.log(res);

      //   if (res.image) {
      //     ctx.replyWithPhoto({ source: res.image }, { caption: res.content }).then(async () => {
      //       await unlink(res.image!);
      //       console.log(`File ${res.image} has been deleted.\n\n`);
      //     });
      //   }
      //   return ctx.reply(res.content);
      // }
    } catch (error) {
      console.error("ERR: botInteractor:", error);
    }
  });

  bot.catch((err, ctx) => {
    console.error("ERR: bot.catch в botInteractor:", err);
    ctx.reply("Что-то пошло совсем не так...");
  });
}
