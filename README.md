<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Imja – AI Companion</title>
</head>
<body>

  <h1>Imja – AI Companion</h1>

  <p>
    Imja is an AI-powered virtual companion that combines conversational AI
    with AI image generation to create a girlfriend-like experience.
  </p>

  <h2>Setup Instructions</h2>

  <h3>Backend Setup</h3>
  <ol>
    <li>Navigate to the backend directory</li>
    <pre><code>cd backend</code></pre>

    <li>Install dependencies</li>
    <pre><code>npm install</code></pre>

    <li>Configure environment variables</li>
    <pre><code>cp .env.example .env</code></pre>

    <li>Start the backend server</li>
    <pre><code>node server.js</code></pre>
  </ol>

  <h3>Frontend Setup</h3>
  <ol>
    <li>Navigate to the frontend directory</li>
    <pre><code>cd frontend</code></pre>

    <li>Install dependencies</li>
    <pre><code>npm install</code></pre>

    <li>Run the development server</li>
    <pre><code>npm run dev</code></pre>
  </ol>

  <h2>Notes</h2>
  <ul>
    <li>If Ollama or vLLM is not configured, the /chat endpoint returns dummy replies</li>
    <li>The /image endpoint requires Stable Diffusion (AUTOMATIC1111) running with --api</li>
    <li>Ensure STABLE_DIFF_URL is set correctly in the backend .env file</li>
  </ul>

</body>
</html>

