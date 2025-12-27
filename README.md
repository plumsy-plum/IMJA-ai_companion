**<!DOCTYPE html>**

**<html lang="en">**

**<head>**

  **<meta charset="UTF-8" />**

  **<title>Imja – AI Companion</title>**

**</head>**

**<body>**



  **<h1>Imja – AI Companion with Image Generation</h1>**



  **<p>**

    **<strong>Imja</strong> is an AI-powered virtual companion designed to simulate a girlfriend-like**

    **experience through conversational AI and AI-generated images. The project focuses on**

    **human–AI interaction by combining text-based conversations with visual creativity using**

    **modern AI technologies.**

  **</p>**



  **<h2>Features</h2>**

  **<ul>**

    **<li>AI-powered chat companion</li>**

    **<li>AI image generation for personalized visuals</li>**

    **<li>Modular backend and frontend architecture</li>**

    **<li>Support for local language and image models</li>**

  **</ul>**



  **<h2>Tech Stack</h2>**

  **<ul>**

    **<li>Frontend: Vite + JavaScript</li>**

    **<li>Backend: Node.js + Express</li>**

    **<li>LLM Support: Ollama / vLLM (optional)</li>**

    **<li>Image Generation: Stable Diffusion (AUTOMATIC1111 API)</li>**

  **</ul>**



  **<h2>Getting Started</h2>**



  **<h3>Backend Setup</h3>**

  **<pre>**

**cd backend**

**npm install**

**cp .env.example .env**

**node server.js**

  **</pre>**



  **<p>**

    **Ensure the <code>.env</code> file is properly configured before starting the backend server.**

  **</p>**



  **<h3>Frontend Setup</h3>**

  **<pre>**

**cd frontend**

**npm install**

**npm run dev**

  **</pre>**



  **<p>**

    **The frontend will start in development mode and connect to the backend API.**

  **</p>**



  **<h2>Notes and Requirements</h2>**

  **<ul>**

    **<li>**

      **If Ollama or vLLM is not configured, the <code>/chat</code> endpoint will return dummy responses.**

    **</li>**

    **<li>**

      **The <code>/image</code> endpoint requires Stable Diffusion (AUTOMATIC1111) running with the**

      **<code>--api</code> flag.**

    **</li>**

    **<li>**

      **Make sure <code>STABLE\_DIFF\_URL</code> is set correctly in the backend <code>.env</code> file.**

    **</li>**

  **</ul>**



  **<pre>**

**STABLE\_DIFF\_URL=http://127.0.0.1:7860**

  **</pre>**



  **<h2>Purpose</h2>**

  **<p>**

    **This project was built as an experimental AI companion system to explore conversational**

    **AI behavior, image generation integration, and emotional engagement in human–computer**

    **interaction.**

  **</p>**



  **<h2>Disclaimer</h2>**

  **<p>**

    **Imja is a personal and educational project intended for learning and experimentation.**

    **It does not represent a real person and should be used responsibly.**

  **</p>**



**</body>**

**</html>**



