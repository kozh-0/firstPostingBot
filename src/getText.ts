export const generateText = (): string => {
  return Buffer.alloc(Math.random() * 100, "pwerhzsjov").toString("hex");
};
