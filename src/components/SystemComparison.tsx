import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Table, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SystemKnowledge, SystemRule } from '../types';

interface SystemComparisonProps {
  knowledge: SystemKnowledge | null;
}

interface ComparisonRow {
  label: string;
  getValue: (rule: SystemRule) => string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: 'Bemessungsstrom In',
    getValue: (r) => `${r.maxCurrent} A`,
  },
  {
    label: 'Sammelschienenlage',
    getValue: (r) => {
      const positions = r.allowedBusbarPositions?.join(' / ') || '-';
      return r.busbarNote ? `${positions} (${r.busbarNote})` : positions;
    },
  },
  {
    label: 'Bemessungsstoßspannungsfestigkeit Uimp',
    getValue: (r) => `${r.maxUimp} kV`,
  },
  {
    label: 'Bemessungsisolationsspannung Ui',
    getValue: (r) => `${r.maxUi} V`,
  },
  {
    label: 'Bemessungsbetriebsspannung Ue',
    getValue: (r) => `${r.maxVoltage} AC V`,
  },
  {
    label: 'Bemessungsstoßkurzschlussstrom Ipk',
    getValue: (r) => `${r.maxIpk} kA`,
  },
  {
    label: 'Bemessungskurzzeitstrom Icw (1 s)',
    getValue: (r) => `${r.maxIcw} kA`,
  },
  {
    label: 'Schutzart nach IEC 60529/EN 60529',
    getValue: (r) => (r.allowedIp?.length ? r.allowedIp.join(' / ') : '-'),
  },
  {
    label: 'Form der inneren Unterteilung',
    getValue: (r) => (r.allowedForms?.length ? r.allowedForms.join(' / ') : '-'),
  },
  {
    label: 'Schutzklasse',
    getValue: (r) => r.protectionClass || '-',
  },
  {
    label: 'Höhe',
    getValue: (r) => r.heightRange || `${r.maxHeight} mm`,
  },
  {
    label: 'Sockel',
    getValue: (r) => r.base || '-',
  },
  {
    label: 'Tiefe',
    getValue: (r) => r.depth || '-',
  },
  {
    label: 'Aufstellart',
    getValue: (r) => (r.allowedInstallationTypes?.length ? r.allowedInstallationTypes.join(' / ') : '-'),
  },
  {
    label: 'Störlichtbogenklasse',
    getValue: (r) => {
      if (r.arcFaultClass) return r.arcFaultClass;
      if (r.features?.arcFault === false) return 'Ohne';
      if (r.features?.arcFault === 'on_request') return 'Auf Anfrage';
      return 'ja';
    },
  },
  {
    label: 'Lasttrennschalter mit Sicherungen (3NJ63)',
    getValue: (r) => (r.features?.nj63 ? 'ja' : 'nein'),
  },
  {
    label: 'Abgangsfeld Universaleinbautechnik',
    getValue: (r) => (r.features?.universal ? 'ja' : 'nein'),
  },
  {
    label: 'Blindleistungskompensation',
    getValue: (r) => (r.features?.kompensation ? 'ja' : 'nein'),
  },
  {
    label: 'Einschubtechnik',
    getValue: (r) => (r.features?.einschub ? 'ja' : 'nein'),
  },
  {
    label: 'Motor Controll Center (MCC)',
    getValue: (r) => (r.features?.mcc ? 'ja' : 'nein'),
  },
];

export const SystemComparison: React.FC<SystemComparisonProps> = ({ knowledge }) => {
  const { language } = useLanguage();

  const { systems, resolvedSpecs } = useMemo(() => {
    if (!knowledge || !knowledge.systemRules) {
      return { systems: [] as string[], resolvedSpecs: {} as Record<string, Record<string, string>> };
    }

    const rules = knowledge.systemRules;
    const preferredOrder = knowledge.systems?.filter((s) => Boolean(rules[s])) || [];
    const sysList = preferredOrder.length > 0 ? preferredOrder : Object.keys(rules);
    const resolved: Record<string, Record<string, string>> = {};

    sysList.forEach((sys) => {
      resolved[sys] = {};
      const rule = rules[sys];
      COMPARISON_ROWS.forEach((row) => {
        resolved[sys][row.label] = row.getValue(rule);
      });
    });

    return { systems: sysList, resolvedSpecs: resolved };
  }, [knowledge]);

  if (!knowledge || !knowledge.systemRules || systems.length === 0) return null;

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
              {systems.map((system) => (
                <th key={system} className="py-3 px-4 text-sm font-bold text-[#009999] text-center min-w-[200px]">
                  {system}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, idx) => (
              <tr
                key={row.label}
                className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
              >
                <td className="py-3 px-4 text-sm font-medium text-slate-700 sticky left-0 bg-inherit z-10 border-r border-slate-50">
                  {row.label}
                </td>
                {systems.map((system) => {
                  const val = resolvedSpecs[system][row.label];
                  return (
                    <td key={`${system}-${row.label}`} className="py-3 px-4 text-sm text-slate-600 text-center">
                      {val === 'ja' ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </span>
                      ) : val === 'nein' ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
