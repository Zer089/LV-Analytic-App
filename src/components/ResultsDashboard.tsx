import React, { useState, useEffect, useMemo } from 'react';
import { SwitchgearData, SystemRecommendation } from '../types';
import { evaluateSystem } from '../utils/evaluation';
import { ConfigModal } from './ConfigModal';
import { 
  Zap, Shield, Ruler, FileText, CheckCircle2, 
  AlertCircle, Box, Activity, Hash, Settings, ChevronRight, ListChecks
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsDashboardProps {
  initialData: SwitchgearData;
  file?: File | null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ initialData, file }) => {
  const [data, setData] = useState<SwitchgearData>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [pdfBaseUrl, setPdfBaseUrl] = useState<string>('');

  useEffect(() => {
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfBaseUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const pdfSrc = useMemo(() => {
    if (!pdfBaseUrl) return '';
    let url = pdfBaseUrl;
    const params = [];
    if (pdfPage) params.push(`page=${pdfPage}`);
    if (searchQuery) {
      // Some PDF viewers support search parameter
      params.push(`search=${encodeURIComponent(searchQuery)}`);
    }
    
    if (params.length > 0) {
      url += `#${params.join('&')}`;
    }
    return url;
  }, [pdfBaseUrl, pdfPage, searchQuery]);

  const handlePageClick = (page: number | undefined, quote: string) => {
    if (page) {
      setPdfPage(page);
      // Optional: use quote for search if supported by the viewer
      // Clean up the quote to improve search chances (remove punctuation, etc.)
      const cleanQuote = quote.replace(/["']/g, '').trim();
      setSearchQuery(cleanQuote);
    }
  };

  const evaluation = evaluateSystem(data);

  const isModified = JSON.stringify(data) !== JSON.stringify(initialData);

  const systemImages: Record<SystemRecommendation, string> = {
    'ALPHA 3200 eco': '/images/A32-eco.png',
    'ALPHA 3200 classic': '/images/A32-classic.png',
    'SIVACON S8': '/images/S8.png'
  };

  const handleSaveConfig = (newData: SwitchgearData) => {
    setData(newData);
    setIsModalOpen(false);
  };

  const renderCard = (title: React.ReactNode, value: string | number | null, unit: string, icon: React.ReactNode, delay: number) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
            {value !== null && value !== '' ? (
              <>
                {value}
                <span className="text-sm font-medium text-slate-400">{unit}</span>
              </>
            ) : (
              <span className="text-base font-normal text-slate-300 italic">N/A</span>
            )}
          </p>
        </div>
        <div className="p-3 bg-[#009999]/10 rounded-xl text-[#009999]">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm xl:col-span-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#009999] mr-2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" x2="9" y1="1" y2="4"></line><line x1="15" x2="15" y1="1" y2="4"></line><line x1="9" x2="9" y1="20" y2="23"></line><line x1="15" x2="15" y1="20" y2="23"></line><line x1="20" x2="23" y1="9" y2="9"></line><line x1="20" x2="23" y1="14" y2="14"></line><line x1="1" x2="4" y1="9" y2="9"></line><line x1="1" x2="4" y1="14" y2="14"></line></svg>
              Erkannte Anforderungen NSHV
            </h3>
            {isModified && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full border border-yellow-200">
                manuelle Änderungen aktiv
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {renderCard(<>Bemessungsstrom (I<sub>n</sub>)</>, data.current, 'A', <Activity className="w-5 h-5" />, 0.1)}
            {renderCard(<>Kurzschlussstrom (I<sub>cw</sub>)</>, data.icw, 'kA', <AlertCircle className="w-5 h-5" />, 0.2)}
            {renderCard(<>Spannung (U<sub>e</sub>)</>, data.voltage, 'V', <Zap className="w-5 h-5" />, 0.3)}
            {renderCard('Schutzart (IP)', data.ip, '', <Shield className="w-5 h-5" />, 0.4)}
            {renderCard('Innere Form', data.form, '', <Box className="w-5 h-5" />, 0.5)}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-auto">
            <div className="flex items-center mb-4">
              <ListChecks className="w-5 h-5 mr-2 text-slate-700" />
              <h4 className="text-base font-semibold text-slate-900">Spezielle Anforderungen</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'arcFault', label: 'Störlichtbogenschutz' },
                { key: 'einschub', label: 'Einschubtechnik' },
                { key: 'mcc', label: 'Motor Controll Center (MCC)' },
                { key: 'nj63', label: 'Lasttrennschalter mit Sicherungen (3NJ63)' },
                { key: 'kompensation', label: 'Blindleistungskompensation' },
                { key: 'universal', label: 'Universaleinbautechnik' }
              ]
              .filter(({ key }) => data.features[key as keyof typeof data.features])
              .map(({ key, label }) => (
                <span 
                  key={key} 
                  className="px-3 py-1.5 rounded-full text-sm font-medium border bg-[#009999]/10 text-[#009999] border-[#009999]/20"
                >
                  {label}
                </span>
              ))}
              
              {Object.values(data.features).every(v => !v) && (
                <span className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100 w-full">
                  Keine speziellen Anforderungen gefunden.
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900 rounded-3xl p-1 shadow-xl xl:col-span-6 flex flex-col h-full"
        >
          <div className="bg-slate-800 rounded-[22px] p-6 flex-1 flex flex-col relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#009999] opacity-20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white">
                  {evaluation.system}
                </h2>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#009999]/20 text-[#00cccc] border border-[#009999]/30">
                  System-Empfehlung
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-0 flex-1">
                {/* Image & Button */}
                <div className="w-full sm:w-2/5 flex flex-col gap-3 self-start">
                  <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative">
                    <img 
                      src={systemImages[evaluation.system]} 
                      alt={evaluation.system} 
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x450/1e293b/00cccc?text=${encodeURIComponent(evaluation.system)}`;
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center border border-white/10 text-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Konfiguration anpassen
                  </button>
                  {isModified && (
                    <button 
                      onClick={() => setData(initialData)}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 text-slate-300 rounded-xl font-medium transition-colors flex items-center justify-center border border-slate-600 text-sm"
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
                
                {/* Ausschluss-Logik */}
                <div className="w-full sm:w-3/5 flex flex-col">
                  <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Ausschluss-Logik</h4>
                  <ul className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                    {evaluation.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-300">
                        <ChevronRight className="w-4 h-4 mr-2 text-[#009999] mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Belegstellen */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm xl:col-span-5 flex flex-col h-[800px]"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center shrink-0">
            <CheckCircle2 className="w-5 h-5 mr-2 text-[#009999]" />
            Belegstellen (KI-Extraktion)
          </h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {data.positions && data.positions.length > 0 ? (
              <ul className="space-y-4">
                {data.positions.map((pos, idx) => (
                  <li key={idx} className="p-4 bg-[#009999]/5 border border-[#009999]/10 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-[#009999]">{pos.field}</span>
                      {pos.page && (
                        <button 
                          onClick={() => handlePageClick(pos.page, pos.quote)}
                          className="text-xs font-medium bg-white hover:bg-slate-50 px-2 py-1 rounded-md text-slate-500 hover:text-[#009999] border border-slate-200 shadow-sm transition-colors cursor-pointer"
                        >
                          Seite {pos.page}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 italic">"{pos.quote}"</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-100">
                Keine spezifischen Textstellen als Beleg gefunden.
              </p>
            )}
          </div>
        </motion.div>

        {/* Document Viewer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm xl:col-span-7 flex flex-col h-[800px]"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center shrink-0">
            <FileText className="w-5 h-5 mr-2 text-slate-700" />
            Leistungsverzeichnis (LV)
          </h3>
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
            {file && file.type === 'application/pdf' ? (
              <iframe 
                key={pdfSrc}
                src={pdfSrc} 
                className="w-full h-full border-0 absolute inset-0"
                title="PDF Viewer"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Vorschau nicht verfügbar</p>
                <p className="text-slate-400 text-sm mt-1">
                  {file ? 'Nur PDF-Dateien können hier angezeigt werden.' : 'Kein Dokument hochgeladen.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {isModalOpen && (
        <ConfigModal 
          data={data} 
          onSave={handleSaveConfig} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};
