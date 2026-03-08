import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import {
  translateFields,
  extractTranslatableFields,
  type SupportedLanguage,
} from "@/lib/translate";

const TRANSLATIONS_COLLECTION = "translations";

function getTranslationDocId(
  collection: string,
  documentId: string,
  lang: string
) {
  return `${collection}_${documentId}_${lang}`;
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    const documentId = searchParams.get("documentId");
    const lang = searchParams.get("lang");

    if (collection && documentId && lang) {
      const docId = getTranslationDocId(collection, documentId, lang);
      const doc = await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .doc(docId)
        .get();

      if (!doc.exists) {
        return Response.json({ fields: {} });
      }
      return Response.json(doc.data());
    }

    if (collection && documentId) {
      const prefix = `${collection}_${documentId}_`;
      const snapshot = await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .where("__name__", ">=", prefix)
        .where("__name__", "<=", prefix + "\uf8ff")
        .get();

      const translations: Record<string, unknown> = {};
      snapshot.docs.forEach((doc) => {
        const lang = doc.id.replace(prefix, "");
        translations[lang] = doc.data();
      });
      return Response.json(translations);
    }

    if (collection) {
      const prefix = `${collection}_`;
      const snapshot = await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .where("__name__", ">=", prefix)
        .where("__name__", "<=", prefix + "\uf8ff")
        .get();

      const result: Record<
        string,
        Record<string, { fieldCount: number; autoTranslated: boolean }>
      > = {};
      snapshot.docs.forEach((doc) => {
        const parts = doc.id.replace(prefix, "");
        const lastUnderscore = parts.lastIndexOf("_");
        const docId = parts.substring(0, lastUnderscore);
        const lang = parts.substring(lastUnderscore + 1);
        const data = doc.data();

        if (!result[docId]) result[docId] = {};
        result[docId][lang] = {
          fieldCount: Object.keys(data.fields || {}).length,
          autoTranslated: data.autoTranslated ?? false,
        };
      });
      return Response.json(result);
    }

    return Response.json(
      { error: "Provide at least a collection parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching translations:", error);
    return Response.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      collection,
      documentId,
      targetLang,
      action,
      fields: manualFields,
    } = body as {
      collection: string;
      documentId: string;
      targetLang: SupportedLanguage;
      action: "auto-translate" | "save";
      fields?: Record<string, string>;
    };

    if (!collection || !documentId || !targetLang) {
      return Response.json(
        { error: "collection, documentId, and targetLang are required" },
        { status: 400 }
      );
    }

    const docId = getTranslationDocId(collection, documentId, targetLang);

    if (action === "save" && manualFields) {
      const translationDoc = {
        fields: manualFields,
        sourceLanguage: "en",
        targetLanguage: targetLang,
        autoTranslated: false,
        lastUpdated: new Date().toISOString(),
      };

      await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .doc(docId)
        .set(translationDoc, { merge: true });

      return Response.json({ success: true, ...translationDoc });
    }

    if (action === "auto-translate") {
      const sourceDoc = await adminDb.collection(collection).doc(documentId).get();

      if (!sourceDoc.exists) {
        return Response.json(
          { error: "Source document not found" },
          { status: 404 }
        );
      }

      const sourceData = sourceDoc.data() as Record<string, unknown>;
      const type = collection === "tours" ? "tour" : "dayTour";
      const sourceFields = extractTranslatableFields(sourceData, type);

      const translatedFields = await translateFields(
        sourceFields,
        targetLang,
        "en"
      );

      const translationDoc = {
        fields: translatedFields,
        sourceLanguage: "en",
        targetLanguage: targetLang,
        autoTranslated: true,
        lastUpdated: new Date().toISOString(),
      };

      await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .doc(docId)
        .set(translationDoc);

      return Response.json({ success: true, ...translationDoc });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in translations:", error);
    return Response.json(
      { error: "Translation operation failed" },
      { status: 500 }
    );
  }
}
