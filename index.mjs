import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("EcoScan AI backend is running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      {
        text: `You are a waste sorting assistant.
1) Identify what object is on the image.
2) Classify it into one of: plastic, paper, glass, metal, organic, e-waste, mixed, other.
3) Answer in short English in this format:
category: <one word>
where_to_throw: <one short sentence>.`,
      },
    ]);

    const text = result.response.text();
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EcoScan AI backend running on port ${PORT}`));
