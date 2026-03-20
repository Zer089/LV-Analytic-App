import React from 'react';
import { motion } from 'motion/react';
import { Table, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SystemComparisonProps {
  knowledge: any;
}

export const SystemComparison: React.FC<SystemComparisonProps> = ({ knowledge }) => {
  const { language } = useLanguage();
  
  if (!knowledge || !knowledge.systemSpecs) return null;

  const systems = Object.keys(knowledge.systemSpecs);
  const parameters = Object.keys(knowledge.systemSpecs[systems[0]]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Table className="w-5 h-5 text-[#009999] mr-2" />
          {language === 'de' ? 'System-Vergleich (Wissensdatenbank)' : 'System Comparison (Knowledge Base)'}
        </h3>
        <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Info className="w-3 h-3 mr-1" />
          {language === 'de' ? 'Aktuelle Siemens Spezifikationen' : 'Current Siemens Specifications'}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider sticky left-0 bg-white z-10">
                {language === 'de' ? 'Parameter' : 'Parameter'}
              </th>
              {systems.map(system => (
                <th key={system} className="py-3 px-4 text-sm font-bold text-[#009999] text-center min-w-[200px]">
                  {system}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, idx) => (
              <tr 
                key={param} 
                className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
              >
                <td className="py-3 px-4 text-sm font-medium text-slate-700 sticky left-0 bg-inherit z-10 border-r border-slate-50">
                  {param}
                </td>
                {systems.map(system => (
                  <td key={`${system}-${param}`} className="py-3 px-4 text-sm text-slate-600 text-center">
                    {knowledge.systemSpecs[system][param] === 'ja' ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    ) : knowledge.systemSpecs[system][param] === 'nein' ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </span>
                    ) : (
                      knowledge.systemSpecs[system][param]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
