import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { ChatBot } from './components/ChatBot';
import { extractSwitchgearData } from './services/geminiService';
import { SwitchgearData } from './types';
import { Loader2, FileText, ArrowLeft, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SwitchgearData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const extractedData = await extractSwitchgearData(selectedFile);
      setData(extractedData);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(`Fehler: ${err.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateAnalysis = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate network delay
    setTimeout(() => {
      setData({
        current: 2000,
        icw: 65,
        voltage: 400,
        ip: "IP30",
        form: "1",
        ui: 1000,
        ipk: 100,
        protectionClass: 1,
        height: 2000,
        base: 200,
        width: 800,
        depth: 800,
        installationType: "Wand",
        features: {
          arcFault: false,
          einschub: false,
          mcc: false,
          nj63: false,
          kompensation: false,
          universal: false
        },
        positions: [
          { field: "Bemessungsstrom", quote: "Der Bemessungsstrom der Anlage beträgt 2000A.", page: 122 },
          { field: "Schutzart", quote: "Die Schaltanlage ist in Schutzart IP30 auszuführen.", page: 125 },
          { field: "Innere Form", quote: "Form der inneren Unterteilung der Leistungsschalterfelder: Form 1", page: 128 },
          { field: "Bemessungskurzzeitstrom", quote: "Bemessungskurzzeitstrom Icw(1 s) > 65 kA", page: 129 },
          { field: "Bemessungsbetriebsspannung Ue", quote: "Bemessungsbetriebsspannung Ue: 400 V/50 Hz", page: 129 },
        ]
      });
      setIsLoading(false);
    }, 1000);
  };

  const reset = () => {
    setFile(null);
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#009999]/20 relative">
      {/* Background Image with Transparency */}
      <div 
        className="fixed inset-0 z-0 bg-[url('/images/AI_bagground.png')] bg-cover bg-center bg-no-repeat bg-fixed opacity-40 pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-[#009999] text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Siemens-like Logo Placeholder */}
            <div className="font-bold text-2xl tracking-tight">
              SIEMENS
            </div>
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                LV Analytic App
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">v2.4.2</span>
              </h1>
              <span className="text-[10px] text-white/80 uppercase tracking-wider">AI-Powered Extraction</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {data && (
              <button 
                onClick={reset}
                className="text-sm font-medium text-white/90 hover:text-white flex items-center transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Neue Analyse
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!data && !isLoading && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-[#009999]/10 text-[#009999] rounded-2xl mb-6">
                  <Activity className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Leistungsverzeichnis analysieren
                </h2>
                <p className="text-lg text-slate-600">
                  Laden Sie ein PDF oder eine GAEB-Datei hoch. Die KI extrahiert elektrotechnische Parameter und empfiehlt das optimale NSHV-System von Siemens.
                </p>
              </div>
              
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSimulateAnalysis}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-200 flex items-center shadow-sm"
                >
                  <Activity className="w-4 h-4 mr-2 text-slate-500" />
                  Analyse simulieren (Test)
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm text-center">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {isLoading && (
            <LoadingScreen fileName={file?.name || 'Dokument'} />
          )}

          {data && !isLoading && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{file?.name}</span>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    Erfolgreich analysiert
                  </span>
                </div>
              </div>
              
              <ResultsDashboard initialData={data} file={file} />
              <ChatBot />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  </div>
  );
}
