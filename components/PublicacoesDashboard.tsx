import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Periodico, Conferencia } from '../types';
import PeriodicoTable from './PeriodicoTable';
import ConferenciaTable from './ConferenciaTable';

interface PublicacoesDashboardProps {
  periodicos: Periodico[];
  conferencias: Conferencia[];
  onUpdatePeriodico: (periodico: Periodico) => void;
  onDeletePeriodico: (id: string) => void;
  onUpdateConferencia: (conferencia: Conferencia) => void;
  onDeleteConferencia: (id: string) => void;
  userRole: 'Administrador' | 'Visualizador';
}

const PublicacoesDashboard: React.FC<PublicacoesDashboardProps> = ({ periodicos, conferencias, onUpdatePeriodico, onDeletePeriodico, onUpdateConferencia, onDeleteConferencia, userRole }) => {
  const [activeTab, setActiveTab] = useState<'periodicos' | 'conferencias'>('periodicos');

  const [filters, setFilters] = useState(() => {
    const years = [...periodicos.map(p => p.ano), ...conferencias.map(c => c.ano)];
    const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear() - 5;
    const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
    return {
      startYear: minYear.toString(),
      endYear: maxYear.toString(),
    };
  });

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredPeriodicos = useMemo(() => {
    return periodicos.filter(p => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);
      if (startYear && p.ano < startYear) return false;
      if (endYear && p.ano > endYear) return false;
      return true;
    });
  }, [periodicos, filters]);

  const filteredConferencias = useMemo(() => {
    return conferencias.filter(c => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);
      if (startYear && c.ano < startYear) return false;
      if (endYear && c.ano > endYear) return false;
      return true;
    });
  }, [conferencias, filters]);

  // Stats
  const totalPeriodicos = useMemo(() => filteredPeriodicos.length, [filteredPeriodicos]);
  const totalDiscenteEgresso = useMemo(() => filteredPeriodicos.filter(p => p.discenteEgresso).length, [filteredPeriodicos]);
  const totalDocentePPGEE = useMemo(() => filteredPeriodicos.filter(p => p.docentePPGEE).length, [filteredPeriodicos]);
  const totalConferencias = useMemo(() => filteredConferencias.length, [filteredConferencias]);

  // Chart Data
  const periodicosPorAno = useMemo(() => {
    const counts: { [year: string]: number } = {};
    filteredPeriodicos.forEach(p => {
      const year = p.ano.toString();
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.keys(counts)
      .map(year => ({ year, quantidade: counts[year] }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [filteredPeriodicos]);

  const conferenciasPorAno = useMemo(() => {
    const counts: { [year: string]: number } = {};
    filteredConferencias.forEach(c => {
      const year = c.ano.toString();
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.keys(counts)
      .map(year => ({ year, quantidade: counts[year] }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [filteredConferencias]);

  const getTabClassName = (tabName: 'periodicos' | 'conferencias') => {
    const isActive = activeTab === tabName;
    return `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
      isActive
        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
    }`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Início</label>
            <input type="number" name="startYear" id="startYear" value={filters.startYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2020" />
          </div>
          <div>
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Fim</label>
            <input type="number" name="endYear" id="endYear" value={filters.endYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2024" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('periodicos')} className={getTabClassName('periodicos')}>Periódicos</button>
            <button onClick={() => setActiveTab('conferencias')} className={getTabClassName('conferencias')}>Conferência</button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'periodicos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Periódicos</h4>
                  <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">{totalPeriodicos}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Com Discente/Egresso</h4>
                  <p className="mt-2 text-4xl font-bold text-green-500 dark:text-green-400">{totalDiscenteEgresso}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Com Docente PPGEE</h4>
                  <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">{totalDocentePPGEE}</p>
                </div>
              </div>

              <div className="h-80">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Publicações em Periódicos por Ano</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodicosPorAno} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: 'none' }} />
                    <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade">
                      <LabelList dataKey="quantidade" position="top" style={{ fill: 'currentColor', fontSize: '12px' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <PeriodicoTable data={filteredPeriodicos} onUpdate={onUpdatePeriodico} onDelete={onDeletePeriodico} userRole={userRole} />
            </div>
          )}

          {activeTab === 'conferencias' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
                        <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Conferências</h4>
                        <p className="mt-2 text-4xl font-bold text-orange-600 dark:text-orange-400">{totalConferencias}</p>
                    </div>
                </div>

                <div className="h-80">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Publicações em Conferências por Ano</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conferenciasPorAno} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="year" />
                        <YAxis allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: 'none' }} />
                        <Bar dataKey="quantidade" fill="#f97316" name="Quantidade">
                            <LabelList dataKey="quantidade" position="top" style={{ fill: 'currentColor', fontSize: '12px' }} />
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <ConferenciaTable data={filteredConferencias} onUpdate={onUpdateConferencia} onDelete={onDeleteConferencia} userRole={userRole} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicacoesDashboard;