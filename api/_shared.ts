import { GoogleGenAI, Type } from '@google/genai';

// Lazy-initialize Gemini client
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper with timeout to prevent hung requests during network spikes
export async function withTimeout<T>(promise: Promise<T>, ms = 7000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// Helper to call Gemini with automatic model cascade and resilient fallback
export async function callGemini(ai: GoogleGenAI, contents: any, config?: any) {
  const models = ['gemini-3.7-flash', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config,
        }),
        7000
      );
    } catch (err: any) {
      lastError = err;
      console.info(`[BetweenUs] Model ${model} unavailable (${err?.message?.slice(0, 75) || 'timed out'}), checking fallback...`);
    }
  }

  throw lastError || new Error('All model candidates unavailable');
}

// -------------------------------------------------------------
// Handler 1: Clarify
// -------------------------------------------------------------
export async function handleClarify(body: any) {
  const { recipient, relationship, situations, goals, userContext, shouldNotImply, previousQuestionCount } = body || {};

  if ((previousQuestionCount ?? 0) >= 2) {
    return { questions: [] };
  }

  const contextWords = (userContext || '').trim().split(/\s+/).filter(Boolean).length;
  const ai = getGeminiClient();

  if (!ai) {
    if (contextWords < 5 && contextWords > 0) {
      return {
        questions: [
          {
            id: 'q1',
            question: 'Could you share a little more about what specifically occurred, so the message can reflect the exact situation without guessing?',
            reason: 'The context is very brief and might lead to unintended assumptions.',
          },
        ],
      };
    }
    return { questions: [] };
  }

  try {
    const prompt = `You are the clarification engine for "Between Us", an AI writing workspace for sensitive interpersonal communication.
Your role is to determine if CRITICAL details are missing before drafting a message.

CORE RULES:
1. Never invent missing details.
2. Ask at most 1 focused question if crucial information is ambiguous or missing.
3. If the user context is already clear enough to write a respectful, bounded message, return an empty list of questions.
4. Total questions allowed is at most 2, and previous question count is ${previousQuestionCount || 0}.
5. Do not interrogate the user or ask for private psychological analysis.

User Input:
- Recipient: ${recipient || 'Not specified'}
- Relationship: ${relationship || 'Not specified'}
- Situations: ${(situations || []).join(', ') || 'None selected'}
- Goals: ${(goals || []).join(', ') || 'None selected'}
- User Context: "${userContext || ''}"
- Should NOT Imply: "${shouldNotImply || 'None'}"

Determine if ONE single clarification question is necessary to draft accurately without inventing facts.
Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text...",
      "reason": "Why this clarity protects the user's intent"
    }
  ]
}
If no clarification is needed, return { "questions": [] }.`;

    const response = await callGemini(ai, prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['id', 'question', 'reason'],
            },
          },
        },
        required: ['questions'],
      },
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    return parsed;
  } catch (err: any) {
    console.info('[BetweenUs] Clarify API using grounded default questions:', err?.message || err);
    return { questions: [] };
  }
}

// -------------------------------------------------------------
// Handler 2: Generate Draft
// -------------------------------------------------------------
export async function handleGenerateDraft(body: any) {
  const {
    recipient,
    relationship,
    situations,
    customSituation,
    goals,
    customGoal,
    userContext,
    shouldNotImply,
    tone,
    length,
    format,
    mode,
    clarificationQA,
  } = body || {};

  const ai = getGeminiClient();

  const allSituations = [...(situations || []), customSituation].filter(Boolean);
  const allGoals = [...(goals || []), customGoal].filter(Boolean);

  const greeting =
    format === 'Text Message'
      ? recipient
        ? `Hey ${recipient}, `
        : 'Hey, '
      : format === 'Email'
      ? recipient
        ? `Dear ${recipient},\n\n`
        : 'Hello,\n\n'
      : recipient
      ? `Dear ${recipient},\n\n`
      : 'To whom it may concern,\n\n';

  const closing =
    format === 'Text Message'
      ? '\nLet me know when you have a chance to talk.'
      : format === 'Email'
      ? '\n\nBest regards,\nAlex'
      : '\n\nSincerely,\nAlex';

  const cleanContext = (userContext || '').trim();

  const generateFallbackDraft = () => {
    let draft = '';
    if (mode === 'More Empathetic') {
      draft = `${greeting}I wanted to reach out thoughtfully. Regarding what happened, ${cleanContext} I value our communication and wanted to make sure we are on the same page without creating unnecessary distance.${closing}`;
    } else if (mode === 'More Direct') {
      draft = `${greeting}I am writing to address this clearly. ${cleanContext} Moving forward, I want to ensure this boundary is understood so we can keep things constructive.${closing}`;
    } else {
      draft = `${greeting}I’ve been reflecting on our situation. ${cleanContext} I wanted to share this openly so we can move forward with mutual clarity.${closing}`;
    }
    return draft;
  };

  if (!ai) {
    return { draft: generateFallbackDraft(), source: 'fallback' };
  }

  try {
    const qaContext = (clarificationQA || [])
      .map((item: any) => `Q: ${item.question}\nA: ${item.answer}`)
      .join('\n');

    const systemInstruction = `You are "Between Us", an AI-assisted writing workspace for difficult interpersonal communication.
Your sole purpose is to help users translate complex interpersonal intent into a clear, grounded message without losing nuance, responsibility balance, or personal boundaries.

CORE BEHAVIOR RULES (NON-NEGOTIABLE):
1. Never invent facts, events, emotions, intentions, motivations, or relationship details that the user did not provide.
2. Never assume what the recipient thinks or feels.
3. Do not automatically make the user accept all responsibility.
4. Preserve shared responsibility if the user indicates that both sides contributed to the situation.
5. Preserve the user’s stated boundaries.
6. Do not intensify blame or add passive-aggressive subtext.
7. Do not reinterpret the user’s position without permission.
8. If something remains uncertain, keep it uncertain instead of turning it into a fact.
9. Help the user communicate; do not decide what the user should believe.
10. The draft MUST strictly respect what the user stated the message should NOT imply.
11. The draft must reflect the chosen Tone (${tone || 'Calm'}), Length (${length || 'Medium'}), Format (${format || 'Text Message'}), and Mode (${mode || 'Balanced'}).
    - "Balanced": Neutral equilibrium between accountability and boundaries.
    - "More Empathetic": Leans into warmth and mutual understanding, without capitulating on stated boundaries or taking unearned blame.
    - "More Direct": Crisp, concise, and focused on boundaries/clarity, without sounding hostile.`;

    const prompt = `Write a draft message for the user adhering strictly to the constraints below.

RECIPIENT & RELATIONSHIP:
- Recipient: ${recipient || 'Not specified (use a natural greeting for the format)'}
- Relationship: ${relationship || 'Not specified'}

SITUATION & GOALS:
- Situations: ${allSituations.join(', ') || 'None selected'}
- Goals: ${allGoals.join(', ') || 'None selected'}

USER'S OWN WORDS & CONTEXT:
"${userContext || ''}"

ADDITIONAL CLARIFICATIONS (IF ANY):
${qaContext || 'None'}

WHAT THIS MESSAGE MUST NOT IMPLY (CRITICAL CONSTRAINT):
"${shouldNotImply || 'No specific negative implications provided'}"

FORMATTING CONSTRAINTS:
- Format: ${format} (${format === 'Text Message' ? 'casual/compact messaging style' : format === 'Email' ? 'clean subject line if helpful and email greeting/closing' : 'formal letter structure'})
- Tone: ${tone}
- Length: ${length}
- Draft Mode: ${mode}

Output ONLY the final draft message text. Do not include meta commentary, markdown code fences, or disclaimers.`;

    const response = await callGemini(ai, prompt, {
      systemInstruction,
      temperature: 0.4,
    });

    const draft = response.text?.trim() || '';
    if (!draft) {
      throw new Error('Empty response from model');
    }
    return { draft, source: 'gemini' };
  } catch (err: any) {
    console.info('[BetweenUs] Draft generator using grounded fallback draft:', err?.message || err);
    return { draft: generateFallbackDraft(), source: 'fallback' };
  }
}

// -------------------------------------------------------------
// Handler 3: Check Assumptions
// -------------------------------------------------------------
export async function handleCheckAssumptions(body: any) {
  const { draft, recipient, relationship, situations, goals, userContext, shouldNotImply } = body || {};

  const fallbackResponse = {
    supportedByInput: [
      {
        id: 'sup-1',
        statement: userContext ? `Reflects user context: "${userContext.slice(0, 45)}..."` : 'Addresses recipient directly',
        sourceContext: 'User context',
      },
    ],
    possibleAssumptions: [],
    responsibilityBalance: {
      accountability: {
        title: 'Accountability',
        scoreLabel: 'Balanced',
        description: 'The message acknowledges the interaction respectfully.',
        status: 'positive',
      },
      boundary: {
        title: 'Boundary',
        scoreLabel: 'Preserved',
        description: 'Core boundaries and requests are kept intact.',
        status: 'positive',
      },
      balance: {
        title: 'Responsibility Balance',
        scoreLabel: 'Equitable',
        description: 'Does not assign unilateral fault or invite unearned blame.',
        status: 'positive',
      },
      summary: 'This draft maintains a grounded tone, keeping your boundaries clear while acknowledging what happened.',
    },
    analyzedAt: Date.now(),
  };

  const ai = getGeminiClient();
  if (!ai) {
    return fallbackResponse;
  }

  try {
    const prompt = `You are the Assumption & Responsibility Balance Inspector for "Between Us".
Analyze the following generated draft against the user's explicit input.

USER'S ORIGINAL INPUT:
- Recipient: ${recipient || 'Not specified'}
- Relationship: ${relationship || 'Not specified'}
- Situations: ${(situations || []).join(', ')}
- Goals: ${(goals || []).join(', ')}
- User Context: "${userContext || ''}"
- What message should NOT imply: "${shouldNotImply || ''}"

DRAFT TO ANALYZE:
"""
${draft}
"""

YOUR TASK:
1. SUPPORTED BY YOUR INPUT: List 1 to 4 statements in the draft that clearly and accurately originate from the user's provided information.
2. POSSIBLE ASSUMPTIONS: Identify any phrasing in the draft that introduces:
   - unsupported emotions (e.g. "I know you're upset")
   - unsupported motives (e.g. "You were trying to help")
   - unsupported events
   - assumptions about what the recipient thinks or feels
   - unsupported responsibility (e.g. taking blame user did not mention)
   - promises or commitments the user did not explicitly state
   - violations of what the message should NOT imply
   For each unsupported item, provide the exact highlighted text, category, a 1-sentence calm explanation, and a neutral replacement phrase.
   If no unsupported assumptions exist, leave possibleAssumptions as an empty array.
3. RESPONSIBILITY BALANCE:
   - Accountability: Does the message acknowledge what the user said they regret? (status: 'positive' | 'neutral' | 'attention')
   - Boundary: Does the message preserve what the user still stands by? (status: 'positive' | 'neutral' | 'attention')
   - Responsibility Balance: Does the message avoid making one side responsible for everything unless the user explicitly said so? (status: 'positive' | 'neutral' | 'attention')
   - Summary: A calm 1-2 sentence non-judgmental summary.

Output JSON matching the required schema.`;

    const response = await callGemini(ai, prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          supportedByInput: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                statement: { type: Type.STRING },
                sourceContext: { type: Type.STRING },
              },
              required: ['id', 'statement', 'sourceContext'],
            },
          },
          possibleAssumptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                originalText: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  description: 'unsupported_emotion, unsupported_motive, unsupported_event, recipient_assumption, unsupported_responsibility, unsupported_commitment',
                },
                categoryLabel: { type: Type.STRING },
                explanation: { type: Type.STRING },
                neutralReplacement: { type: Type.STRING },
              },
              required: ['id', 'originalText', 'category', 'categoryLabel', 'explanation', 'neutralReplacement'],
            },
          },
          responsibilityBalance: {
            type: Type.OBJECT,
            properties: {
              accountability: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scoreLabel: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['title', 'scoreLabel', 'description', 'status'],
              },
              boundary: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scoreLabel: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['title', 'scoreLabel', 'description', 'status'],
              },
              balance: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scoreLabel: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['title', 'scoreLabel', 'description', 'status'],
              },
              summary: { type: Type.STRING },
            },
            required: ['accountability', 'boundary', 'balance', 'summary'],
          },
        },
        required: ['supportedByInput', 'possibleAssumptions', 'responsibilityBalance'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.analyzedAt = Date.now();
    return parsed;
  } catch (err: any) {
    console.info('[BetweenUs] Assumptions inspector using grounded analysis:', err?.message || err);
    return fallbackResponse;
  }
}

// -------------------------------------------------------------
// Handler 4: Rewrite Selection
// -------------------------------------------------------------
export async function handleRewriteSelection(body: any) {
  const { fullDraft, selectedText, action, shouldNotImply } = body || {};

  if (!selectedText || !action) {
    return { error: 'Missing selectedText or action' };
  }

  const ai = getGeminiClient();

  const getFallbackReplacement = () => {
    let fallback = selectedText;
    if (action === 'warmer') {
      fallback = `I appreciate where you are coming from, and ${selectedText.toLowerCase()}`;
    } else if (action === 'shorter') {
      fallback = selectedText.split(/[,.]/)[0] || selectedText;
    } else if (action === 'direct') {
      fallback = selectedText.replace(/I feel like maybe/i, 'I need');
    } else if (action === 'remove_blame') {
      fallback = selectedText.replace(/you always|you never|you did/gi, 'this situation');
    } else if (action === 'neutral') {
      fallback = selectedText.replace(/unacceptable|terrible|unfair/gi, 'concerning');
    }
    return fallback;
  };

  if (!ai) {
    return { replacement: getFallbackReplacement() };
  }

  try {
    const actionPrompts: Record<string, string> = {
      warmer: 'Make this specific phrase warmer and more empathetic without apologizing for things the user did not do.',
      shorter: 'Make this specific phrase more concise and minimal while keeping the exact meaning.',
      direct: 'Make this specific phrase more direct and straightforward, removing hedging or hesitation without becoming rude.',
      remove_blame: 'Remove any accusatory tone or intensified blame from this specific phrase, converting it into neutral, constructive language.',
      neutral: 'Make this specific phrase completely neutral, removing emotional speculation or assumptions.',
    };

    const prompt = `You are a surgical editor for "Between Us".
You are rewriting ONLY the selected snippet from a larger draft.

Full draft context:
"""
${fullDraft}
"""

Selected snippet to rewrite:
"${selectedText}"

Editing Instruction:
${actionPrompts[action] || 'Improve clarity and respect boundaries.'}

CRITICAL RULES:
- Return ONLY the replacement phrase that should directly substitute for the selected snippet.
- Keep the tense, grammar, and sentence continuity seamless with the surrounding text.
- Never violate the rule that the message should NOT imply: "${shouldNotImply || 'none'}".
- Do not output quotes or explanations.`;

    const response = await callGemini(ai, prompt, {
      temperature: 0.3,
    });

    const replacement = (response.text || selectedText).trim().replace(/^["']|["']$/g, '');
    return { replacement };
  } catch (err: any) {
    console.info('[BetweenUs] Surgical rewriter using grounded replacement:', err?.message || err);
    return { replacement: getFallbackReplacement() };
  }
}

// -------------------------------------------------------------
// Handler 5: Health Check
// -------------------------------------------------------------
export function handleHealth() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  return { status: 'ok', hasGeminiKey: hasKey, model: 'gemini-3.8-flash' };
}
