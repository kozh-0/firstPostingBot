import axios from "axios";
import fs from "fs";
import { GigaChat } from "gigachat-node";

const YANDEXGPT_FOLDER_ID = process.env.YANDEXGPT_FOLDER_ID!;
const YANDEX_IMG_SECRET_KEY = process.env.YANDEX_IMG_SECRET_KEY!;
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
      "./img",
    );
  }

  async taleGenerate(
    prompt: string,
  ): Promise<{ tale: string; img: { filePath: string; buffer: Buffer } }> {
    const tale: string = await AI_GENERATE.yandexChat(prompt);
    const img = await AI_GENERATE.yandexImage(`Нарисуй: ${tale.slice(0, 490)}`);
    // const imgPath = (await AI_GENERATE.sberChat(`Нарисуй: ${tale}`)).image!;

    return { tale, img };
  }

  async sberChat(prompt: string) {
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

    console.log(response.choices[0].message, "\n");
    return response.choices[0].message;
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
          text: prompt,
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
        },
      );
      console.log(response.status, new Date());
      console.log(JSON.stringify(response.data.result.alternatives, null, 2));

      return response.data.result.alternatives[0].message.text ?? "Что-то пошло не так...";
    } catch (err: any) {
      console.error("ERR: AI yandexChat:", err.message);
      return err.message;
    }
  }
  // @ts-ignore
  async yandexImage(prompt: string): Promise<{ filePath: string; buffer: Buffer }> {
    const imgId = await this.getImgGenID(prompt);
    console.log("imgId", imgId);

    const base64String = await this.waitForImageCompletion(imgId);
    console.log("imageUrl BOOLEAN", base64String ? true : false);
    const img = await this.saveBase64Image(base64String);
    console.log("IMG", img);

    return img;
  }

  private async getImgGenID(prompt: string): Promise<string> {
    const requestBody = {
      modelUri: `art://${YANDEXGPT_FOLDER_ID}/yandex-art/latest`,
      generationOptions: {
        seed: Math.floor(Math.random() * 1000000),
        aspectRatio: {
          widthRatio: "1",
          heightRatio: "1",
        },
      },
      messages: [
        {
          weight: "1",
          text: prompt,
        },
      ],
    };

    try {
      console.log("Отправка запроса на генерацию...");

      const response = await axios.post(
        "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync",
        requestBody,
        {
          headers: {
            Authorization: `Api-Key ${YANDEX_IMG_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("ID операции:", response.data.id);

      return response.data.id;
    } catch (error) {
      // @ts-ignore
      console.error("ERR: AI getImgGenID:", error.response);
      return "";
    }
  }

  private async waitForImageCompletion(operationId: string, maxAttempts = 5, interval = 5000) {
    const operationURL = `https://llm.api.cloud.yandex.net:443/operations/${operationId}`;

    for (let i = 0; i < maxAttempts; i++) {
      console.log(`Попытка ${i + 1}/${maxAttempts}...`);

      try {
        const response = await axios.get(operationURL, {
          headers: {
            Authorization: `Api-Key ${YANDEX_IMG_SECRET_KEY}`,
          },
        });

        const operation = response.data;

        if (operation.done) {
          if (operation.response?.image) {
            console.log("✅ Изображение сгенерировано!");
            return operation.response.image;
          } else if (operation.error) {
            console.error("ERR: AI waitForImageCompletion:", operation.response);
          }
        }
      } catch (error) {
        // @ts-ignore
        console.error("ERR: AI catch waitForImageCompletion:", error.response.data);
      }

      // Ждем перед следующей попыткой
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    // console.error("Превышено время ожидания генерации");
  }

  private async saveBase64Image(base64String: string, filename = "image.jpg") {
    try {
      const destinationDir = "img"; // Папка назначения
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true }); // Создаем папку, если её нет
      }

      const buffer = Buffer.from(base64String, "base64");
      const filePath = `${destinationDir}/${filename}`;
      // @ts-ignore Сохраняем файл
      fs.writeFileSync(filePath, buffer);

      console.log(`✅ Изображение сохранено как: ${filename}`);
      console.log(`📁 Размер файла: ${base64String.length} байт`);

      return { filePath, buffer };
    } catch (error) {
      console.error("ERR: saveBase64Image:", error);
      return { filePath: "", buffer: Buffer.from("") };
    }
  }
}

export const AI_GENERATE = new AI_GENERATE_CLASS();
