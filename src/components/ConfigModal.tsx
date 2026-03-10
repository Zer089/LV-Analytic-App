import React, { useState } from 'react';
import { SwitchgearData, SystemRecommendation } from '../types';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfigModalProps {
  data: SwitchgearData;
  onSave: (data: SwitchgearData) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ data, onSave, onClose }) => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState<SwitchgearData>(data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#007a7a] sticky top-0 bg-[#009999] z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{t.settings.title}</h2>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{language === 'de' ? 'BASIS-PARAMETER' : 'BASIC PARAMETERS'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'de' ? 'Bemessungsstrom' : 'Rated current'} I<sub>n</sub> (A)</label>
              <input 
                type="number" 
                name="current" 
                value={formData.current || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'de' ? 'Kurzschlussstrom' : 'Short-circuit current'} I<sub>cw</sub> (kA)</label>
              <input 
                type="number" 
                name="icw" 
                value={formData.icw || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'de' ? 'Spannung' : 'Voltage'} U<sub>e</sub> (V)</label>
              <input 
                type="number" 
                name="voltage" 
                value={formData.voltage || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'de' ? 'Schutzart' : 'Protection class'}</label>
              <select 
                name="ip" 
                value={formData.ip || 'unbekannt'} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all bg-white"
              >
                <option value="unbekannt">{language === 'de' ? 'unbekannt' : 'unknown'}</option>
                <option value="IP30">IP30</option>
                <option value="IP31">IP31</option>
                <option value="IP40">IP40</option>
                <option value="IP41">IP41</option>
                <option value="IP43">IP43</option>
                <option value="IP54">IP54</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'de' ? 'Innere Form' : 'Internal form'}</label>
              <select 
                name="form" 
                value={formData.form || 'unbekannt'} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all bg-white"
              >
                <option value="unbekannt">{language === 'de' ? 'unbekannt' : 'unknown'}</option>
                <option value="1">1</option>
                <option value="2a">2a</option>
                <option value="2b">2b</option>
                <option value="3a">3a</option>
                <option value="3b">3b</option>
                <option value="4a">4a</option>
                <option value="4b">4b</option>
              </select>
            </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{language === 'de' ? 'ZUSATZANFORDERUNGEN' : 'ADDITIONAL REQUIREMENTS'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
              {[
                { key: 'arcFault', label: language === 'de' ? 'Störlichtbogenschutz' : 'Arc fault protection' },
                { key: 'einschub', label: language === 'de' ? 'Einschubtechnik' : 'Withdrawable technology' },
                { key: 'mcc', label: 'Motor Controll Center (MCC)' },
                { key: 'nj63', label: language === 'de' ? 'Lasttrennschalter mit Sicherungen (3NJ63)' : 'Switch disconnectors with fuses (3NJ63)' },
                { key: 'kompensation', label: language === 'de' ? 'Blindleistungskompensation' : 'Reactive power compensation' },
                { key: 'universal', label: language === 'de' ? 'Universaleinbautechnik' : 'Universal mounting technology' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-50 cursor-pointer rounded-lg">
                  <input 
                    type="checkbox" 
                    name={key} 
                    checked={formData.features[key as keyof typeof formData.features]} 
                    onChange={handleChange}
                    className="w-4 h-4 text-[#009999] border-slate-300 rounded focus:ring-[#009999] shrink-0"
                  />
                  <span className="text-sm text-slate-700 whitespace-nowrap">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {t.settings.cancel}
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#009999] hover:bg-[#007a7a] rounded-lg transition-colors"
            >
              {language === 'de' ? 'Speichern & Neu berechnen' : 'Save & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
