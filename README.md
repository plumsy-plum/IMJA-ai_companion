IMJA – AI Companion

IMJA is a simple full-stack AI companion app that supports chat and image generation using locally hosted AI models.

Features=>>

 ●AI chat interface

 ●Local LLM support (Ollama / vLLM)

 ●Image generation with Stable Diffusion (AUTOMATIC1111 API)

 ●Dummy responses when AI services are not running

Setup≫≫
 ✦Backend
  ● cd backend
  ● npm install
  ● cp .env.example .env
  ● node server.js

✦Frontend
  ● cd frontend
  ● npm install
  ● npm run dev

Notes ➪
 ➜/chat returns dummy replies if Ollama or vLLM is not configured
 ➜/image requires AUTOMATIC1111 running with --api
