import axios from "axios";

const FOLDER_ID = process.env.FOLDER_ID;
const YANDEXGPT_API_KEY = process.env.YANDEXGPT_API_KEY;

const data = {
  modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite/latest`,
  completionOptions: {
    stream: false,
    temperature: 0.6,
    maxTokens: "500",
  },
  messages: [
    {
      // ХРЕНОВО РАБОТАЕТ, результат в 1% случаев, неправильный промпт?
      role: "system",
      text: "Ты опытный кинолог и знаешь все факты о собаках",
      // text: "Напиши один интересный факт о собаках с загаловком, нужно уложиться в 1024 символа",
    },
    // {
    //   role: "assistant",
    //   text: "Собаки очень милые и интересные создания",
    // },
    {
      role: "assistant",
      text: "Напиши один интересный факт о собаках с загаловком",
    },
  ],
};

export async function generateDogPost() {
  try {
    const response = await axios.post(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      data,
      {
        headers: {
          Authorization: `Api-Key ${YANDEXGPT_API_KEY}`,
          "x-folder-id": FOLDER_ID,
        },
      }
    );
    console.log(response.status, new Date());
    console.log(JSON.stringify(response.data, null, 2));

    return response.data.result.alternatives[0].message.text ?? "Что-то пошло не так...";
  } catch (err) {
    // @ts-ignore
    console.error("error:", err.message);
    return "Фатальная ошибка";
  }
}
