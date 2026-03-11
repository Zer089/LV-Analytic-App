import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Folder, Calendar, User, Building2, Trash2, ChevronRight, Plus, Edit2, 
  LayoutGrid, List as ListIcon, Search, ExternalLink, ArrowUpDown, 
  ArrowUp, ArrowDown, MapPin, Briefcase, Users, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

type SortField = keyof Project | 'date';
type SortOrder = 'asc' | 'desc';

export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelect, 
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('projectListViewMode');
    return (saved as 'grid' | 'list') || 'grid';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    localStorage.setItem('projectListViewMode', viewMode);
  }, [viewMode]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter(project => {
        const searchStr = `${project.projectTitle} ${project.customer} ${project.editor} ${project.plannedSystem} ${project.opportunity}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Project];
        let valB: any = b[sortField as keyof Project];

        if (sortField === 'updatedAt' || sortField === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const comparison = valA < valB ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [projects, searchQuery, sortField, sortOrder]);

  const handleOpportunityLink = (e: React.MouseEvent, opportunity: string) => {
    e.stopPropagation();
    if (!opportunity) return;
    const url = `https://siemenscrm.lightning.force.com/lightning/r/Opportunity/${opportunity}/view`;
    window.open(url, '_blank');
  };

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-[#009999]" /> : <ArrowDown className="w-3 h-3 ml-1 text-[#009999]" />;
  };

  return (
    <div className="flex-1 max-w-[1800px] mx-auto w-full py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Folder className="w-8 h-8 text-[#009999]" />
          {t.projects.title}
        </h2>

        <div className="flex flex-1 w-full md:max-w-md items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#009999]/20 focus-within:border-[#009999] transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder={t.projects.fields.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-slate-700"
          />
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'grid' 
                ? 'bg-[#009999] text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={t.projects.gridView}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-[#009999] text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={t.projects.listView}
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAndSortedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#009999]/30 transition-all overflow-hidden cursor-pointer flex flex-col"
                onClick={() => onSelect(project)}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#009999]/10 transition-colors">
                      <Building2 className="w-6 h-6 text-[#009999]" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {project.opportunity && (
                        <button 
                          onClick={(e) => handleOpportunityLink(e, project.opportunity)}
                          className="p-2 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded-lg transition-all"
                          title="CRM Opportunity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
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

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{project.region || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Briefcase className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{project.vb || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{project.partnership || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Coins className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate font-bold text-slate-700">
                        {project.totalRevenue ? `${project.totalRevenue.toLocaleString()} €` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-3 flex justify-between items-center group-hover:bg-[#009999]/5 transition-colors mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System</span>
                    <span className="text-xs font-bold text-[#009999]">
                      {project.plannedSystem || 'No System'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009999] transition-all transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto"
          >
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center">{t.projects.fields.date} <SortIcon field="updatedAt" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('projectTitle')}
                  >
                    <div className="flex items-center">{t.projects.fields.projectTitle} <SortIcon field="projectTitle" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center">{t.projects.fields.customer} <SortIcon field="customer" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('vb')}
                  >
                    <div className="flex items-center">{t.projects.fields.vb} <SortIcon field="vb" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('region')}
                  >
                    <div className="flex items-center">{t.projects.fields.region} <SortIcon field="region" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-center"
                    onClick={() => handleSort('panelCount')}
                  >
                    <div className="flex items-center justify-center">Felder <SortIcon field="panelCount" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('revenueP310')}
                  >
                    <div className="flex items-center justify-end">P310 <SortIcon field="revenueP310" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('revenueP360')}
                  >
                    <div className="flex items-center justify-end">P360 <SortIcon field="revenueP360" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    <div className="flex items-center justify-end">Gesamt <SortIcon field="totalRevenue" /></div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.projects.fields.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedProjects.map((project) => (
                  <tr 
                    key={project.id}
                    onClick={() => onSelect(project)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(project.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#009999]" />
                        <span className="font-bold text-slate-900 group-hover:text-[#009999] transition-colors truncate max-w-[200px] block">{project.projectTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">{project.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.vb || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.region || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center">{project.panelCount || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">{project.revenueP310 ? `${project.revenueP310.toLocaleString()} €` : '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">{project.revenueP360 ? `${project.revenueP360.toLocaleString()} €` : '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{project.totalRevenue ? `${project.totalRevenue.toLocaleString()} €` : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {project.opportunity && (
                          <button 
                            onClick={(e) => handleOpportunityLink(e, project.opportunity)}
                            className="p-2 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded-lg transition-all"
                            title="CRM Opportunity"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                          }}
                          className="p-2 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project.id);
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009999] transition-all transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
