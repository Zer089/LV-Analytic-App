import React, { useState } from 'react';
import { Project, SwitchgearData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, X } from 'lucide-react';

interface ProjectFormProps {
  analysisData: SwitchgearData;
  fileName: string;
  onSave: (project: Project) => void;
  onCancel: () => void;
  initialData?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
  analysisData, 
  fileName, 
  onSave, 
  onCancel,
  initialData 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Project>>(initialData || {
    customer: '',
    projectTitle: '',
    vb: '',
    region: '',
    partnership: '',
    editor: '',
    plannedSystem: '',
    panelCount: null,
    revenueP310: null,
    revenueP360: null,
    totalRevenue: null,
    opportunity: '',
    sieSalesMaintained: false,
    tenderedBrand: '',
    remarks: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project: Project = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: formData.customer || '',
      projectTitle: formData.projectTitle || '',
      vb: formData.vb || '',
      region: formData.region || '',
      partnership: formData.partnership || '',
      editor: formData.editor || '',
      plannedSystem: formData.plannedSystem || '',
      panelCount: formData.panelCount || null,
      revenueP310: formData.revenueP310 || null,
      revenueP360: formData.revenueP360 || null,
      totalRevenue: formData.totalRevenue || null,
      opportunity: formData.opportunity || '',
      sieSalesMaintained: !!formData.sieSalesMaintained,
      tenderedBrand: formData.tenderedBrand || '',
      remarks: formData.remarks || '',
      analysisData,
      fileName,
      fileContent: initialData?.fileContent,
    };
    onSave(project);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-[#009999] p-6 text-white flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Save className="w-6 h-6" />
          {t.projects.header}
        </h3>
        <button onClick={onCancel} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.customer}</label>
            <input 
              type="text" name="customer" value={formData.customer || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.projectTitle}</label>
            <input 
              type="text" name="projectTitle" value={formData.projectTitle || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.vb}</label>
            <input 
              type="text" name="vb" value={formData.vb || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Row 2 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.region}</label>
            <select 
              name="region" value={formData.region || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            >
              <option value=""></option>
              <option value="B1 NORD">B1 NORD</option>
              <option value="B5 OST">B5 OST</option>
              <option value="B6 SDMT">B6 SDMT</option>
              <option value="B7 WEST">B7 WEST</option>
              <option value="B8 SUED">B8 SUED</option>
              <option value="B9 SDMT">B9 SDMT</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.partnership}</label>
            <input 
              type="text" name="partnership" value={formData.partnership || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.editor}</label>
            <select 
              name="editor" value={formData.editor || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            >
              <option value=""></option>
              <option value="Konstantin Frank">Konstantin Frank</option>
              <option value="Andreas Schreiber">Andreas Schreiber</option>
              <option value="Kevin Eckstein">Kevin Eckstein</option>
            </select>
          </div>

          {/* Row 3 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.plannedSystem}</label>
            <select 
              name="plannedSystem" value={formData.plannedSystem || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            >
              <option value=""></option>
              <option value="SIVACON S8">SIVACON S8</option>
              <option value="A32 Classic">A32 Classic</option>
              <option value="A32 Eco">A32 Eco</option>
              <option value="ALPHA DIN">ALPHA DIN</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.panelCount}</label>
            <input 
              type="number" name="panelCount" value={formData.panelCount || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.revenueP310}</label>
            <input 
              type="number" name="revenueP310" value={formData.revenueP310 || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Row 4 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.revenueP360}</label>
            <input 
              type="number" name="revenueP360" value={formData.revenueP360 || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.totalRevenue}</label>
            <input 
              type="number" name="totalRevenue" value={formData.totalRevenue || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.opportunity}</label>
            <input 
              type="text" name="opportunity" value={formData.opportunity || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Row 5 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.tenderedBrand}</label>
            <select 
              name="tenderedBrand" value={formData.tenderedBrand || ''} onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all"
            >
              <option value=""></option>
              <option value="neutral">neutral</option>
              <option value="Siemens">Siemens</option>
              <option value="ABB">ABB</option>
              <option value="Rittal">Rittal</option>
              <option value="Schneider">Schneider</option>
              <option value="Vamocon">Vamocon</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-6">
            <input 
              type="checkbox" name="sieSalesMaintained" id="sieSalesMaintained" checked={formData.sieSalesMaintained || false} onChange={handleChange}
              className="w-5 h-5 text-[#009999] border-slate-300 rounded focus:ring-[#009999]"
            />
            <label htmlFor="sieSalesMaintained" className="text-sm font-medium text-slate-700">{t.projects.fields.sieSalesMaintained}</label>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.projects.fields.remarks}</label>
          <textarea 
            name="remarks" value={formData.remarks || ''} onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009999] focus:border-transparent outline-none transition-all h-24 resize-none"
          />
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button 
            type="button" onClick={onCancel}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            {t.projects.cancel}
          </button>
          <button 
            type="submit"
            className="px-8 py-2 bg-[#009999] hover:bg-[#008888] text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-[#009999]/20"
          >
            <Save className="w-5 h-5" />
            {t.projects.saveProject}
          </button>
        </div>
      </form>
    </div>
  );
};
