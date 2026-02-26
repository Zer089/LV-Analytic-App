import { GoogleGenAI, Type } from "@google/genai";
import { SwitchgearData } from "../types";
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractSwitchgearData = async (file: File): Promise<SwitchgearData> => {
  try {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    
    let extractedText = "";
    
    if (isPdf) {
      try {
        console.log("Starting PDF extraction...");
        extractedText = await extractTextFromPdf(file);
        console.log("PDF extraction successful. Length:", extractedText.length);
      } catch (pdfError: any) {
        console.error("Error extracting text from PDF with pdf.js:", pdfError);
        throw new Error(`Fehler beim lokalen Auslesen der PDF-Datei: ${pdfError.message || 'Unbekannter Fehler'}`);
      }
    } else {
      extractedText = await file.text();
    }
    
    const parts = [
      {
        text: `Hier ist der Inhalt eines Leistungsverzeichnisses:\n\n${extractedText}`,
      },
      {
        text: `Bitte analysiere dieses Leistungsverzeichnis und extrahiere alle relevanten technischen Daten für die Schaltanlage (Niederspannungshauptverteilung).
        Achte besonders auf:
        - Bemessungsstrom (current) in Ampere (A)
        - Kurzschlussstrom (icw) in kA
        - Spannung (voltage) in Volt (V)
        - Schutzart (ip) (z.B. "IP31")
        - Innere Form (form) (z.B. "Form 4b")
        - Features (Booleans): arcFault (Störlichtbogen), einschub (Einschubtechnik), mcc (Motor Control Center), nj63 (3NJ63 Lasttrenner), kompensation (Blindleistungskompensation)
        - Zitate (positions) aus dem LV als Beleg für die extrahierten Daten.
        
        Gib die Daten im vorgegebenen JSON-Format zurück. Wenn eine Information nicht gefunden wird, nutze Standardwerte (z.B. 400 für voltage, "Form 1" für form) oder null.`
      }
    ];

    console.log(`Sending ${extractedText.length} characters to Gemini...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current: { type: Type.NUMBER, description: "Bemessungsstrom in Ampere" },
            icw: { type: Type.NUMBER, description: "Kurzschlussstrom in kA" },
            voltage: { type: Type.NUMBER, description: "Spannung in Volt" },
            ip: { type: Type.STRING, description: "Schutzart (z.B. 'IP31')" },
            form: { type: Type.STRING, description: "Innere Form (z.B. 'Form 4b')" },
            features: {
              type: Type.OBJECT,
              properties: {
                arcFault: { type: Type.BOOLEAN, description: "Störlichtbogen" },
                einschub: { type: Type.BOOLEAN, description: "Einschubtechnik" },
                mcc: { type: Type.BOOLEAN, description: "Motor Control Center" },
                nj63: { type: Type.BOOLEAN, description: "3NJ63 Lasttrenner" },
                kompensation: { type: Type.BOOLEAN, description: "Blindleistungskompensation" }
              }
            },
            positions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Zitate aus dem LV als Beleg" }
          }
        }
      }
    });

    console.log("Raw Gemini Response:", response.text);
    
    let jsonStr = response.text || "{}";
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    const rawData = JSON.parse(jsonStr);
    
    // Apply fallbacks
    return {
      current: rawData.current ?? null,
      icw: rawData.icw ?? null,
      voltage: rawData.voltage ?? 400,
      ip: rawData.ip || 'IP31',
      form: rawData.form || 'Form 1',
      features: {
        arcFault: rawData.features?.arcFault || false,
        einschub: rawData.features?.einschub || false,
        mcc: rawData.features?.mcc || false,
        nj63: rawData.features?.nj63 || false,
        kompensation: rawData.features?.kompensation || false,
      },
      positions: rawData.positions || []
    };
  } catch (error) {
    console.error("Error in extractSwitchgearData:", error);
    throw error;
  }
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};
