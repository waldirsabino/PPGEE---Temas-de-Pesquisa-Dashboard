import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Turma, Course } from '../types';
import TurmaTable from './TurmaTable';

interface TurmasDashboardProps {
  turmas: Turma[];
  onUpdate: (turma: Turma) => void;
  onDelete: (id: string) => void;
}

const PIE_COLORS = ['#00C49F', '#FF8042', '#FFBB28']; // Aprovados, Reprovado Nota, Reprovado Freq

const TurmasDashboard: React.FC<TurmasDashboardProps> = ({ turmas, onUpdate, onDelete }) => {
  const uniqueDocentes = useMemo(() => {
    const docentes = new Set(turmas.map(t => t.docente));
    return Array.from(docentes).sort();
  }, [turmas]);
  
  const uniqueSituacoes = useMemo(() => {
    const situacoes = new Set(turmas.map(t => t.situacao));
    return Array.from(situacoes).sort();
  }, [turmas]);

  const [sucupiraValue, setSucupiraValue] = useState<number>(0);

  const [filters, setFilters] = useState(() => {
    const years = turmas.map(t => t.ano);
    const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear() - 5;
    const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    return {
      startYear: minYear.toString(),
      endYear: maxYear.toString(),
      course: 'todos',
      status: 'todos',
      docente: 'todos',
    };
  });
  
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredTurmas = useMemo(() => {
    return turmas.filter(t => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);

      if (startYear && t.ano < startYear) return false;
      if (endYear && t.ano > endYear) return false;
      if (filters.course !== 'todos' && t.curso !== filters.course) return false;
      if (filters.status !== 'todos' && t.situacao !== filters.status) return false;
      if (filters.docente !== 'todos' && t.docente !== filters.docente) return false;
      
      return true;
    });
  }, [turmas, filters]);

  const totalTurmasOfertadas = useMemo(() => {
    return filteredTurmas.length;
  }, [filteredTurmas]);

  const totalMatriculados = useMemo(() => {
    return filteredTurmas.reduce((acc, t) => acc + t.qtdMatriculado, 0);
  }, [filteredTurmas]);

  const totalAprovados = useMemo(() => {
      return filteredTurmas.reduce((acc, t) => acc + t.qtdAprovados, 0);
  }, [filteredTurmas]);

  const totalReprovados = useMemo(() => {
      return filteredTurmas.reduce((acc, t) => acc + t.qtdReprovadoNota + t.qtdReprovadoFreq, 0);
  }, [filteredTurmas]);

  const disciplinasOfertadas = useMemo(() => {
    const codigosUnicos = new Set(filteredTurmas.map(t => t.codDisciplina));
    return codigosUnicos.size;
  }, [filteredTurmas]);

  const outcomesDistribution = useMemo(() => {
    const totals = filteredTurmas.reduce((acc, turma) => {
      acc.aprovados += turma.qtdAprovados;
      acc.reprovadoNota += turma.qtdReprovadoNota;
      acc.reprovadoFreq += turma.qtdReprovadoFreq;
      return acc;
    }, { aprovados: 0, reprovadoNota: 0, reprovadoFreq: 0 });

    return [
      { name: 'Aprovados', value: totals.aprovados },
      { name: 'Reprovado (Nota)', value: totals.reprovadoNota },
      { name: 'Reprovado (Freq.)', value: totals.reprovadoFreq },
    ].filter(d => d.value > 0);
  }, [filteredTurmas]);

  const enrollmentsByYear = useMemo(() => {
    const counts: { [year: string]: { matriculados: number; aprovados: number; reprovadoNota: number; reprovadoFreq: number } } = {};
    
    filteredTurmas.forEach(t => {
      const year = t.ano.toString();
      if (!counts[year]) {
        counts[year] = { matriculados: 0, aprovados: 0, reprovadoNota: 0, reprovadoFreq: 0 };
      }
      counts[year].matriculados += t.qtdMatriculado;
      counts[year].aprovados += t.qtdAprovados;
      counts[year].reprovadoNota += t.qtdReprovadoNota;
      counts[year].reprovadoFreq += t.qtdReprovadoFreq;
    });

    return Object.keys(counts)
      .map(year => ({
        year,
        'Matriculado': counts[year].matriculados,
        'Aprovado': counts[year].aprovados,
        'Reprovado (Nota)': counts[year].reprovadoNota,
        'Reprovado (Freq.)': counts[year].reprovadoFreq,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [filteredTurmas]);

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
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
            <select name="course" id="course" value={filters.course} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value={Course.MESTRADO}>Mestrado</option>
              <option value={Course.DOUTORADO}>Doutorado</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situação</label>
            <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              {uniqueSituacoes.map(situacao => (
                <option key={situacao} value={situacao}>{situacao}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="docente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Docente</label>
            <select name="docente" id="docente" value={filters.docente} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              {uniqueDocentes.map(docente => (
                  <option key={docente} value={docente}>{docente}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
       {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center">
            <label htmlFor="sucupiraInput" className="text-base font-medium text-gray-500 dark:text-gray-400">Turmas Ativas Sucupira</label>
             <input 
                id="sucupiraInput"
                type="number" 
                value={sucupiraValue}
                onChange={(e) => setSucupiraValue(Number(e.target.value))}
                className="mt-2 text-4xl font-bold text-center w-full bg-transparent text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-0 border-none p-0"
            />
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Turmas Ofertadas</h4>
            <p className="mt-2 text-4xl font-bold text-cyan-500 dark:text-cyan-400">{totalTurmasOfertadas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Disciplinas Ofertadas</h4>
            <p className="mt-2 text-4xl font-bold text-yellow-500 dark:text-yellow-400">{disciplinasOfertadas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total de Matriculados</h4>
            <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">{totalMatriculados}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total de Aprovados</h4>
            <p className="mt-2 text-4xl font-bold text-green-500 dark:text-green-400">{totalAprovados}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">Total de Reprovados</h4>
            <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">{totalReprovados}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-80">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Matrículas, Aprovações e Reprovações</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentsByYear} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: 'none' }}/>
                    <Legend />
                    <Bar dataKey="Matriculado" fill="#3b82f6">
                      <LabelList dataKey="Matriculado" position="top" formatter={(v: number) => v > 0 ? v : ''} style={{ fill: 'currentColor', fontSize: '12px' }} />
                    </Bar>
                    <Bar dataKey="Aprovado" fill="#10b981">
                      <LabelList dataKey="Aprovado" position="top" formatter={(v: number) => v > 0 ? v : ''} style={{ fill: 'currentColor', fontSize: '12px' }} />
                    </Bar>
                    <Bar dataKey="Reprovado (Nota)" fill="#ffbb28">
                      <LabelList dataKey="Reprovado (Nota)" position="top" formatter={(v: number) => v > 0 ? v : ''} style={{ fill: 'currentColor', fontSize: '12px' }} />
                    </Bar>
                     <Bar dataKey="Reprovado (Freq.)" fill="#ff8042">
                       <LabelList dataKey="Reprovado (Freq.)" position="top" formatter={(v: number) => v > 0 ? v : ''} style={{ fill: 'currentColor', fontSize: '12px' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-80">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Distribuição de Resultados</h3>
            <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={outcomesDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {outcomesDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: 'none' }}/>
                    <Legend/>
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <TurmaTable data={filteredTurmas} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

export default TurmasDashboard;
