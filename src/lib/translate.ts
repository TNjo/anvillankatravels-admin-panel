import { v2 } from "@google-cloud/translate";

const SUPPORTED_LANGUAGES = ["en", "he", "de", "fr", "es", "it", "nl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

let translateClient: v2.Translate | null = null;

function getClient(): v2.Translate {
  if (!translateClient) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_TRANSLATE_API_KEY environment variable is not set");
    }
    translateClient = new v2.Translate({ key: apiKey });
  }
  return translateClient;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "en"
): Promise<string> {
  if (!text || !text.trim()) return text;
  if (targetLang === sourceLang) return text;

  const client = getClient();
  const [translation] = await client.translate(text, {
    from: sourceLang,
    to: targetLang,
  });
  return translation;
}

export async function translateFields(
  fields: Record<string, string>,
  targetLang: string,
  sourceLang: string = "en"
): Promise<Record<string, string>> {
  if (targetLang === sourceLang) return fields;

  const entries = Object.entries(fields).filter(
    ([, value]) => value && value.trim()
  );

  if (entries.length === 0) return {};

  const client = getClient();
  const texts = entries.map(([, value]) => value);
  const [translations] = await client.translate(texts, {
    from: sourceLang,
    to: targetLang,
  });

  const translatedArray = Array.isArray(translations) ? translations : [translations];

  const result: Record<string, string> = {};
  entries.forEach(([key], idx) => {
    result[key] = translatedArray[idx];
  });

  return result;
}

export function extractTranslatableFields(
  doc: Record<string, unknown>,
  type: "tour" | "dayTour"
): Record<string, string> {
  const fields: Record<string, string> = {};

  if (typeof doc.name === "string") fields["name"] = doc.name;
  if (typeof doc.summary === "string") fields["summary"] = doc.summary;
  if (typeof doc.overview === "string") fields["overview"] = doc.overview;

  if (Array.isArray(doc.highlights)) {
    doc.highlights.forEach((h, i) => {
      if (typeof h === "string") fields[`highlights.${i}`] = h;
    });
  }

  if (type === "tour") {
    if (Array.isArray(doc.itinerary)) {
      doc.itinerary.forEach((day: Record<string, unknown>, i: number) => {
        if (typeof day.title === "string")
          fields[`itinerary.${i}.title`] = day.title;
        if (typeof day.description === "string")
          fields[`itinerary.${i}.description`] = day.description;
        if (Array.isArray(day.activities)) {
          day.activities.forEach((a: unknown, j: number) => {
            if (typeof a === "string")
              fields[`itinerary.${i}.activities.${j}`] = a;
          });
        }
      });
    }

    if (Array.isArray(doc.faqs)) {
      doc.faqs.forEach((faq: Record<string, unknown>, i: number) => {
        if (typeof faq.question === "string")
          fields[`faqs.${i}.question`] = faq.question;
        if (typeof faq.answer === "string")
          fields[`faqs.${i}.answer`] = faq.answer;
      });
    }
  }

  if (type === "dayTour") {
    if (Array.isArray(doc.itinerary)) {
      doc.itinerary.forEach((step: Record<string, unknown>, i: number) => {
        if (typeof step.title === "string")
          fields[`itinerary.${i}.title`] = step.title;
        if (typeof step.description === "string")
          fields[`itinerary.${i}.description`] = step.description;
      });
    }

    if (Array.isArray(doc.inclusions)) {
      doc.inclusions.forEach((item: unknown, i: number) => {
        if (typeof item === "string") fields[`inclusions.${i}`] = item;
      });
    }
    if (Array.isArray(doc.exclusions)) {
      doc.exclusions.forEach((item: unknown, i: number) => {
        if (typeof item === "string") fields[`exclusions.${i}`] = item;
      });
    }
  }

  return fields;
}

export function applyTranslations(
  doc: Record<string, unknown>,
  translations: Record<string, string>
): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(doc));

  for (const [path, value] of Object.entries(translations)) {
    const parts = path.split(".");
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      if (current[part] === undefined) {
        current[part] = isNaN(Number(nextPart)) ? {} : [];
      }
      current = current[part] as Record<string, unknown>;
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  return result;
}

export { SUPPORTED_LANGUAGES };
