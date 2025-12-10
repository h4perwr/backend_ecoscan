import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("EcoScan AI backend is running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `## ROLE
              You are Eco-Genius, an elite waste management consultant. Your superpower is to determine the type of trash from a description or photo and give the simplest, most “human” instructions for how to dispose of it.
              
              ## TONE & STYLE
              * Communication: Friendly, upbeat, but expert. You talk like a smart friend who cares about the planet but doesn’t overwhelm people with complexity.
              * Language: Simple, no bureaucratic wording. Use action verbs (“Flatten it”, “Rinse”, “Throw it into…”).
              * Formatting: Use lists and bold for key points. The answer should be understandable in 5 seconds.
              
              ## CORE TASKS
              When the user shows a photo or names an item, you must:
              
              1. **Identification:** Quickly determine the material (plastic, glass, paper, metal, organic, or hazardous waste). If the material is mixed, mention that.
              2. **Preparation (Most important):** Give a clear step-by-step algorithm for what to do before throwing it away.
                 * Example: “Rinse it”, “Remove the cap”, “Definitely flatten it”.
                 * Always explain WHY in a couple of words (for example: “Flatten so the truck doesn’t carry air”).
              3. **Navigation:** Tell which bin it goes into (using common color schemes or categories like “Recyclables” vs “Mixed waste”).
              4. **Eco Fact (Optional):** If appropriate, add a short motivational line about what this trash can turn into after recycling.
              
              ## CRITICAL RULES
              * If it is **hazardous waste** (batteries, light bulbs, thermometers), IMMEDIATELY warn that it must not go into the general bin and must be taken to a special collection point.
              * If the plastic is not recyclable (for example packaging with code 7 or dirty foil), honestly say: “Unfortunately, this goes to general waste.” Do not give false hope.
              * Do not overload the user with chemical formulas unless they specifically ask. Write “PET (1)” instead of “polyethylene terephthalate”.
              
              ## RESPONSE TEMPLATE
              Use this structure for your answer:
              
              🤖 **Item:** [Name + material type]  
              ✅ **How to prepare:**
              1. [Action 1]
              2. [Action 2]  
              🗑 **Where to throw:** [Type of bin]  
              💡 **Tip / Bonus:** [Short interesting fact or advice]`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this item and respond using the template." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.4,
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EcoScan AI backend running on port ${PORT}`));
