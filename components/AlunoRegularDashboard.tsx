

import React, { useState, useMemo, useCallback } from 'react';
import { AlunoRegular, Course } from '../types';
import AlunoRegularTable from './AlunoRegularTable';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface AlunoRegularDashboardProps {
  alunos: AlunoRegular[];
  onUpdate: (aluno: AlunoRegular) => void;
  onDelete: (id: string) => void;
}

const getYear = (dateString?: string): number | undefined => {
  if (!dateString) return undefined;
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[2], 10);
    return isNaN(year) ? undefined : year;
  }
  return undefined;
};

const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return null;
}

const calculateDurationInMonths = (aluno: AlunoRegular): number | null => {
  const { ingresso, situacao, defesa } = aluno;
  
  const ingressoDate = parseDate(ingresso);
  if (!ingressoDate) return null;

  let endDate: Date | null = null;
  
  if (situacao?.toLowerCase() === 'sem evasão') {
      endDate = new Date();
  } else if (situacao?.toLowerCase() === 'defendido') {
      endDate = parseDate(defesa);
  } else {
      return null;
  }
  
  if (!endDate) return null;
  
  const diffTime = Math.abs(endDate.getTime() - ingressoDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 30.4375; // Average days in a month
};

const AlunoRegularDashboard: React.FC<AlunoRegularDashboardProps> = ({ alunos, onUpdate, onDelete }) => {
  const uniqueOrientadores = useMemo(() => {
    const orientadoresSet = new Set(alunos.map(a => a.orientador || 'N/A'));
    const orientadores = Array.from(orientadoresSet);

    return orientadores.sort((a, b) => {
        if (a === 'N/A') return -1;
        if (b === 'N/A') return 1;
        return a.localeCompare(b);
    });
  }, [alunos]);

  const [filters, setFilters] = useState(() => {
    const years = alunos.map(t => getYear(t.ingresso)).filter((y): y is number => !!y);
    const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear() - 5;
    const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    return {
      startYear: minYear.toString(),
      endYear: maxYear.toString(),
      course: 'todos',
      status: 'todos',
      orientador: 'todos',
      bolsista: 'todos',
      durationType: 'none',
      durationValue: ''
    };
  });
  
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredAlunos = useMemo(() => {
    return alunos.filter(a => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);
      const ingressoYear = getYear(a.ingresso);

      if (startYear && ingressoYear && ingressoYear < startYear) return false;
      if (endYear && ingressoYear && ingressoYear > endYear) return false;
      if (filters.course !== 'todos' && a.curso !== filters.course) return false;
      if (filters.status !== 'todos' && a.situacao !== filters.status) return false;
      if (filters.orientador !== 'todos' && (a.orientador || 'N/A') !== filters.orientador) return false;
      
      if (filters.bolsista !== 'todos') {
        const bolsistaValue = (a.bolsista || '').trim().toLowerCase();
        // Considera bolsista se o campo não estiver vazio e não for 'não' ou 'nao'
        const isConsideredBolsista = bolsistaValue !== '' && bolsistaValue !== 'não' && bolsistaValue !== 'nao';

        if (filters.bolsista === 'sim' && !isConsideredBolsista) {
            return false;
        }
        if (filters.bolsista === 'nao' && isConsideredBolsista) {
            return false;
        }
      }

      const durationValue = parseFloat(filters.durationValue);
      if (filters.durationType !== 'none' && !isNaN(durationValue)) {
          const durationMonths = calculateDurationInMonths(a);
          if (durationMonths === null) return false; // Alunos sem duração calculável são filtrados
          
          if (filters.durationType === 'gt' && durationMonths <= durationValue) return false;
          if (filters.durationType === 'lt' && durationMonths >= durationValue) return false;
      }
      
      return true;
    });
  }, [alunos, filters]);
  
  const totalMestrado = useMemo(() => {
    return filteredAlunos.filter(a => a.curso === Course.MESTRADO).length;
  }, [filteredAlunos]);

  const totalDoutorado = useMemo(() => {
      return filteredAlunos.filter(a => a.curso === Course.DOUTORADO).length;
  }, [filteredAlunos]);


  return (
    <div className="p-6 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Início</label>
            <input type="number" name="startYear" id="startYear" value={filters.startYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2020" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Fim</label>
            <input type="number" name="endYear" id="endYear" value={filters.endYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2024" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
            <select name="course" id="course" value={filters.course} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value={Course.MESTRADO}>Mestrado</option>
              <option value={Course.DOUTORADO}>Doutorado</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situação</label>
            <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value="Sem Evasão">Sem Evasão</option>
              <option value="Desligado">Desligado</option>
              <option value="Defendido">Defendido</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="bolsista" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bolsista</label>
            <select name="bolsista" id="bolsista" value={filters.bolsista} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="orientador" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orientador</label>
            <select name="orientador" id="orientador" value={filters.orientador} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              {uniqueOrientadores.map(orientador => (
                  <option key={orientador} value={orientador}>{orientador}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <select 
                    name="durationType" 
                    id="durationType" 
                    value={filters.durationType} 
                    onChange={handleFilterChange} 
                    className="block w-auto rounded-none rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                    <option value="none">Nenhum</option>
                    <option value="gt">Maior que</option>
                    <option value="lt">Menor que</option>
                </select>
                <input 
                    type="number" 
                    name="durationValue" 
                    id="durationValue" 
                    value={filters.durationValue} 
                    onChange={handleFilterChange} 
                    className="block w-full rounded-none rounded-r-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 dark:disabled:bg-gray-800" 
                    placeholder="Ex: 24"
                    disabled={filters.durationType === 'none'}
                />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Mestrado</h4>
                  <div className="group relative flex items-center">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full mb-2 w-max -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-1 px-2 shadow-lg z-10">
                          Total de alunos de mestrado.
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                      </div>
                  </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">{totalMestrado}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Doutorado</h4>
                  <div className="group relative flex items-center">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full mb-2 w-max -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-1 px-2 shadow-lg z-10">
                          Total de alunos de doutorado.
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                      </div>
                  </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-green-500 dark:text-green-400">{totalDoutorado}</p>
          </div>
      </div>
      
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <AlunoRegularTable data={filteredAlunos} onUpdate={onUpdate} onDelete={onDelete} filters={filters} />
      </div>
    </div>
  );
};

export default AlunoRegularDashboard;