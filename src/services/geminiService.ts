import { GoogleGenAI, Type } from "@google/genai";
import { SwitchgearData } from "../types";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
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
        - Schutzart (ip): MUSS einer dieser Werte sein: "IP30", "IP31", "IP40", "IP41", "IP43", "IP54", oder "unbekannt" (wenn nicht gefunden).
        - Innere Form (form): MUSS einer dieser Werte sein: "1", "2a", "2b", "3a", "3b", "4a", "4b", oder "unbekannt" (wenn nicht gefunden).
        - Sammelschienenlage (busbarPosition): "Mittig", "Hinten", "Oben", oder "unbekannt"
        - Bemessungsstoßspannungsfestigkeit (uimp) in kV
        - Bemessungsisolationsspannung (ui) in V
        - Bemessungsstoßkurzschlussstrom (ipk) in kA
        - Schutzklasse (protectionClass): 1, 2, oder null
        - Höhe (height) in mm
        - Sockel (base) in mm
        - Breite (width) in mm
        - Tiefe (depth) in mm
        - Aufstellart (installationType): "Wand", "Rücken an Rücken", "Doppelfront", oder "unbekannt"
        - Features (Booleans): arcFault (Störlichtbogen), einschub (Einschubtechnik), mcc (Motor Control Center), nj63 (3NJ63 Lasttrenner), kompensation (Blindleistungskompensation), universal (Universaleinbautechnik)
        
        WICHTIG: Für JEDEN extrahierten Wert (Bemessungsstrom, Kurzschlussstrom, Spannung, Schutzart, Innere Form, und jedes gefundene Feature) MUSST du eine Belegstelle (Evidence) im Array "positions" anlegen.
        Jede Belegstelle muss enthalten:
        - field: Der Name des Parameters (z.B. "Bemessungsstrom", "Innere Form", "Einschubtechnik")
        - quote: Der exakte Textausschnitt aus dem Dokument, der diesen Wert belegt.
        - page: Die Seitenzahl, auf der der Text gefunden wurde (suche nach den "--- SEITE X ---" Markierungen im Text).
        
        Gib die Daten im vorgegebenen JSON-Format zurück. Wenn eine Information nicht gefunden wird, nutze Standardwerte (z.B. 400 für voltage, "unbekannt" für form) oder null.`
      }
    ];

    console.log(`Sending ${extractedText.length} characters to Gemini...`);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
            positions: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING, description: "Name des Parameters" },
                  quote: { type: Type.STRING, description: "Exakter Textausschnitt" },
                  page: { type: Type.NUMBER, description: "Seitenzahl" }
                }
              }, 
              description: "Zitate aus dem LV als Beleg für JEDEN gefundenen Wert, inkl. Seitenzahl." 
            }
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
    fullText += `\n--- SEITE ${i} ---\n` + pageText + '\n';
  }

  return fullText;
};
