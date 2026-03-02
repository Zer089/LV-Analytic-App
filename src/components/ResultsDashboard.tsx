import React, { useState } from 'react';
import { SwitchgearData, SystemRecommendation } from '../types';
import { evaluateSystem } from '../utils/evaluation';
import { ConfigModal } from './ConfigModal';
import { 
  Zap, Shield, Ruler, FileText, CheckCircle2, 
  AlertCircle, Box, Activity, Hash, Settings, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsDashboardProps {
  initialData: SwitchgearData;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ initialData }) => {
  const [data, setData] = useState<SwitchgearData>(initialData);
  const [manualOverride, setManualOverride] = useState<SystemRecommendation | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const evaluation = evaluateSystem(data, manualOverride);

  const systemImages: Record<SystemRecommendation, string> = {
    'ALPHA 3200 eco': '/images/A32-eco.png',
    'ALPHA 3200 classic': '/images/A32-classic.png',
    'SIVACON S8': '/images/S8.png'
  };

  const handleSaveConfig = (newData: SwitchgearData, override?: SystemRecommendation) => {
    setData(newData);
    setManualOverride(override);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Evidence */}
        <div className="space-y-8 lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#009999] mr-2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" x2="9" y1="1" y2="4"></line><line x1="15" x2="15" y1="1" y2="4"></line><line x1="9" x2="9" y1="20" y2="23"></line><line x1="15" x2="15" y1="20" y2="23"></line><line x1="20" x2="23" y1="9" y2="9"></line><line x1="20" x2="23" y1="14" y2="14"></line><line x1="1" x2="4" y1="9" y2="9"></line><line x1="1" x2="4" y1="14" y2="14"></line></svg>
                Erkannte Anforderungen NSHV
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {renderCard(<>Bemessungsstrom (I<sub>n</sub>)</>, data.current, 'A', <Activity className="w-5 h-5" />, 0.1)}
              {renderCard(<>Kurzschlussstrom (I<sub>cw</sub>)</>, data.icw, 'kA', <AlertCircle className="w-5 h-5" />, 0.2)}
              {renderCard(<>Spannung (U<sub>e</sub>)</>, data.voltage, 'V', <Zap className="w-5 h-5" />, 0.3)}
              {renderCard('Schutzart (IP)', data.ip, '', <Shield className="w-5 h-5" />, 0.4)}
              {renderCard('Innere Form', data.form, '', <Box className="w-5 h-5" />, 0.5)}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2 text-slate-700" />
                <h4 className="text-base font-semibold text-slate-900">Spezielle Anforderungen</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'arcFault', label: 'Störlichtbogenschutz' },
                  { key: 'einschub', label: 'Einschubtechnik' },
                  { key: 'mcc', label: 'Motor Controll Center (MCC)' },
                  { key: 'nj63', label: 'Lasttrennschalter mit Sicherungen (3NJ63)' },
                  { key: 'kompensation', label: 'Blindleistungskompensation' }
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

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-[#009999]" />
              Belegstellen (KI-Extraktion)
            </h3>
            {data.positions && data.positions.length > 0 ? (
              <ul className="space-y-4">
                {data.positions.map((pos, idx) => (
                  <li key={idx} className="p-4 bg-[#009999]/5 border border-[#009999]/10 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-[#009999]">{pos.field}</span>
                      {pos.page && (
                        <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-slate-500 border border-slate-200 shadow-sm">
                          Seite {pos.page}
                        </span>
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
          </motion.div>
        </div>

        {/* Right Column: Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900 rounded-3xl p-1 shadow-xl lg:col-span-1 flex flex-col h-full"
        >
          <div className="bg-slate-800 rounded-[22px] p-6 flex-1 flex flex-col relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#009999] opacity-20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#009999]/20 text-[#00cccc] border border-[#009999]/30 mb-4">
                System-Empfehlung
              </span>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {evaluation.system}
              </h2>
              
              <div className="mt-6 mb-6 rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-[4/3] flex items-center justify-center relative">
                <img 
                  src={systemImages[evaluation.system]} 
                  alt={evaluation.system} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if the user hasn't uploaded the image yet
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x450/1e293b/00cccc?text=${encodeURIComponent(evaluation.system)}`;
                  }}
                />
              </div>
              
              <div className="mt-8 mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Ausschluss-Logik</h4>
                <ul className="space-y-3">
                  {evaluation.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-300">
                      <ChevronRight className="w-4 h-4 mr-2 text-[#009999] mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-auto pt-6 relative z-10">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center border border-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Konfiguration anpassen
              </button>
            </div>
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
