import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { ChatBot } from './components/ChatBot';
import { extractSwitchgearData } from './services/geminiService';
import { SwitchgearData } from './types';
import { Loader2, FileText, ArrowLeft, Settings, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SettingsModal } from './components/SettingsModal';
import { generateTestPdf } from './utils/pdfGenerator';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SwitchgearData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      setError(`${t.upload.error}: ${err.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the mock PDF file from the public path
      const response = await fetch('/test-lv.pdf');
      if (!response.ok) throw new Error(language === 'de' ? 'Test-PDF konnte nicht geladen werden' : 'Test PDF could not be loaded');
      const blob = await response.blob();
      const mockPdf = new File([blob], "Test-LV_K5011.pdf", { type: "application/pdf" });
      setFile(mockPdf);
      
      // Simulate network delay for extraction
      setTimeout(() => {
        setData({
          current: 2000,
          icw: 65,
          voltage: 400,
          ip: "IP40",
          form: "4b",
          ui: 1000,
          ipk: 100,
          protectionClass: 1,
          height: 2200,
          base: 200,
          width: 600,
          depth: 600,
          busbarPosition: language === 'de' ? "oben" : "top",
          uimp: 8,
          installationType: language === 'de' ? "Einfront" : "Single-front",
          features: {
            arcFault: true,
            einschub: true,
            mcc: false,
            nj63: false,
            kompensation: false,
            universal: false
          },
          positions: [
            { field: language === 'de' ? "Bemessungsstrom" : "Rated current", quote: "Hauptsammelschienen: 2000 A", page: 17 },
            { field: language === 'de' ? "Schutzart" : "Protection class", quote: "Schutzart IP40", page: 14 },
            { field: language === 'de' ? "Innere Form" : "Internal form", quote: "Form der inneren Unterteilung der Leistungsschalterfelder: Form 4b", page: 17 },
            { field: language === 'de' ? "Bemessungskurzzeitstrom" : "Rated short-time current", quote: "Bemessungskurzzeitstrom Icw(1 s) > 65 kA", page: 18 },
            { field: language === 'de' ? "Bemessungsbetriebsspannung Ue" : "Rated operating voltage Ue", quote: "Bemessungsbetriebsspannung Ue: 400 V/50 Hz", page: 17 },
            { field: language === 'de' ? "Störlichtbogenschutz" : "Arc fault protection", quote: "Das Sammelschienensystem ist mit Störlichtbogenbarrieren zur Begrenzung des Störlichtbogens auf das Feld auszurüsten.", page: 8 },
            { field: language === 'de' ? "Einschubtechnik" : "Withdrawable technology", quote: "Leistungsschalter in Einschubtechnik sind im Einschubrahmen auszuführen.", page: 11 },
            { field: language === 'de' ? "Abmessungen" : "Dimensions", quote: "Höhe x Breite x Tiefe: 2200 x 600 x 600 mm", page: 18 },
          ]
        });
        setIsLoading(false);
      }, 1500);
    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(`${t.upload.simulationFailed}: ${err.message}`);
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#00cccc] selection:text-white relative">
      {/* Background Image with Transparency */}
      <div 
        className="fixed inset-0 z-0 bg-[url('/public/images/AI_bagground.png')] bg-cover bg-center bg-no-repeat bg-fixed opacity-40 pointer-events-none"
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
                {t.header.title}
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">v2.6.2</span>
              </h1>
              <span className="text-[10px] text-white/80 uppercase tracking-wider">{t.header.subtitle}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {data && (
              <button 
                onClick={reset}
                className="text-sm font-medium text-white/90 hover:text-white flex items-center transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t.header.newAnalysis}
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'de' ? 'bg-white text-[#009999]' : 'text-white hover:bg-white/10'}`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'en' ? 'bg-white text-[#009999]' : 'text-white hover:bg-white/10'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={t.header.settings}
            >
              <Settings className="w-5 h-5" />
            </button>
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
                  {t.upload.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {t.upload.description}
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
                  {t.upload.simulate}
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
            <LoadingScreen fileName={file?.name || (language === 'de' ? 'Dokument' : 'Document')} />
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
                    {t.results.analyzed}
                  </span>
                </div>
              </div>
              
              <ResultsDashboard initialData={data} file={file} />
              <ChatBot data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      </div>
    </div>
  );
}
