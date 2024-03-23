import { JSDOM } from "jsdom";
import fs from "fs";

let counter = 21;
let counter1 = 0;
export async function parse(interval: NodeJS.Timeout) {
  // ПЕРЕД ЗАПУСКОМ ПРОЕКТА, НАДО В ФАЙЛЕ COUNTER.TXT ВЫСТАВИТЬ НОМЕР ПОСЛЕДНЕГО ПОСТА В ТГ КАНАЛЕ
  // В ИДЕАЛЕ ХРАНИТЬ В ОНЛАЙН БД
  let DB_COUNTER = parseInt(fs.readFileSync("counter.txt", { encoding: "utf-8" }));
  DB_COUNTER += 1;
  fs.writeFileSync("counter.txt", JSON.stringify(DB_COUNTER));
  console.log("DB_COUNTER", DB_COUNTER, "counter", counter, "counter1", counter1);

  //   1 сайт 50 фактов
  const document = await JSDOM.fromURL(
    "http://vet31.ru/useful_info/50-interesnykh-faktov-o-koshkakh/"
  ).then((dom) => dom.window.document);

  const fact = ([...document.querySelectorAll(".news-detail li")][counter] as HTMLElement)
    .innerText;
  if (fact) {
    counter += 1;
    return `${DB_COUNTER}. ${fact}`;
  }

  // 2 сайт 65 фактов
  const document1 = await JSDOM.fromURL("https://www.regulus.am/am/mo/213/").then(
    (dom) => dom.window.document
  );

  const fact1 = ([...document1.querySelectorAll(".post p")][counter1] as HTMLElement).innerText;
  if (fact1) {
    counter1 += 1;
    // Нумерация в комплекте с сайта
    return `${DB_COUNTER}. ${fact1.replace(/^[\d\.\s]+/, "")}`;
  }

  clearInterval(interval);
  return "Посты временно закончились... \n\n Скоро будут новые факты!🐱";
}
