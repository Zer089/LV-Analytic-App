import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  fileName: string;
}

const steps = [
  "Dokument wird hochgeladen...",
  "Textextraktion (OCR) läuft...",
  "KI analysiert elektrotechnische Parameter...",
  "Spezielle Anforderungen werden identifiziert...",
  "Belegstellen werden verknüpft...",
  "System-Empfehlung wird berechnet...",
  "Ergebnisse werden aufbereitet..."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ fileName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress over ~15 seconds (typical API call time)
    const totalDuration = 15000;
    const intervalTime = 100;
    const stepsCount = steps.length;
    const stepDuration = totalDuration / stepsCount;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (totalDuration / intervalTime));
        return next > 99 ? 99 : next; // Don't reach 100% until actually done
      });
    }, intervalTime);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        return next >= stepsCount ? stepsCount - 1 : next;
      });
    }, stepDuration);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <motion.div 
      key="loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-12"
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
            LV Analyse starten
          </h2>
          
          <p className="text-lg text-slate-600 mb-12">
            Laden Sie ein PDF oder eine GAEB-Datei hoch. Die KI extrahiert automatisch relevante Parameter für die NSHV-Auslegung.
          </p>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden relative">
            <motion.div 
              className="bg-[#009999] h-full rounded-full absolute left-0 top-0"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-sm font-medium text-[#009999] animate-pulse">
              {steps[currentStep]}
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
