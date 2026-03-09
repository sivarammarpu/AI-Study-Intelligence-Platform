// We kept the filename geminiService.js so we don't have to refactor imports everywhere,
// but under the hood we are now using SambaNova's incredibly fast Meta-Llama-3.3-70B model
// via their OpenAI-compatible endpoint!

const API_KEY = import.meta.env.VITE_SAMBANOVA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

// ─── Robust JSON extractor ────────────────────────────────────────────────────
const parseJSON = (text) => {
  if (!text) return null;
  try {
    let cleaned = text
      .replace(/^```json\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/```\s*$/im, '')
      .trim();
    const firstBracket = cleaned.search(/[\[{]/);
    if (firstBracket > 0) cleaned = cleaned.slice(firstBracket);
    const lastBracket = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (lastBracket !== -1 && lastBracket < cleaned.length - 1) {
      cleaned = cleaned.slice(0, lastBracket + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[AI] JSON parse failed:', e.message, '\nRaw:', text?.slice(0, 200));
    return null;
  }
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Core call — uses SambaNova API directly ────────────────────────────
const callAI = async (prompt) => {
  if (!API_KEY || API_KEY.length < 10) {
    throw new Error('API key is not set. Add VITE_SAMBANOVA_API_KEY to your .env file and restart the dev server.');
  }

  const modelName = 'Meta-Llama-3.3-70B-Instruct';
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        const waitMs = Math.pow(2, attempt) * 1000;
        console.log(`[AI] Rate limited. Retrying in ${waitMs / 1000}s...`);
        await sleep(waitMs);
      }
      console.log(`[AI] Trying ${modelName} (attempt ${attempt + 1})`);
      
      const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stream: false,
          model: modelName,
          messages: [
            {
              role: "system",
              content: "You are a helpful expert tutor API that strictly outputs JSON. Return ONLY a valid JSON object or array as requested, without markdown formatting, code blocks, or any other explanations."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      console.log(`[AI] ✅ Success with ${modelName}`);
      return text;
    } catch (err) {
      const msg = (err?.message || String(err)).toLowerCase();
      lastError = err;

      if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('quota')) {
        if (attempt < 2) continue; // retry with backoff
        throw new Error('⚠️ AI rate limit hit. Wait 30 seconds and try again.');
      }
      if (msg.includes('401') || msg.includes('unauthorized')) {
        throw new Error('❌ Invalid API key. Please verify VITE_SAMBANOVA_API_KEY in your .env file and restart the dev server.');
      }
      if (msg.includes('safety')) {
        throw new Error('⚠️ Content blocked by safety filters. Try rephrasing your topic.');
      }
      // Unknown error
      console.warn(`[AI] ❌ ${modelName}: ${err?.message}`);
      break;
    }
  }
  const errorMsg = lastError?.message || 'Unknown error';
  throw new Error(`AI API failed: ${errorMsg}. Check the browser console for details.`);
};

// ─── Topic Summary ────────────────────────────────────────────────────────────
export const generateSummary = async (topic) => {
  const prompt = `You are an expert tutor. Generate a comprehensive study summary for the topic: "${topic}"

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "title": "Topic title",
  "overview": "2-3 sentence overview",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "examples": [{"title": "Example 1", "description": "explanation"}, {"title": "Example 2", "description": "explanation"}],
  "importantConcepts": [{"term": "term1", "definition": "definition1"}, {"term": "term2", "definition": "definition2"}],
  "difficulty": "Beginner",
  "estimatedReadTime": "5 minutes"
}`;

  const text = await callAI(prompt);
  const result = parseJSON(text);
  if (!result) throw new Error('Failed to parse AI response. Please try again.');
  return result;
};

// ─── Quiz Generation ──────────────────────────────────────────────────────────
export const generateQuiz = async (topic, type = 'mcq', count = 10) => {
  const typeInstructions = {
    mcq: 'multiple choice questions with exactly 4 options',
    truefalse: 'true/false questions',
    short: 'short answer questions',
  };

  const prompt = `Generate exactly ${count} ${typeInstructions[type] || 'multiple choice questions with exactly 4 options'} about "${topic}" for students.

Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this is correct"
  }
]

${type === 'truefalse' ? 'For true/false: use options: ["True", "False"] with correct: 0 or 1.' : ''}
${type === 'short' ? 'For short answer: omit options, use "answer": "correct answer".' : ''}
The "correct" field must be the zero-based index of the correct option.`;

  const text = await callAI(prompt);
  return parseJSON(text) || [];
};

// ─── Flashcard Generation ─────────────────────────────────────────────────────
export const generateFlashcards = async (topic, count = 15) => {
  const prompt = `Generate exactly ${count} study flashcards for: "${topic}".

Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "id": 1,
    "front": "Question or concept",
    "back": "Clear, concise answer or explanation",
    "difficulty": "easy"
  }
]

Use difficulty: "easy", "medium", or "hard". Mix all three.`;

  const text = await callAI(prompt);
  return parseJSON(text) || [];
};

// ─── Curriculum Generation ────────────────────────────────────────────────────
export const generateCurriculum = async (topic, difficulty, goal) => {
  const prompt = `Create a structured learning roadmap for:
Topic: "${topic}"
Difficulty: ${difficulty}
Goal: "${goal}"

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "title": "Curriculum title",
  "description": "Brief 1-2 sentence description",
  "estimatedDuration": "8 weeks",
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to learn in this step",
      "goal": "Specific learning objective",
      "resources": ["Book or video resource 1", "Resource 2"],
      "duration": "3 hours",
      "subtopics": ["subtopic1", "subtopic2", "subtopic3"]
    }
  ]
}

Generate 6-8 comprehensive, progressive steps.`;

  const text = await callAI(prompt);
  return parseJSON(text);
};

// ─── Notes from Text (PDF / YouTube) ─────────────────────────────────────────
export const generateNotesFromText = async (text, sourceType = 'document') => {
  const prompt = `Analyze this ${sourceType} content and generate structured study notes.

Content:
"""
${text.substring(0, 12000)}
"""

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "title": "Inferred title of the content",
  "summary": "Comprehensive 3-5 sentence summary",
  "keyPoints": ["key insight 1", "key insight 2", "key insight 3", "key insight 4", "key insight 5"],
  "importantConcepts": [{"term": "term", "definition": "clear definition"}],
  "actionItems": ["What to study further", "What to practice"]
}`;

  const rawText = await callAI(prompt);
  return parseJSON(rawText);
};

// ─── Exam Questions ───────────────────────────────────────────────────────────
export const generateExamQuestions = async (topic, difficulty, count = 20) => {
  const prompt = `Generate exactly ${count} exam-level multiple choice questions for "${topic}" at ${difficulty} difficulty.

Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this is correct",
    "marks": 2,
    "difficulty": "medium"
  }
]

The "correct" field is the zero-based index of the correct answer. Vary difficulty levels.`;

  const text = await callAI(prompt);
  return parseJSON(text) || [];
};

// ─── Study Plan ───────────────────────────────────────────────────────────────
export const generateStudyPlan = async (weakTopics, hoursPerDay, goal) => {
  const prompt = `Create a personalized 7-day daily study plan.
Weak topics: ${weakTopics.join(', ')}
Available hours per day: ${hoursPerDay}
Goal: ${goal}

Return ONLY a valid JSON array, no markdown:
[
  {
    "day": 1,
    "dayName": "Monday",
    "sessions": [
      {
        "time": "9:00 AM",
        "topic": "Topic name",
        "duration": "1 hour",
        "activity": "Read chapter + take notes",
        "priority": "high"
      }
    ],
    "totalHours": 2
  }
]`;

  const text = await callAI(prompt);
  return parseJSON(text) || [];
};
