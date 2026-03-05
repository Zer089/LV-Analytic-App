import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  fileName: string;
}

const steps = [
  { text: "Dokument wird eingelesen...", duration: 1500 },
  { text: "Textextraktion (OCR) wird durchgeführt...", duration: 2500 },
  { text: "KI analysiert elektrotechnische Parameter...", duration: 3500 },
  { text: "Spezielle Anforderungen werden identifiziert...", duration: 3000 },
  { text: "System-Empfehlung wird berechnet...", duration: 2000 },
  { text: "Ergebnisse werden finalisiert...", duration: 4000 }
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ fileName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      key="loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-12"
    >
      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#009999] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#009999] opacity-10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-[#009999]/10 text-[#009999] rounded-2xl mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            LV Analyse läuft...
          </h2>
          
          <p className="text-lg text-slate-600 mb-12">
            Laden Sie ein PDF oder eine GAEB-Datei hoch. Die KI extrahiert automatisch relevante Parameter für die NSHV-Auslegung.
          </p>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden relative">
            <motion.div 
              className="bg-gradient-to-r from-[#009999] via-[#00cccc] via-[#00ffff] via-[#00cccc] to-[#009999] h-full rounded-full absolute left-0 top-0 w-1/3 shadow-[0_0_15px_rgba(0,153,153,0.5)]"
              animate={{ 
                left: ["-33%", "100%"],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* AI Pulse Effect */}
            <motion.div 
              className="absolute inset-0 bg-[#009999]/10"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-sm font-medium text-[#009999] animate-pulse">
              {steps[currentStep].text}
            </p>
            <p className="text-xs text-slate-400">
              Analysiere "{fileName}"...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
