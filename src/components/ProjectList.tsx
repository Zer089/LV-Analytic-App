import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Folder, Calendar, User, Building2, Trash2, ChevronRight, Plus, Edit2, 
  LayoutGrid, List as ListIcon, Search, ExternalLink, ArrowUpDown, 
  ArrowUp, ArrowDown, MapPin, Briefcase, Users, Coins, CheckCircle2,
  XCircle, UserRoundPen, PenTool, Handshake, FileText
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
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

        if (sortField === 'updatedAt' || sortField === 'createdAt' || sortField === 'entryDate') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
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

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const roundTo100 = (val: number | null) => {
    if (val === null) return '-';
    return (
      <span className="whitespace-nowrap">
        {(Math.round(val / 100) * 100).toLocaleString()} €
      </span>
    );
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDelete(projectToDelete);
      setProjectToDelete(null);
    }
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
    <div className="flex-1 w-full py-8 px-2 sm:px-4 min-w-0">
      <div className={`${viewMode === 'grid' ? 'max-w-[1800px]' : 'w-full'} mx-auto min-w-0`}>
        <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur-sm pb-6 pt-2 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Folder className="w-8 h-8 text-[#009999]" />
              {t.projects.projectsTitle}
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
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(project.entryDate)}
                    </div>

                    <div className="flex items-center space-x-1">
                      {project.opportunity && (
                        <button 
                          onClick={(e) => handleOpportunityLink(e, project.opportunity)}
                          className="p-2 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded-lg transition-all"
                          title="zur SieSales Opportunity"
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
                        onClick={(e) => handleDelete(e, project.id)}
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
                      <Handshake className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{project.partnership || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <UserRoundPen className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{project.editor || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      {project.sieSalesMaintained ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-2 text-red-400" />
                      )}
                      <span className="truncate">SieSales</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Coins className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate font-bold text-slate-700">
                        {roundTo100(project.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-3 grid grid-cols-2 gap-x-4 items-end group-hover:bg-[#009999]/5 transition-colors mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System</span>
                    <span className="text-xs font-bold text-[#009999]">
                      {project.plannedSystem || 'No System'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {project.panelCount !== null ? (
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-medium">
                        {project.panelCount} {t.projects.fields.panelCount.includes(' ') ? t.projects.fields.panelCount.split(' ').pop() : t.projects.fields.panelCount}
                      </span>
                    ) : <div />}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009999] transition-all transform group-hover:translate-x-1" />
                  </div>
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
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto w-full relative"
          >
            <table className="w-full text-left border-collapse min-w-[1600px]">
              <thead className="bg-slate-50">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('entryDate')}
                  >
                    <div className="flex items-center">{t.projects.fields.entryDateShort} <SortIcon field="entryDate" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('projectTitle')}
                  >
                    <div className="flex items-center">{t.projects.fields.projectTitle} <SortIcon field="projectTitle" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center">{t.projects.fields.customerShort} <SortIcon field="customer" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('vb')}
                  >
                    <div className="flex items-center">{t.projects.fields.vbShort} <SortIcon field="vb" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('region')}
                  >
                    <div className="flex items-center">{t.projects.fields.region} <SortIcon field="region" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('partnership')}
                  >
                    <div className="flex items-center">{t.projects.fields.partnership} <SortIcon field="partnership" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('editor')}
                  >
                    <div className="flex items-center">{t.projects.fields.editor} <SortIcon field="editor" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('plannedSystem')}
                  >
                    <div className="flex items-center">System <SortIcon field="plannedSystem" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-center"
                    onClick={() => handleSort('panelCount')}
                  >
                    <div className="flex items-center justify-center">{t.projects.fields.panelCount.includes(' ') ? t.projects.fields.panelCount.split(' ').pop() : t.projects.fields.panelCount} <SortIcon field="panelCount" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('revenueP310')}
                  >
                    <div className="flex items-center justify-end">P310 <SortIcon field="revenueP310" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('revenueP360')}
                  >
                    <div className="flex items-center justify-end">P360 <SortIcon field="revenueP360" /></div>
                  </th>
                  <th 
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    <div className="flex items-center justify-end">{t.projects.fields.totalRevenue} <SortIcon field="totalRevenue" /></div>
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    <div className="flex items-center justify-center">
                      <img src="/public/images/SieSales.png" alt="SieSales" className="h-4 w-auto" title="SieSales gepflegt" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{t.projects.fields.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedProjects.map((project) => (
                  <tr 
                    key={project.id}
                    onClick={() => onSelect(project)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-3 py-2 text-xs text-slate-500">{formatDate(project.entryDate)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-normal text-xs text-slate-500 group-hover:text-[#009999] transition-colors truncate max-w-[300px] block">{project.projectTitle}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 truncate max-w-[250px]">{project.customer}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{project.vb || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{project.region || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{project.partnership || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{project.editor || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{project.plannedSystem || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 text-center">{project.panelCount || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 text-right whitespace-nowrap">{roundTo100(project.revenueP310)}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 text-right whitespace-nowrap">{roundTo100(project.revenueP360)}</td>
                    <td className="px-3 py-2 text-xs font-bold text-slate-900 text-right whitespace-nowrap">{roundTo100(project.totalRevenue)}</td>
                    <td className="px-3 py-2 text-center">
                      {project.sieSalesMaintained ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {project.opportunity && (
                          <button 
                            onClick={(e) => handleOpportunityLink(e, project.opportunity)}
                            className="p-1 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded transition-all"
                            title="zur SieSales Opportunity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                          }}
                          className="p-1 text-slate-300 hover:text-[#009999] hover:bg-[#009999]/10 rounded transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#009999] transition-all transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-4 mb-4 text-red-600">
                <div className="p-3 bg-red-50 rounded-full">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{t.projects.delete}</h3>
              </div>
              <p className="text-slate-600 mb-6">
                {t.projects.confirmDelete}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  {t.projects.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  {t.projects.delete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};
