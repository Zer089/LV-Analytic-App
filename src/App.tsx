import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { ChatBot } from './components/ChatBot';
import { ProjectList } from './components/ProjectList';
import { ProjectForm } from './components/ProjectForm';
import { extractSwitchgearData } from './services/geminiService';
import { projectService } from './services/projectService';
import { SwitchgearData, Project } from './types';
import { 
  Loader2, FileText, ArrowLeft, Settings, Activity, Globe, Folder, Plus, 
  Edit2, CheckCircle2, FileSpreadsheet, Info, Lock, ChevronDown, Mail, 
  Phone, Smartphone, ExternalLink, X, MapPin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

import { SettingsModal } from './components/SettingsModal';
import { useLanguage } from './contexts/LanguageContext';

import { fileToBase64, base64ToFile } from './utils/fileUtils';

type ViewState = 'projects' | 'upload' | 'loading' | 'results' | 'save-project';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [view, setView] = useState<ViewState>('projects');
  const [previousView, setPreviousView] = useState<ViewState>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SwitchgearData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleExport = () => {
    const exportData = projects.map(p => ({
      [t.projects.fields.entryDateShort]: p.entryDate,
      [t.projects.fields.customerShort]: p.customer,
      [t.projects.fields.projectTitle]: p.projectTitle,
      [t.projects.fields.vbShort]: p.vb,
      [t.projects.fields.region]: p.region,
      [t.projects.fields.partnership]: p.partnership,
      [t.projects.fields.editor]: p.editor,
      [t.projects.fields.plannedSystem]: p.plannedSystem,
      [t.projects.fields.panelCount]: p.panelCount,
      [t.projects.fields.revenueP310]: p.revenueP310,
      [t.projects.fields.revenueP360]: p.revenueP360,
      [t.projects.fields.totalRevenue]: p.totalRevenue,
      [t.projects.fields.opportunity]: p.opportunity,
      [t.projects.fields.sieSalesMaintained]: p.sieSalesMaintained ? 'Ja' : 'Nein',
      [t.projects.fields.tenderedBrand]: p.tenderedBrand,
      [t.projects.fields.remarks]: p.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Projekte_Export_${date}.xlsx`);
    setIsSettingsDropdownOpen(false);
  };

  useEffect(() => {
    const loadProjects = async () => {
      // Migration from localStorage to IndexedDB if needed
      const oldData = localStorage.getItem('siemens_lv_projects');
      if (oldData) {
        try {
          const oldProjects = JSON.parse(oldData);
          if (Array.isArray(oldProjects) && oldProjects.length > 0) {
            for (const p of oldProjects) {
              await projectService.saveProject(p);
            }
          }
          localStorage.removeItem('siemens_lv_projects');
        } catch (e) {
          console.error('Migration failed', e);
        }
      }

      const loadedProjects = await projectService.getProjects();
      setProjects(loadedProjects);
    };
    loadProjects();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setView('loading');
    setIsLoading(true);
    setError(null);
    setData(null);
    setCurrentProject(null);

    try {
      const extractedData = await extractSwitchgearData(selectedFile);
      setData(extractedData);
      setView('results');
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(`${t.upload.error}: ${err.message || 'Unbekannter Fehler'}`);
      setView('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateAnalysis = async () => {
    setView('loading');
    setIsLoading(true);
    setError(null);
    setCurrentProject(null);
    
    try {
      // Fetch the mock PDF file from the public path
      const response = await fetch('/test-lv.pdf');
      if (!response.ok) throw new Error(language === 'de' ? 'Test-PDF konnte nicht geladen werden' : 'Test PDF could not be loaded');
      const blob = await response.blob();
      const mockPdf = new File([blob], "Test-LV_K5011.pdf", { type: "application/pdf" });
      setFile(mockPdf);
      
      // Simulate network delay for extraction
      setTimeout(() => {
        setData({
          current: 2000,
          icw: 65,
          voltage: 400,
          ip: "IP40",
          form: "4b",
          ui: 1000,
          ipk: 100,
          protectionClass: 1,
          height: 2200,
          base: 200,
          width: 600,
          depth: 600,
          busbarPosition: language === 'de' ? "oben" : "top",
          uimp: 8,
          installationType: language === 'de' ? "Einfront" : "Single-front",
          features: {
            arcFault: true,
            einschub: true,
            mcc: false,
            nj63: false,
            kompensation: false,
            universal: false
          },
          positions: [
            { field: language === 'de' ? "Bemessungsstrom" : "Rated current", quote: "Hauptsammelschienen: 2000 A", page: 17 },
            { field: language === 'de' ? "Schutzart" : "Protection class", quote: "Schutzart IP40", page: 14 },
            { field: language === 'de' ? "Innere Form" : "Internal form", quote: "Form der inneren Unterteilung der Leistungsschalterfelder: Form 4b", page: 17 },
            { field: language === 'de' ? "Bemessungskurzzeitstrom" : "Rated short-time current", quote: "Bemessungskurzzeitstrom Icw(1 s) > 65 kA", page: 18 },
            { field: language === 'de' ? "Bemessungsbetriebsspannung Ue" : "Rated operating voltage Ue", quote: "Bemessungsbetriebsspannung Ue: 400 V/50 Hz", page: 17 },
            { field: language === 'de' ? "Störlichtbogenschutz" : "Arc fault protection", quote: "Das Sammelschienensystem ist mit Störlichtbogenbarrieren zur Begrenzung des Störlichtbogens auf das Feld auszurüsten.", page: 8 },
            { field: language === 'de' ? "Einschubtechnik" : "Withdrawable technology", quote: "Leistungsschalter in Einschubtechnik sind im Einschubrahmen auszuführen.", page: 11 },
            { field: language === 'de' ? "Abmessungen" : "Dimensions", quote: "Höhe x Breite x Tiefe: 2200 x 600 x 600 mm", page: 18 },
          ]
        });
        setIsLoading(false);
        setView('results');
      }, 500);
    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(`${t.upload.simulationFailed}: ${err.message}`);
      setIsLoading(false);
      setView('upload');
    }
  };

  const handleSaveProject = async (project: Project) => {
    // If we have a file, save its content as base64
    if (file && !project.fileContent) {
      try {
        const base64 = await fileToBase64(file);
        project.fileContent = base64;
      } catch (err) {
        console.error("Error converting file to base64:", err);
      }
    }
    
    try {
      await projectService.saveProject(project);
      const updatedProjects = await projectService.getProjects();
      setProjects(updatedProjects);
      setView('projects');
      setCurrentProject(null);
      setData(null);
      setFile(null);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(language === 'de' ? 'Fehler beim Speichern des Projekts. Möglicherweise ist der Speicherplatz voll.' : 'Error saving project. Storage space might be full.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      const updatedProjects = await projectService.getProjects();
      setProjects(updatedProjects);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setData(project.analysisData);
    setFile(new File([], project.fileName));
    setPreviousView('projects');
    setView('save-project');
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setData(project.analysisData);
    
    if (project.fileContent) {
      try {
        const restoredFile = base64ToFile(project.fileContent, project.fileName);
        setFile(restoredFile);
      } catch (err) {
        console.error("Error restoring file from base64:", err);
        setFile(new File([], project.fileName));
      }
    } else {
      setFile(new File([], project.fileName));
    }
    
    setView('results');
  };

  const reset = () => {
    setFile(null);
    setData(null);
    setError(null);
    setView('projects');
    setCurrentProject(null);
  };

  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#00cccc] selection:text-white relative">
      {/* Background Image with Transparency */}
      <div 
        className="fixed inset-0 z-0 bg-[url('/public/images/AI_bagground.png')] bg-cover bg-center bg-no-repeat bg-fixed opacity-40 pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-[#009999] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Siemens-like Logo Placeholder */}
            <div className="font-bold text-2xl tracking-tight">
              SIEMENS
            </div>
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                {t.header.title}
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">v2.11.5</span>
              </h1>
              <span className="text-[10px] text-white/80 tracking-wider">{t.header.subtitle}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setView('upload')}
              className="text-sm font-medium text-white/90 hover:text-white flex items-center transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t.header.newAnalysis}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'de' ? 'bg-white text-[#009999]' : 'text-white hover:bg-white/10'}`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'en' ? 'bg-white text-[#009999]' : 'text-white hover:bg-white/10'}`}
              >
                EN
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isSettingsDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                title={t.header.settings}
              >
                <Settings className="w-5 h-5" />
                <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSettingsDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsSettingsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 text-slate-700"
                    >
                      <button
                        onClick={handleExport}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-[#009999]" />
                        <span>{t.projects.exportExcel}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsSettingsOpen(true);
                          setIsSettingsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>{t.settings.adminArea}</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1 mx-2" />

                      <button
                        onClick={() => {
                          setIsAboutModalOpen(true);
                          setIsSettingsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Info className="w-4 h-4 text-slate-400" />
                          <span>{t.settings.aboutTool}</span>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'projects' && (
            <ProjectList 
              projects={projects} 
              onSelect={handleSelectProject} 
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          )}

          {view === 'upload' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              {/* Full-width navigation row */}
              <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 sm:px-6 lg:px-8 mb-8">
                <div className="max-w-[1800px] mx-auto flex items-center justify-start">
                  <button 
                    onClick={() => setView('projects')}
                    className="text-sm font-medium text-slate-500 hover:text-[#009999] flex items-center transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t.header.projects}
                  </button>
                </div>
              </div>

              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto w-full pt-4"
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center p-3 bg-[#009999]/10 text-[#009999] rounded-2xl mb-6">
                    <Activity className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {t.upload.title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {t.upload.description}
                  </p>
                </div>
                
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleSimulateAnalysis}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-200 flex items-center shadow-sm"
                  >
                    <Activity className="w-4 h-4 mr-2 text-slate-500" />
                    {t.upload.simulate}
                  </button>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm text-center">
                    {error}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {view === 'loading' && (
            <LoadingScreen fileName={file?.name || (language === 'de' ? 'Dokument' : 'Document')} />
          )}

          {view === 'results' && data && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Full-width navigation row */}
              <div className="w-full mb-8 flex-shrink-0">
                <div className="max-w-[2200px] mx-auto flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setView('projects')}
                      className="text-sm font-medium text-slate-500 hover:text-[#009999] flex items-center transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      {t.header.projects}
                    </button>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold">{t.results.analyzed}</span>
                      </div>
                      
                      {file && (
                        <button 
                          onClick={handleDownload}
                          className="flex items-center gap-2 bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                          title={language === 'de' ? 'Datei herunterladen' : 'Download file'}
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium">{file.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {currentProject && (
                      <button 
                        onClick={() => {
                          setPreviousView('results');
                          setView('save-project');
                        }}
                        className="px-6 py-2 bg-white border border-[#009999] text-[#009999] hover:bg-[#009999]/5 font-bold rounded-xl transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t.projects.edit}
                      </button>
                    )}
                    
                    {!currentProject && (
                      <button 
                        onClick={() => {
                          setPreviousView('results');
                          setView('save-project');
                        }}
                        className="px-6 py-2 bg-[#009999] hover:bg-[#008888] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#009999]/20 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t.projects.createProject}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 pr-1 overflow-y-auto custom-scrollbar">
                <ResultsDashboard initialData={data} file={file} />
              </div>
              <ChatBot data={data} />
            </div>
          )}

          {view === 'save-project' && data && (
            <div className="max-w-6xl mx-auto w-full overflow-y-auto pr-1 custom-scrollbar">
              <ProjectForm 
                analysisData={data} 
                fileName={file?.name || 'Document'} 
                onSave={handleSaveProject}
                onCancel={() => setView(previousView)}
                initialData={currentProject || undefined}
              />
            </div>
          )}
        </AnimatePresence>
      </main>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* About Modal */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#009999] text-white">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" />
                  <h2 className="text-xl font-bold">{t.settings.aboutTool}</h2>
                </div>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 text-slate-700 space-y-6">
                <div className="space-y-1">
                  <p className="font-bold text-lg text-[#009999]">Siemens AG</p>
                  <p className="font-medium">Siemens Deutschland</p>
                  <p>Smart Infrastructure</p>
                  <p>Panel Builder</p>
                  <p className="text-slate-500 text-sm">RC-DE SI EP INF PB</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <p>Siemenspromenade 2<br />91058 Erlangen, Deutschland</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a href="tel:+4991311755466" className="hover:text-[#009999] transition-colors">+49 (9131) 17-55466</a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <a href="tel:+491729408230" className="hover:text-[#009999] transition-colors">+49 (172) 9408230</a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a href="mailto:schreiber.andreas@siemens.com" className="hover:text-[#009999] transition-colors font-medium">schreiber.andreas@siemens.com</a>
                  </div>

                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                    <a href="https://www.siemens.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#009999] transition-colors">www.siemens.com</a>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Version 2.11.5</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-6 py-2 bg-[#009999] text-white font-bold rounded-xl hover:bg-[#008888] transition-all shadow-lg shadow-[#009999]/20"
                >
                  {t.settings.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
