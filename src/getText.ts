import axios from "axios";
import { GigaChat } from "gigachat-node";

const YANDEXGPT_FOLDER_ID = process.env.YANDEXGPT_FOLDER_ID!;
const YANDEXGPT_API_KEY = process.env.YANDEXGPT_API_KEY!;

class AI_GENERATE_CLASS {
  private readonly GIGACHAT: GigaChat;
  constructor() {
    this.GIGACHAT = new GigaChat(
      process.env.GIGACHAT_AUTH_SECRET!,
      true,
      true,
      true,
      true,
      "./imgs"
    );
  }

  async taleGenerate(prompt: string) {
    const tale: string = await AI_GENERATE.yandexChat(prompt);
    const imgPath = await AI_GENERATE.sberPic(tale);

    return { tale, imgPath };
  }

  async sberChat(prompt: string) {
    try {
      await this.GIGACHAT.createToken();

      const response = await this.GIGACHAT.completion({
        model: "GigaChat:latest",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      console.log(response.choices[0].message);
      return response.choices[0].message.content;
    } catch (error) {
      console.log(error);
      return "Что-то пошло не так...";
    }
  }

  async sberPic(prompt: string) {
    await this.GIGACHAT.createToken();

    const response = await this.GIGACHAT.completion({
      model: "GigaChat:latest",
      messages: [
        {
          role: "user",
          content: `Нарисуй: ${prompt}`,
        },
      ],
    });

    console.log("img", response.choices[0].message);
    return response.choices[0].message.image!;
  }

  async yandexChat(prompt: string) {
    const data = {
      modelUri: `gpt://${YANDEXGPT_FOLDER_ID}/yandexgpt-lite`,
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
            "x-folder-id": YANDEXGPT_FOLDER_ID,
          },
        }
      );
      console.log(response.status, new Date());
      console.log(JSON.stringify(response.data, null, 2));

      return response.data.result.alternatives[0].message.text ?? "Что-то пошло не так...";
    } catch (err: any) {
      console.error("error:", err.message);
      return "Фатальная ошибка";
    }
  }
}

export const AI_GENERATE = new AI_GENERATE_CLASS();
