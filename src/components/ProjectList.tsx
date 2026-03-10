import React from 'react';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Folder, Calendar, User, Building2, Trash2, ChevronRight, Plus, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelect, 
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="p-6 bg-slate-100 rounded-full mb-6">
          <Folder className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{t.projects.title}</h3>
        <p className="text-slate-500 max-w-md mb-8">{t.projects.empty}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Folder className="w-8 h-8 text-[#009999]" />
          {t.projects.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#009999]/30 transition-all overflow-hidden cursor-pointer"
            onClick={() => onSelect(project)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#009999]/10 transition-colors">
                  <Building2 className="w-6 h-6 text-[#009999]" />
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    className="p-2 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded-lg transition-all"
                    title={t.projects.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={t.projects.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#009999] transition-colors truncate">
                {project.projectTitle}
              </h3>
              <p className="text-sm text-slate-500 mb-4 truncate">{project.customer}</p>

              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex items-center text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 mr-2" />
                  {project.editor || '-'}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 flex justify-between items-center group-hover:bg-[#009999]/5 transition-colors">
              <span className="text-xs font-bold text-[#009999] uppercase tracking-wider">
                {project.plannedSystem || 'No System'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009999] transition-all transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
