import { SwitchgearData } from "../types";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Siemens-Proof Gemini Implementation using native fetch
 * This avoids the @google/genai dependency which is often blocked in internal Artifactory.
 */
const callGeminiApi = async (model: string, prompt: string, schema: any) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text;
};

export const extractSwitchgearData = async (file: File): Promise<SwitchgearData> => {
  try {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    let extractedText = "";
    
    if (isPdf) {
      extractedText = await extractTextFromPdf(file);
    } else {
      try {
        const isGaebClassic = file.name.toLowerCase().endsWith('.d83') || file.name.toLowerCase().endsWith('.p83');
        extractedText = await readFileAsText(file, isGaebClassic ? 'ISO-8859-1' : 'UTF-8');
      } catch (err) {
        extractedText = await readFileAsText(file, 'ISO-8859-1');
      }
    }

    if (extractedText.length > 100000) {
      extractedText = extractedText.substring(0, 100000) + "... [Text gekürzt]";
    }
    
    const prompt = `Hier ist der Inhalt eines Leistungsverzeichnisses:\n\n${extractedText}\n\n
    Bitte analysiere dieses Leistungsverzeichnis und extrahiere alle relevanten technischen Daten für die Schaltanlage (Niederspannungshauptverteilung).
    Gib die Daten im vorgegebenen JSON-Format zurück. Wenn eine Information nicht gefunden wird, nutze null (für Zahlen) oder "unbekannt" (für Strings).`;

    const schema = {
      type: "object",
      properties: {
        current: { type: "number" },
        icw: { type: "number" },
        voltage: { type: "number" },
        ip: { type: "string" },
        form: { type: "string" },
        busbarPosition: { type: "string" },
        uimp: { type: "number" },
        ui: { type: "number" },
        ipk: { type: "number" },
        protectionClass: { type: "number" },
        height: { type: "number" },
        base: { type: "number" },
        width: { type: "number" },
        depth: { type: "number" },
        installationType: { type: "string" },
        features: {
          type: "object",
          properties: {
            arcFault: { type: "boolean" },
            einschub: { type: "boolean" },
            mcc: { type: "boolean" },
            nj63: { type: "boolean" },
            kompensation: { type: "boolean" },
            universal: { type: "boolean" }
          }
        },
        positions: { 
          type: "array", 
          items: { 
            type: "object",
            properties: {
              field: { type: "string" },
              quote: { type: "string" },
              page: { type: "number" }
            }
          }
        }
      }
    };

    let responseText;
    const models = ["gemini-3-flash-preview", "gemini-2.5-flash-latest", "gemini-3.1-flash-lite-preview"];
    
    let lastError;
    for (const model of models) {
      try {
        responseText = await callGeminiApi(model, prompt, schema);
        if (responseText) break;
      } catch (error: any) {
        lastError = error;
        if (error.message === "QUOTA_EXCEEDED") continue;
        throw error;
      }
    }

    if (!responseText) throw lastError || new Error("Keine Antwort von der KI erhalten");
    
    const rawData = JSON.parse(responseText);
    
    return {
      current: rawData.current ?? null,
      icw: rawData.icw ?? null,
      voltage: rawData.voltage ?? null,
      ip: rawData.ip || 'unbekannt',
      form: rawData.form || 'unbekannt',
      busbarPosition: rawData.busbarPosition || 'unbekannt',
      uimp: rawData.uimp ?? null,
      ui: rawData.ui ?? null,
      ipk: rawData.ipk ?? null,
      protectionClass: rawData.protectionClass ?? null,
      height: rawData.height ?? null,
      base: rawData.base ?? null,
      width: rawData.width ?? null,
      depth: rawData.depth ?? null,
      installationType: rawData.installationType || 'unbekannt',
      fullText: extractedText,
      features: {
        arcFault: rawData.features?.arcFault || false,
        einschub: rawData.features?.einschub || false,
        mcc: rawData.features?.mcc || false,
        nj63: rawData.features?.nj63 || false,
        kompensation: rawData.features?.kompensation || false,
        universal: rawData.features?.universal || false,
      },
      positions: rawData.positions || []
    };
  } catch (error: any) {
    console.error("Error in extractSwitchgearData:", error);
    if (error.message === "QUOTA_EXCEEDED") {
      throw new Error("Die KI-Quote wurde überschritten. Bitte warten Sie eine Minute.");
    }
    throw error;
  }
};

const readFileAsText = (file: File, encoding: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, encoding);
  });
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
    fullText += `\n--- SEITE ${i} ---\n` + pageText + '\n';
  }
  return fullText;
};
