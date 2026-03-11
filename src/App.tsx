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
import { Loader2, FileText, ArrowLeft, Settings, Activity, Globe, Folder, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(projectService.getProjects());
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
      }, 1500);
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
    
    projectService.saveProject(project);
    setProjects(projectService.getProjects());
    setView('projects');
    setCurrentProject(null);
    setData(null);
    setFile(null);
  };

  const handleDeleteProject = (id: string) => {
    projectService.deleteProject(id);
    setProjects(projectService.getProjects());
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
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-[#009999] text-white sticky top-0 z-20 shadow-md">
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
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">v2.8.5</span>
              </h1>
              <span className="text-[10px] text-white/80 uppercase tracking-wider">{t.header.subtitle}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setView('upload')}
              className="text-sm font-medium text-white/90 hover:text-white flex items-center transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t.header.newAnalysis}
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

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={t.header.settings}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
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
            <div className="flex-1 flex flex-col w-full">
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
            <div className="flex-1 flex flex-col">
              {/* Full-width navigation row */}
              <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 sm:px-6 lg:px-8 mb-8">
                <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-4">
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

              <ResultsDashboard initialData={data} file={file} />
              <ChatBot data={data} />
            </div>
          )}

          {view === 'save-project' && data && (
            <div className="max-w-6xl mx-auto w-full">
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
      </div>
    </div>
  );
}
