# EcoScan AI Backend

Simple Node.js + Express server for analyzing trash photos with Google Gemini.

## Local run

```bash
npm install
echo "GEMINI_API_KEY=YOUR_KEY_HERE" > .env
npm start
```

POST `POST /analyze` with JSON:

```json
{ "imageBase64": "<base64 of JPEG>" }
```
