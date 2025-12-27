'use strict';

// Load environment variables
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Config
const PORT = Number(process.env.PORT || 3001);
const LLM_BASE_URL = process.env.LLM_BASE_URL || '';
const STABLE_DIFF_URL = process.env.STABLE_DIFF_URL || '';

// Load characters
const charactersFilePath = path.join(__dirname, 'characters.json');
let characters = [];
try {
  const fileContent = fs.readFileSync(charactersFilePath, 'utf-8');
  characters = JSON.parse(fileContent);
  if (!Array.isArray(characters)) {
    characters = [];
  }
} catch (error) {
  // If the file is missing or invalid, default to empty list
  characters = [];
}

function findCharacterById(characterId) {
  return characters.find((c) => String(c.id) === String(characterId));
}

// Function to detect if a message contains an image request
function isImageRequest(message) {
  if (!message || typeof message !== 'string') return false;
  
  const imageKeywords = [
    'picture', 'draw', 'photo', 'show me', 'pic', 'image', 
    'generate image', 'create image', 'make a picture', 'visual',
    'illustration', 'artwork', 'sketch', 'painting'
  ];
  
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Reusable function to generate images
async function generateImage(character, prompt = '', negative_prompt = '') {
  if (!STABLE_DIFF_URL) {
    throw new Error('Image generation not configured');
  }

  const composedPrompt = `${String(character.stylePrompt || '').trim()}${prompt ? ', ' : ''}${String(prompt).trim()}`;

  const url = `${STABLE_DIFF_URL.replace(/\/$/, '')}/sdapi/v1/txt2img`;
  const payload = {
    prompt: composedPrompt,
    negative_prompt: String(negative_prompt || ''),
    // Reduced settings for faster generation and less VRAM usage
    steps: 15,
    width: 512,
    height: 512,
    sampler_name: 'DPM++ 2M Karras',
    cfg_scale: 5.5,
    batch_size: 1,
    n_iter: 1,
  };

  console.log(`[IMAGE] Generating image for character ${character.id} with prompt: ${composedPrompt}`);
  console.log(`[IMAGE] Requesting from: ${url}`);

  const response = await axios.post(url, payload, {
    timeout: 180_000, // Increased timeout to 3 minutes
    headers: { 'Content-Type': 'application/json' },
  });

  const data = response.data;
  const images = Array.isArray(data?.images) ? data.images : [];

  // Persist images to disk and build URLs
  const characterDir = path.join(imagesDir, String(character.id));
  try {
    if (!fs.existsSync(characterDir)) fs.mkdirSync(characterDir, { recursive: true });
  } catch (_e) {}

  const savedUrls = [];
  images.forEach((b64, index) => {
    try {
      const ts = Date.now();
      const fileName = `${ts}_${index}.png`;
      const absPath = path.join(characterDir, fileName);
      const base64Data = b64.replace(/^data:image\/(png|jpeg);base64,/, '');
      fs.writeFileSync(absPath, Buffer.from(base64Data, 'base64'));
      savedUrls.push(`/media/${character.id}/${fileName}`);
    } catch (_e) {
      // ignore failed image write
    }
  });

  // Update image manifest per character
  try {
    const manifestFile = path.join(imagesDir, `${character.id}.json`);
    const manifest = readJsonArray(manifestFile);
    const nowIso = new Date().toISOString();
    for (const urlPath of savedUrls) {
      manifest.push({ id: Date.now().toString(), timestamp: nowIso, url: urlPath, prompt: composedPrompt });
    }
    writeJsonArray(manifestFile, manifest);
  } catch (_e) {}

  return { images, urls: savedUrls, raw: data };
}

// Data directories for persistence
const dataDir = path.join(__dirname, 'data');
const chatsDir = path.join(dataDir, 'chats');
const imagesDir = path.join(dataDir, 'images');

for (const dir of [dataDir, chatsDir, imagesDir]) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed creating data directory', dir, e);
  }
}

function readJsonArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

function writeJsonArray(filePath, arr) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed writing JSON', filePath, e);
  }
}

// Serve stored images
app.use('/media', express.static(imagesDir));

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// 1) GET /characters → return all characters
app.get('/characters', (_req, res) => {
  try {
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load characters' });
  }
});

// 2) POST /chat/:id → body { messages: [...] }
app.post('/chat/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { messages = [], model } = req.body || {};

    const character = findCharacterById(id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    // Prepend system prompt
    const finalMessages = [
      { role: 'system', content: String(character.systemPrompt || '') },
      ...messages,
    ];

    // Optional LLM call
    let payload = null;
    let data = null;
    let assistantMessage = null;
    if (LLM_BASE_URL) {
      // Forward to LLM_BASE_URL/v1/chat/completions
      // Provide a sensible default model if none supplied
      payload = {
        model: model || process.env.LLM_MODEL || 'openhermes',
        messages: finalMessages,
        stream: false,
        temperature: 0.7,
      };

      const url = `${LLM_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`;
      const response = await axios.post(url, payload, {
        timeout: 60_000,
        headers: { 'Content-Type': 'application/json' },
      });

      // Try to extract assistant message; otherwise leave null
      data = response.data;
      assistantMessage = data?.choices?.[0]?.message?.content ?? null;
    }

    // Check if the last user message contains an image request
    const userMessage = messages[messages.length - 1] || null;
    const userContent = userMessage?.content ?? '';
    const shouldGenerateImage = isImageRequest(userContent);

    let imageResult = null;
    if (shouldGenerateImage && STABLE_DIFF_URL) {
      try {
        console.log(`[CHAT] Detected image request in user message: "${userContent}"`);
        // Use the user's message as the image prompt, or fall back to assistant message
        const imagePrompt = userContent || assistantMessage || '';
        imageResult = await generateImage(character, imagePrompt);
        console.log(`[CHAT] Generated image with URLs: ${imageResult.urls.join(', ')}`);
      } catch (imageError) {
        console.error(`[CHAT] Failed to generate image:`, imageError.message);
        // Continue with text response even if image generation fails
      }
    }

    // Persist chat exchange
    try {
      const chatFile = path.join(chatsDir, `${id}.json`);
      const history = readJsonArray(chatFile);
      history.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        system: String(character.systemPrompt || ''),
        user: userContent,
        assistant: assistantMessage ?? '',
        model: payload?.model || 'none',
        imageGenerated: shouldGenerateImage,
        imageUrls: imageResult?.urls || null,
      });
      writeJsonArray(chatFile, history);
    } catch (_e) {
      // ignore persistence errors
    }

    // Prepare response
    const responseData = { reply: assistantMessage, raw: data };
    
    // Include image data if generated
    if (imageResult) {
      responseData.image = {
        urls: imageResult.urls,
        images: imageResult.images,
        raw: imageResult.raw
      };
    }

    if (assistantMessage != null || imageResult) {
      return res.json(responseData);
    }
    return res.json(data || { reply: null });
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data || error?.message || 'Chat request failed';
    res.status(status).json({ error: 'Chat request failed', detail: message });
  }
});

// 2b) GET /chat/:id/history → persisted chat history
app.get('/chat/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const chatFile = path.join(chatsDir, `${id}.json`);
    const history = readJsonArray(chatFile);
    res.json(history);
  } catch (_e) {
    res.json([]);
  }
});

// 2c) DELETE /chat/:id/history → clear persisted chat history
app.delete('/chat/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const chatFile = path.join(chatsDir, `${id}.json`);
    writeJsonArray(chatFile, []);
    res.json({ ok: true });
  } catch (_e) {
    res.status(500).json({ ok: false });
  }
});

// 3) POST /image/:id → body { prompt, negative_prompt }
app.post('/image/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt = '', negative_prompt = '' } = req.body || {};

    const character = findCharacterById(id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const result = await generateImage(character, prompt, negative_prompt);
    return res.json({ images: result.images, urls: result.urls, raw: result.raw });
  } catch (error) {
    console.error(`[IMAGE] Error generating image for character ${req.params.id}:`, error.message);
    
    const status = error?.response?.status || 500;
    let message = error?.response?.data || error?.message || 'Image request failed';
    
    // Provide more helpful error messages
    if (error.code === 'ECONNREFUSED') {
      message = 'Stable Diffusion service is not running or not accessible';
    } else if (error.code === 'ETIMEDOUT') {
      message = 'Image generation timed out. Try using a smaller model or reducing image size.';
    } else if (error.response?.status === 400) {
      message = 'Invalid request to Stable Diffusion API. Check model and parameters.';
    }
    
    res.status(status).json({ 
      error: 'Image request failed', 
      detail: message,
      code: error.code,
      status: status
    });
  }
});

// 3b) GET /image/:id/history → list saved image URLs
app.get('/image/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const manifestFile = path.join(imagesDir, `${id}.json`);
    const manifest = readJsonArray(manifestFile);
    res.json(manifest);
  } catch (_e) {
    res.json([]);
  }
});

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});


