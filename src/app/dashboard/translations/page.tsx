"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Languages,
  Globe,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useRequirePermission } from "@/lib/useRequirePermission";

interface TranslationStatus {
  [docId: string]: {
    [lang: string]: { fieldCount: number; autoTranslated: boolean };
  };
}

interface DocumentInfo {
  id: string;
  name: string;
  collection: string;
}

interface TranslationFields {
  fields: Record<string, string>;
  sourceLanguage: string;
  targetLanguage: string;
  autoTranslated: boolean;
  lastUpdated: string;
}

const LANGUAGES = [
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
];

type ContentTab = "tours" | "dayTours";

export default function TranslationsPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("translations");
  const [activeTab, setActiveTab] = useState<ContentTab>("tours");
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [translationStatus, setTranslationStatus] =
    useState<TranslationStatus>({});
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>("de");
  const [sourceFields, setSourceFields] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [originalTranslation, setOriginalTranslation] = useState<
    Record<string, string>
  >({});
  const [isAutoTranslated, setIsAutoTranslated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const collection = activeTab === "tours" ? "tours" : "dayTours";

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const apiPath =
        activeTab === "tours" ? "/api/tours?all=true" : "/api/day-tours";
      const res = await fetch(apiPath, { headers });
      const data = await res.json();
      const docs: DocumentInfo[] = (data || []).map(
        (d: { id: string; name: string }) => ({
          id: d.id,
          name: d.name,
          collection,
        })
      );
      setDocuments(docs);

      const statusRes = await fetch(
        `/api/translations?collection=${collection}`,
        { headers }
      );
      const statusData = await statusRes.json();
      setTranslationStatus(statusData || {});
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [activeTab, collection, getToken]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (permLoading || !authorized) return null;

  const loadTranslation = async (doc: DocumentInfo, lang: string) => {
    setSelectedDoc(doc);
    setSelectedLang(lang);
    setLoading(true);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const sourceRes = await fetch(
        `/api/${doc.collection === "tours" ? "tours" : "day-tours"}/${doc.id}`,
        { headers }
      );
      const sourceData = await sourceRes.json();

      const type = doc.collection === "tours" ? "tour" : "dayTour";
      const extractedFields = extractFieldsClient(sourceData, type);
      setSourceFields(extractedFields);

      const transRes = await fetch(
        `/api/translations?collection=${doc.collection}&documentId=${doc.id}&lang=${lang}`,
        { headers }
      );
      const transData: TranslationFields = await transRes.json();

      if (transData.fields && Object.keys(transData.fields).length > 0) {
        setEditedFields({ ...transData.fields });
        setOriginalTranslation({ ...transData.fields });
        setIsAutoTranslated(transData.autoTranslated ?? false);
      } else {
        const emptyFields: Record<string, string> = {};
        Object.keys(extractedFields).forEach((key) => {
          emptyFields[key] = "";
        });
        setEditedFields(emptyFields);
        setOriginalTranslation({});
        setIsAutoTranslated(false);
      }
    } catch (error) {
      console.error("Failed to load translation:", error);
      toast.error("Failed to load translation");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!selectedDoc) return;
    setTranslating(true);

    try {
      const token = await getToken();
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          collection: selectedDoc.collection,
          documentId: selectedDoc.id,
          targetLang: selectedLang,
          action: "auto-translate",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditedFields(data.fields);
        setOriginalTranslation(data.fields);
        setIsAutoTranslated(true);
        toast.success("Auto-translation complete");
        fetchDocuments();
      } else {
        toast.error(data.error || "Auto-translation failed");
      }
    } catch (error) {
      console.error("Auto-translate failed:", error);
      toast.error("Auto-translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDoc) return;
    setSaving(true);

    try {
      const token = await getToken();
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          collection: selectedDoc.collection,
          documentId: selectedDoc.id,
          targetLang: selectedLang,
          action: "save",
          fields: editedFields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOriginalTranslation({ ...editedFields });
        setIsAutoTranslated(false);
        toast.success("Translations saved");
        fetchDocuments();
      } else {
        toast.error("Failed to save");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save translations");
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    return Object.keys(editedFields).some(
      (key) => editedFields[key] !== (originalTranslation[key] || "")
    );
  };

  const getStatusForDoc = (docId: string) => {
    const status = translationStatus[docId];
    if (!status) return { translated: 0, total: LANGUAGES.length };
    const translated = LANGUAGES.filter((l) => status[l.code]).length;
    return { translated, total: LANGUAGES.length };
  };

  const getStatusBadge = (docId: string, lang: string) => {
    const status = translationStatus[docId];
    if (!status || !status[lang]) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          Not translated
        </span>
      );
    }
    if (status[lang].autoTranslated) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          Auto-translated
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        Reviewed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Languages className="h-7 w-7 text-primary-600" />
            Translation Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Auto-translate and manually edit content in all supported languages
          </p>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["tours", "dayTours"] as ContentTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedDoc(null);
              setExpandedDoc(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "tours" ? "Tour Packages" : "Day Tours"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Document List - Left Side */}
        <div className="lg:col-span-2 space-y-3">
          {loading && documents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No content found</p>
            </div>
          ) : (
            documents.map((doc) => {
              const { translated, total } = getStatusForDoc(doc.id);
              const isExpanded = expandedDoc === doc.id;

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedDoc(isExpanded ? null : doc.id)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {translated}/{total} languages
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{
                            width: `${(translated / total) * 100}%`,
                          }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-1.5">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => loadTranslation(doc, lang.code)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedDoc?.id === doc.id &&
                            selectedLang === lang.code
                              ? "bg-primary-50 border border-primary-200 text-primary-700"
                              : "hover:bg-white border border-transparent"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                          {getStatusBadge(doc.id, lang.code)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Translation Editor - Right Side */}
        <div className="lg:col-span-3">
          {!selectedDoc ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Globe className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Select a document and language
              </h3>
              <p className="text-sm text-gray-400">
                Choose a tour or day tour from the list, then select a language
                to begin translating
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Editor Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedDoc.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      Translating to{" "}
                      {
                        LANGUAGES.find((l) => l.code === selectedLang)
                          ?.flag
                      }{" "}
                      {
                        LANGUAGES.find((l) => l.code === selectedLang)
                          ?.name
                      }
                      {isAutoTranslated && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Auto-translated
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoTranslate}
                      disabled={translating}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {translating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Auto-Translate All
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !hasUnsavedChanges()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
                {hasUnsavedChanges() && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>You have unsaved changes</span>
                  </div>
                )}
              </div>

              {/* Fields Editor */}
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {Object.entries(sourceFields).map(
                      ([fieldKey, sourceValue]) => (
                        <div key={fieldKey} className="p-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                            {formatFieldKey(fieldKey)}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                English (original)
                              </p>
                              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 min-h-[60px] border border-gray-100">
                                {sourceValue}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                {
                                  LANGUAGES.find(
                                    (l) => l.code === selectedLang
                                  )?.name
                                }
                                {editedFields[fieldKey] !==
                                  (originalTranslation[fieldKey] ||
                                    "") && (
                                  <span className="text-amber-500">
                                    (modified)
                                  </span>
                                )}
                                {editedFields[fieldKey] &&
                                  editedFields[fieldKey] ===
                                    originalTranslation[fieldKey] &&
                                  isAutoTranslated && (
                                    <RefreshCw className="h-3 w-3 text-blue-500" />
                                  )}
                              </p>
                              {sourceValue.length > 120 ? (
                                <textarea
                                  value={editedFields[fieldKey] || ""}
                                  onChange={(e) =>
                                    setEditedFields((prev) => ({
                                      ...prev,
                                      [fieldKey]: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all resize-none"
                                  placeholder="Enter translation..."
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editedFields[fieldKey] || ""}
                                  onChange={(e) =>
                                    setEditedFields((prev) => ({
                                      ...prev,
                                      [fieldKey]: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                                  placeholder="Enter translation..."
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                    {Object.keys(sourceFields).length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        <Check className="h-8 w-8 mx-auto mb-2" />
                        <p>No translatable fields found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFieldKey(key: string): string {
  return key
    .replace(/\./g, " › ")
    .replace(/(\d+)/g, " $1")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractFieldsClient(
  doc: Record<string, unknown>,
  type: "tour" | "dayTour"
): Record<string, string> {
  const fields: Record<string, string> = {};

  if (typeof doc.name === "string") fields["name"] = doc.name;
  if (typeof doc.summary === "string") fields["summary"] = doc.summary;
  if (typeof doc.overview === "string") fields["overview"] = doc.overview;

  if (Array.isArray(doc.highlights)) {
    doc.highlights.forEach((h: unknown, i: number) => {
      if (typeof h === "string") fields[`highlights.${i}`] = h;
    });
  }

  if (type === "tour") {
    if (Array.isArray(doc.itinerary)) {
      doc.itinerary.forEach(
        (day: Record<string, unknown>, i: number) => {
          if (typeof day.title === "string")
            fields[`itinerary.${i}.title`] = day.title;
          if (typeof day.description === "string")
            fields[`itinerary.${i}.description`] = day.description;
          if (Array.isArray(day.activities)) {
            day.activities.forEach((a: unknown, j: number) => {
              if (typeof a === "string")
                fields[`itinerary.${i}.activities.${j}`] = a as string;
            });
          }
        }
      );
    }

    if (Array.isArray(doc.faqs)) {
      doc.faqs.forEach(
        (faq: Record<string, unknown>, i: number) => {
          if (typeof faq.question === "string")
            fields[`faqs.${i}.question`] = faq.question;
          if (typeof faq.answer === "string")
            fields[`faqs.${i}.answer`] = faq.answer;
        }
      );
    }
  }

  if (type === "dayTour") {
    if (Array.isArray(doc.itinerary)) {
      doc.itinerary.forEach(
        (step: Record<string, unknown>, i: number) => {
          if (typeof step.title === "string")
            fields[`itinerary.${i}.title`] = step.title;
          if (typeof step.description === "string")
            fields[`itinerary.${i}.description`] = step.description;
        }
      );
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
