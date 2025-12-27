Backend:
cd backend
npm install
cp .env.example .env
node server.js

Frontend:
cd frontend
npm install
npm run dev

Notes:
- If you haven’t set up Ollama/vLLM, /chat will return dummy replies.
- /image requires A1111 running with --api at STABLE_DIFF_URL.


