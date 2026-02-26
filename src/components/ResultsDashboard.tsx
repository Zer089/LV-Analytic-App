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
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderCard(<>Bemessungsstrom (I<sub>n</sub>)</>, data.current, 'A', <Activity className="w-5 h-5" />, 0.1)}
        {renderCard(<>Kurzschlussstrom (I<sub>cw</sub>)</>, data.icw, 'kA', <AlertCircle className="w-5 h-5" />, 0.2)}
        {renderCard(<>Spannung (U<sub>e</sub>)</>, data.voltage, 'V', <Zap className="w-5 h-5" />, 0.3)}
        {renderCard('Schutzart (IP)', data.ip, '', <Shield className="w-5 h-5" />, 0.4)}
      </div>

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
                <FileText className="w-5 h-5 mr-2 text-slate-400" />
                Extrahierte Parameter & Features
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Innere Form</p>
                <p className="font-medium text-slate-900">{data.form || 'Nicht spezifiziert'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Spezielle Features</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.features).map(([key, value]) => (
                    <span 
                      key={key} 
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        value 
                          ? 'bg-[#009999]/10 text-[#009999] border-[#009999]/20' 
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
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
              <ul className="space-y-3">
                {data.positions.map((pos, idx) => (
                  <li key={idx} className="p-4 bg-[#009999]/5 border border-[#009999]/10 rounded-xl text-sm text-slate-700 italic">
                    "{pos}"
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
