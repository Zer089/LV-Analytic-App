import React, { useState } from 'react';
import { SwitchgearData, SystemRecommendation } from '../types';
import { X } from 'lucide-react';

interface ConfigModalProps {
  data: SwitchgearData;
  onSave: (data: SwitchgearData, manualOverride?: SystemRecommendation) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<SwitchgearData>(data);
  const [override, setOverride] = useState<SystemRecommendation | ''>('');

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
    onSave(formData, override === '' ? undefined : override as SystemRecommendation);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">Konfiguration anpassen</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bemessungsstrom I<sub>n</sub> (A)</label>
              <input 
                type="number" 
                name="current" 
                value={formData.current || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kurzschlussstrom I<sub>cw</sub> (kA)</label>
              <input 
                type="number" 
                name="icw" 
                value={formData.icw || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Spannung U<sub>e</sub> (V)</label>
              <input 
                type="number" 
                name="voltage" 
                value={formData.voltage || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Schutzart</label>
              <input 
                type="text" 
                name="ip" 
                value={formData.ip || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Innere Form</label>
              <input 
                type="text" 
                name="form" 
                value={formData.form || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Spezielle Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'arcFault', label: 'Störlichtbogenschutz' },
                { key: 'einschub', label: 'Einschubtechnik' },
                { key: 'mcc', label: 'Motor Controll Center (MCC)' },
                { key: 'nj63', label: 'Lasttrennschalter mit Sicherungen (3NJ63)' },
                { key: 'kompensation', label: 'Blindleistungskompensation' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name={key} 
                    checked={formData.features[key as keyof typeof formData.features]} 
                    onChange={handleChange}
                    className="w-4 h-4 text-[#009999] border-slate-300 rounded focus:ring-[#009999]"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Manuelle System-Überschreibung</label>
            <select 
              value={override} 
              onChange={(e) => setOverride(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#009999] focus:border-[#009999] outline-none transition-all"
            >
              <option value="">Automatisch (Logik-Kaskade)</option>
              <option value="ALPHA 3200 eco">Zwingend ALPHA 3200 eco</option>
              <option value="ALPHA 3200 classic">Zwingend ALPHA 3200 classic</option>
              <option value="SIVACON S8">Zwingend SIVACON S8</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#009999] hover:bg-[#007a7a] rounded-lg transition-colors"
            >
              Speichern & Neu berechnen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
