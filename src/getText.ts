import axios from "axios";

const FOLDER_ID = process.env.FOLDER_ID;
const YANDEXGPT_API_KEY = process.env.YANDEXGPT_API_KEY;

export async function generatePost(prompt: string) {
  const data = {
    modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite`,
    completionOptions: {
      stream: false,
      temperature: 0.6,
      maxTokens: "1000",
    },
    messages: [
      {
        role: "system",
        text: `Ты дружелюбный ассистент, ${prompt}`,
      },
    ],
  };

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
