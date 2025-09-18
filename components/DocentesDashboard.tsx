import React, { useState, useMemo, useCallback } from 'react';
import { Docente } from '../types';
import DocenteTable from './DocenteTable';

interface DocentesDashboardProps {
  docentes: Docente[];
  onUpdate: (docente: Docente) => void;
  onDelete: (id: string) => void;
}

const DocentesDashboard: React.FC<DocentesDashboardProps> = ({ docentes, onUpdate, onDelete }) => {
  const [filters, setFilters] = useState(() => {
    const years = docentes.map(d => d.ano);
    const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear() - 5;
    const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    return {
      startYear: minYear.toString(),
      endYear: maxYear.toString(),
      categoria: 'todos',
      bolsaPQDT: 'todos',
    };
  });

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredDocentes = useMemo(() => {
    return docentes.filter(d => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);

      if (startYear && d.ano < startYear) return false;
      if (endYear && d.ano > endYear) return false;
      if (filters.categoria !== 'todos' && d.categoria !== filters.categoria) return false;
      if (filters.bolsaPQDT !== 'todos') {
          const hasBolsa = d.bolsaPQDT;
          if (filters.bolsaPQDT === 'sim' && !hasBolsa) return false;
          if (filters.bolsaPQDT === 'nao' && hasBolsa) return false;
      }
      
      return true;
    });
  }, [docentes, filters]);
  
  // Stats
  const totalDocentes = useMemo(() => new Set(filteredDocentes.map(d => d.nome)).size, [filteredDocentes]);
  
  const totalPermanentes = useMemo(() => {
    const permanentes = new Set(filteredDocentes.filter(d => d.categoria === 'PERMANENTE').map(d => d.nome));
    return permanentes.size;
  }, [filteredDocentes]);

  const totalComBolsa = useMemo(() => {
      const comBolsa = new Set(filteredDocentes.filter(d => d.bolsaPQDT).map(d => d.nome));
      return comBolsa.size;
  }, [filteredDocentes]);

  return (
    <div className="p-6 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Início</label>
            <input type="number" name="startYear" id="startYear" value={filters.startYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2020" />
          </div>
          <div>
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Fim</label>
            <input type="number" name="endYear" id="endYear" value={filters.endYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2024" />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select name="categoria" id="categoria" value={filters.categoria} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todas</option>
              <option value="PERMANENTE">Permanente</option>
              <option value="COLABORADOR">Colaborador</option>
              <option value="PESQUISADOR">Pesquisador</option>
            </select>
          </div>
          <div>
            <label htmlFor="bolsaPQDT" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bolsa PQ/DT</label>
            <select name="bolsaPQDT" id="bolsaPQDT" value={filters.bolsaPQDT} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total de Docentes (únicos)</h4>
            <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">{totalDocentes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Docentes Permanentes</h4>
            <p className="mt-2 text-4xl font-bold text-green-500 dark:text-green-400">{totalPermanentes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Com Bolsa PQ/DT</h4>
            <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">{totalComBolsa}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <DocenteTable data={filteredDocentes} onUpdate={onUpdate} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default DocentesDashboard;
