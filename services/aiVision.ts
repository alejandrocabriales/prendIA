import { AIVisionResult, ExtractedProduct } from "../types";

/**
 * SECURITY NOTE — read before shipping this to production:
 *
 * `EXPO_PUBLIC_OPENROUTER_API_KEY` is bundled straight into the mobile app,
 * so anyone can extract it from the binary/network traffic and burn your
 * OpenRouter quota. That's acceptable for this local MVP/demo, but it must
 * NOT ship to app stores like this. Iteration 2 should move this call
 * behind a backend endpoint (e.g. POST /api/analyze-product) that holds
 * the key server-side and the app never sees it.
 *
 * Put your key in a local `.env` file (gitignored) as:
 *   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
 *
 * If it's missing, `analyzeProductImages` falls back to a mock response
 * so the whole UX (camera -> loading -> results) can be tested without
 * spending any API credits.
 *
 * Model: qwen/qwen3.7-flash via OpenRouter — picked for cost (cheapest
 * reliable vision-capable model on OpenRouter as of 2026-10; the Qwen-VL
 * line is also strong at reading small text, which matters for garment
 * labels). Swap via https://openrouter.ai/models if pricing/quality shift.
 */
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_VISION_MODEL = "qwen/qwen3.7-flash";

type AnalyzeProductImagesParams = {
  productImageBase64: string;
  labelImageBase64?: string | null;
};

const SYSTEM_PROMPT = `Eres un sistema de visión por computadora especializado en moda, integrado en una app llamada PrendIA.

Vas a recibir una foto de una prenda y, opcionalmente, una foto de su etiqueta.

Tu única salida debe ser un JSON válido con exactamente esta forma, sin texto adicional, sin markdown, sin comentarios:

{
  "category": "string",
  "subcategory": "string | null",
  "color": "string | null",
  "pattern": "string | null",
  "material": "string | null",
  "style": "string | null",
  "visualAttributes": ["string"],
  "brand": "string | null",
  "size": "string | null",
  "price": "number | null",
  "sku": "string | null",
  "productCode": "string | null",
  "confidence": {
    "category": 0,
    "color": 0,
    "material": 0,
    "brand": 0,
    "size": 0,
    "price": 0
  }
}

Reglas estrictas:
1. No inventes datos. Si no podés determinar algo, usá null.
2. Si no hay foto de etiqueta, o la etiqueta no muestra talle/precio/marca con claridad, esos campos van en null.
3. No confundas un precio estimado con un precio leído. Solo poné "price" si lo leíste literalmente en una etiqueta.
4. No infieras una marca solo porque la prenda "parece" de esa marca. "brand" solo si está visible como texto/logo.
5. Los valores de "confidence" van de 0.0 a 1.0.
6. category siempre debe tener un valor (lo mejor que puedas identificar visualmente); todos los demás campos pueden ser null.
7. "visualAttributes" es una lista corta de atributos visuales descriptivos (ej: "acolchada", "cuello alto", "cierre frontal", "mangas largas"). Puede ser una lista vacía si no identificás ninguno con confianza.`;

function buildMockResponse(): ExtractedProduct {
  return {
    category: "campera",
    subcategory: "puffer",
    color: "negro",
    pattern: "liso",
    material: "nylon",
    style: "casual",
    visualAttributes: ["acolchada", "cuello alto", "cierre frontal", "mangas largas"],
    brand: null,
    size: null,
    price: null,
    sku: null,
    productCode: null,
    confidence: {
      category: 0.9,
      color: 0.85,
      material: 0.7,
      brand: 0,
      size: 0,
      price: 0,
    },
  };
}

function parseExtractedProduct(raw: string): ExtractedProduct {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  const parsed = JSON.parse(cleaned);

  return {
    category: parsed.category ?? "ropa",
    subcategory: parsed.subcategory ?? null,
    color: parsed.color ?? null,
    pattern: parsed.pattern ?? null,
    material: parsed.material ?? null,
    style: parsed.style ?? null,
    visualAttributes: Array.isArray(parsed.visualAttributes) ? parsed.visualAttributes : [],
    brand: parsed.brand ?? null,
    size: parsed.size ?? null,
    price: typeof parsed.price === "number" ? parsed.price : null,
    sku: parsed.sku ?? null,
    productCode: parsed.productCode ?? null,
    confidence: {
      category: parsed.confidence?.category ?? 0,
      color: parsed.confidence?.color ?? 0,
      material: parsed.confidence?.material ?? 0,
      brand: parsed.confidence?.brand ?? 0,
      size: parsed.confidence?.size ?? 0,
      price: parsed.confidence?.price ?? 0,
    },
  };
}

/**
 * Analyzes one or two product photos (garment + optional label) using a
 * multimodal vision model and returns structured product data.
 *
 * The rest of the app only knows about this function — it has no idea
 * whether the analysis came from OpenAI, Gemini, or a local mock.
 */
export async function analyzeProductImages({
  productImageBase64,
  labelImageBase64,
}: AnalyzeProductImagesParams): Promise<AIVisionResult> {
  if (!OPENROUTER_API_KEY) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true, data: buildMockResponse() };
  }

  try {
    const imageContents = [
      {
        type: "image_url" as const,
        image_url: { url: `data:image/jpeg;base64,${productImageBase64}` },
      },
    ];

    if (labelImageBase64) {
      imageContents.push({
        type: "image_url" as const,
        image_url: { url: `data:image/jpeg;base64,${labelImageBase64}` },
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://prendia.app",
        "X-Title": "PrendIA",
      },
      body: JSON.stringify({
        model: OPENROUTER_VISION_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: labelImageBase64
                  ? "Primera imagen: la prenda. Segunda imagen: la etiqueta. Analizá ambas y devolvé el JSON."
                  : "Esta es la foto de la prenda. No hay foto de etiqueta. Analizá y devolvé el JSON.",
              },
              ...imageContents,
            ],
          },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: { message: `La IA respondió con error (${response.status}).` },
      };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: { message: "La IA no devolvió contenido." } };
    }

    return { success: true, data: parseExtractedProduct(content) };
  } catch {
    return {
      success: false,
      error: { message: "No pudimos analizar la imagen. Probá con una foto más clara." },
    };
  }
}
