const fs   = require('fs');
const path = require('path');
const Scan = require('../models/Scan');
const Groq = require('groq-sdk');
const axios = require('axios');

// ── Clients ──────────────────────────────────────────────────────────────────
// @huggingface/inference is ESM-only — use dynamic import
let _hfClient = null;
async function getHFClient() {
  if (!_hfClient) {
    const mod = await import('@huggingface/inference');
    // Handle different export shapes across package versions
    const ClientClass =
      mod.InferenceClient ||
      mod.HfInference ||
      mod.default?.InferenceClient ||
      mod.default?.HfInference ||
      mod.default;

    if (!ClientClass || typeof ClientClass !== 'function') {
      throw new Error(
        `Could not load InferenceClient. Module keys: ${Object.keys(mod).join(', ')}`
      );
    }
    _hfClient = new ClientClass(process.env.HF_TOKEN);
  }
  return _hfClient;
}

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseLabel(label) {
  // e.g. 'Corn (Maize) with Cercospora and Gray Leaf Spot'
  if (label.includes(' with ')) {
    const [crop, disease] = label.split(' with ');
    return { crop: crop.trim(), disease: disease.trim() };
  }
  if (label.toLowerCase().includes('healthy')) {
    const crop = label.toLowerCase().replace('healthy', '').trim();
    return { crop: crop ? crop.charAt(0).toUpperCase() + crop.slice(1) : 'Plant', disease: 'Healthy' };
  }
  // e.g. 'Tomato Yellow Leaf Curl Virus'
  const words = label.split(' ');
  return { crop: words[0], disease: words.slice(1).join(' ') || label };
}

function severityFromDisease(disease) {
  const lower = disease.toLowerCase();
  if (lower === 'healthy') return 'Healthy';
  for (const kw of ['blight', 'rot', 'wilt', 'mosaic', 'virus', 'canker', 'smut'])
    if (lower.includes(kw)) return 'High';
  for (const kw of ['rust', 'spot', 'mildew', 'scab', 'scorch', 'cercospora'])
    if (lower.includes(kw)) return 'Medium';
  return 'Low';
}

async function runHFDetection(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png',  '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const mimeType = mimeMap[ext] || 'image/jpeg';
  const buffer   = fs.readFileSync(imagePath);
  
  let results;
  let errorMsg = "";

  // Strategy 1: Use native fetch via @huggingface/inference (Works locally)
  try {
    const client = await getHFClient();
    const blob = new Blob([buffer], { type: mimeType });
    
    let retries = 5;
    while (retries > 0) {
      try {
        const res = await client.imageClassification({
          data: blob,
          model: HF_MODEL,
          provider: 'auto',
        });
        results = res;
        break;
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('currently loading')) {
          console.log(`HF Model is loading (fetch). Retrying in 10s... (${retries} left)`);
          await new Promise(r => setTimeout(r, 10000));
          retries--;
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    errorMsg = err.message;
    console.warn(`[HF Fetch Strategy Failed] ${err.message}. Falling back to Axios...`);
    results = null;
  }

  // Strategy 2: Use Axios (Works on Render where undici/fetch fails due to IPv6)
  if (!results) {
    try {
      const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
      let retries = 5;
      while (retries > 0) {
        try {
          const response = await axios.post(url, buffer, {
            headers: {
              'Authorization': `Bearer ${process.env.HF_TOKEN}`,
              'Content-Type': mimeType,
            },
          });
          results = response.data;
          break;
        } catch (err) {
          if (err.response && err.response.status === 503) {
            console.log(`HF Model is loading (axios). Retrying in 10s... (${retries} left)`);
            await new Promise(r => setTimeout(r, 10000));
            retries--;
          } else {
            throw new Error(err.response ? JSON.stringify(err.response.data) : err.message);
          }
        }
      }
    } catch (err) {
      throw new Error(`Both strategies failed. Fetch error: ${errorMsg}. Axios error: ${err.message}`);
    }
  }

  if (!results || results.length === 0) {
    throw new Error("Failed to get results from HuggingFace after multiple retries.");
  }

  // Log all predictions like the HF demo
  console.log('\\n── HF Model Predictions ──');
  results.forEach(r => console.log(`  ${r.label.padEnd(55)} ${r.score.toFixed(3)}`));
  console.log();

  return results[0]; // top prediction
}

async function generateGroqAnalysis(crop, disease, confidence, user) {
  if (!groqClient) throw new Error('GROQ_API_KEY not set');

  if (disease.toLowerCase() === 'healthy') {
    return {
      explanation:   `The ${crop} plant appears healthy with no visible disease symptoms.`,
      causes:        [],
      treatment:     ['Continue current farming practices', 'Monitor regularly for early signs'],
      prevention:    ['Maintain proper plant spacing', 'Use balanced fertilizers', 'Ensure good field drainage'],
      fertilizers:   ['Continue balanced NPK (19:19:19) schedule'],
      pesticides:    ['No pesticides needed currently'],
      irrigation:    'Maintain current irrigation schedule.',
      riskAssessment:'Low risk. Plant appears healthy.',
      yieldImpact:   'No yield impact expected if current conditions are maintained.',
    };
  }

  const state = user?.farmDetails?.state || 'India';
  const prompt = `You are an expert agricultural scientist for Indian farmers.

Plant disease detection result:
- Crop: ${crop}
- Disease: ${disease}
- Confidence: ${confidence.toFixed(1)}%
- Location: ${state}

Respond ONLY with valid JSON using these exact keys:
{
  "explanation": "Clear 2-3 sentence explanation",
  "causes": ["cause1", "cause2", "cause3"],
  "treatment": ["step1 with dosage", "step2", "step3", "step4"],
  "prevention": ["method1", "method2", "method3"],
  "fertilizers": ["fertilizer with dosage", "fertilizer2 with dosage"],
  "pesticides": ["pesticide with dosage", "pesticide2 with dosage"],
  "irrigation": "Specific irrigation advice",
  "riskAssessment": "Risk level and explanation",
  "yieldImpact": "Expected yield impact and conditions"
}
Use Indian agricultural context, real product names, specific dosages.`;

  const response = await groqClient.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages:    [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens:  1200,
  });

  const content = response.choices[0].message.content;
  const start   = content.indexOf('{');
  const end     = content.lastIndexOf('}') + 1;
  return JSON.parse(content.slice(start, end));
}

// ── Controllers ───────────────────────────────────────────────────────────────

// @route  POST /api/disease/upload
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const scan = await Scan.create({
      user: req.user._id,
      imageUrl,
      status: 'processing',
    });
    res.json({ success: true, scanId: scan._id, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/disease/analyze
const analyzeScan = async (req, res) => {
  try {
    const { scanId, cropName } = req.body;

    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    const imagePath = path.join(__dirname, '../', scan.imageUrl);

    // 1. Run HF model
    let topResult;
    try {
      topResult = await runHFDetection(imagePath);
    } catch (err) {
      await Scan.findByIdAndUpdate(scanId, { status: 'failed' });
      return res.status(502).json({ success: false, message: `HuggingFace error: ${err.message}` });
    }

    const { crop, disease } = parseLabel(topResult.label);
    const detectedCrop      = cropName || crop;
    const confidence        = parseFloat((topResult.score * 100).toFixed(2));
    const severity          = severityFromDisease(disease);

    // 2. Run Groq analysis
    let aiAnalysis;
    try {
      aiAnalysis = await generateGroqAnalysis(detectedCrop, disease, confidence, req.user);
    } catch (err) {
      console.error('Groq analysis error:', err.message);
      await Scan.findByIdAndUpdate(scanId, { status: 'failed' });
      return res.status(502).json({ success: false, message: `Groq error: ${err.message}` });
    }

    // 3. Save to DB
    const updatedScan = await Scan.findByIdAndUpdate(
      scanId,
      {
        cropName:    detectedCrop,
        diseaseName: disease,
        confidence,
        severity,
        aiAnalysis,
        model:       HF_MODEL,
        weatherAtTime: { temperature: 28, humidity: 72, rainfall: 0 },
        status:      'completed',
      },
      { new: true }
    );

    res.json({ success: true, scan: updatedScan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/disease/history
const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/disease/:id
const getScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    res.json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadImage, analyzeScan, getScanHistory, getScan };
