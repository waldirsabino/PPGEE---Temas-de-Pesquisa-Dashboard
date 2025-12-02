import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Graduate, Course, Status, Projeto, Docente, Turma } from '../types';
import DataTable from './DataTable';
import ProjetoTable from './ProjetoTable';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface DashboardProps {
  graduates: Graduate[];
  docentes: Docente[];
  turmas: Turma[];
  onUpdate: (graduate: Graduate) => void;
  onDelete: (id: string) => void;
  projetos: Projeto[];
  onUpdateProjeto: (projeto: Projeto) => void;
  onDeleteProjeto: (id: string) => void;
  userRole: 'Administrador' | 'Visualizador';
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

const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // month is 0-indexed in JS Date
        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return null;
}

const calculateMonthsDifference = (startStr: string, endStr: string): number => {
    const startDate = parseDate(startStr);
    const endDate = parseDate(endStr);
    if (!startDate || !endDate) return 0;

    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const dayDiff = endDate.getDate() - startDate.getDate();

    let totalMonths = yearDiff * 12 + monthDiff;
    
    if (dayDiff < 0) {
        totalMonths--;
    }

    return Math.max(0, totalMonths);
}


const Dashboard: React.FC<DashboardProps> = ({ graduates, docentes, turmas, onUpdate, onDelete, projetos, onUpdateProjeto, onDeleteProjeto, userRole }) => {
  const uniqueOrientadores = useMemo(() => {
    const orientadoresSet = new Set(graduates.map(g => g.orientador || 'N/A'));
    const orientadores = Array.from(orientadoresSet);

    return orientadores.sort((a, b) => {
        if (a === 'N/A') return -1;
        if (b === 'N/A') return 1;
        return String(a).localeCompare(String(b));
    });
  }, [graduates]);

  const [filters, setFilters] = useState(() => {
    const defenseYears = graduates
      .map(g => getYear(g.anoDefesa))
      .filter((year): year is number => typeof year === 'number');
    
    const minYear = defenseYears.length > 0 ? Math.min(...defenseYears) : new Date().getFullYear() - 5;
    const maxYear = defenseYears.length > 0 ? Math.max(...defenseYears) : new Date().getFullYear();


    return {
      startYear: minYear.toString(),
      endYear: maxYear.toString(),
      course: 'todos',
      status: 'todos',
      orientador: 'todos',
    };
  });
  
  const [activeTable, setActiveTable] = useState<'egressos' | 'projetos'>('egressos');
  const [showLists, setShowLists] = useState(true);
  const [showDocenteMetrics, setShowDocenteMetrics] = useState(true);


  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredGraduates = useMemo(() => {
    return graduates.filter(g => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);

      const defenseYear = getYear(g.anoDefesa);
      if (startYear && defenseYear && defenseYear < startYear) return false;
      if (endYear && defenseYear && defenseYear > endYear) return false;
      if (filters.course !== 'todos' && g.curso !== filters.course) return false;
      if (filters.status !== 'todos' && g.status !== filters.status) return false;
      if (filters.orientador !== 'todos' && (g.orientador || 'N/A') !== filters.orientador) return false;
      
      return true;
    });
  }, [graduates, filters]);
  
  // This one is for the main stat cards, it ignores the course filter.
  const graduatesForCards = useMemo(() => {
    return graduates.filter(g => {
      const startYear = parseInt(filters.startYear, 10);
      const endYear = parseInt(filters.endYear, 10);

      const defenseYear = getYear(g.anoDefesa);
      if (startYear && defenseYear && defenseYear < startYear) return false;
      if (endYear && defenseYear && defenseYear > endYear) return false;
      // Note: filters.course is ignored here
      if (filters.status !== 'todos' && g.status !== filters.status) return false;
      if (filters.orientador !== 'todos' && (g.orientador || 'N/A') !== filters.orientador) return false;
      
      return true;
    });
  }, [graduates, filters]);


  const filteredProjetos = useMemo(() => {
    const parsedStartYear = parseInt(filters.startYear, 10);
    const parsedEndYear = parseInt(filters.endYear, 10);

    const filterStart = !isNaN(parsedStartYear) ? parsedStartYear : -Infinity;
    const filterEnd = !isNaN(parsedEndYear) ? parsedEndYear : Infinity;

    if (filterStart === -Infinity && filterEnd === Infinity) {
        return projetos;
    }

    return projetos.filter(p => {
        const projetoEnd = p.anoFim ?? Infinity; // Treat ongoing projects as having an infinite end year
        // The project's time range [p.anoInicio, projetoEnd] should overlap with [filterStart, filterEnd]
        return p.anoInicio <= filterEnd && projetoEnd >= filterStart;
    });
  }, [projetos, filters.startYear, filters.endYear]);
  
  const filteredDocentes = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10) || -Infinity;
    const endYear = parseInt(filters.endYear, 10) || Infinity;

    return docentes.filter(d => d.ano >= startYear && d.ano <= endYear);
  }, [docentes, filters.startYear, filters.endYear]);

  const mestresFormados = useMemo(() => {
    return graduatesForCards.filter(g => g.curso === Course.MESTRADO && g.status === Status.DEFENDIDO).length;
  }, [graduatesForCards]);

  const doutoresFormados = useMemo(() => {
    return graduatesForCards.filter(g => g.curso === Course.DOUTORADO && g.status === Status.DEFENDIDO).length;
  }, [graduatesForCards]);

  const tempoMedioMestrado = useMemo(() => {
    const mestresDefendidos = graduatesForCards.filter(
      g => g.curso === Course.MESTRADO && g.status === Status.DEFENDIDO && g.anoDefesa && g.anoIngresso
    );
    if (mestresDefendidos.length === 0) return 0;

    const totalMeses = mestresDefendidos.reduce((acc, g) => {
        return acc + calculateMonthsDifference(g.anoIngresso, g.anoDefesa!);
    }, 0);

    return totalMeses / mestresDefendidos.length;
  }, [graduatesForCards]);

  const tempoMedioDoutorado = useMemo(() => {
    const doutoresDefendidos = graduatesForCards.filter(
      g => g.curso === Course.DOUTORADO && g.status === Status.DEFENDIDO && g.anoDefesa && g.anoIngresso
    );
    if (doutoresDefendidos.length === 0) return 0;

    const totalMeses = doutoresDefendidos.reduce((acc, g) => {
        return acc + calculateMonthsDifference(g.anoIngresso, g.anoDefesa!);
    }, 0);
    
    return totalMeses / doutoresDefendidos.length;
  }, [graduatesForCards]);

  const totalProjetos = useMemo(() => filteredProjetos.length, [filteredProjetos]);

  const totalMestrandosProjetos = useMemo(() => {
    return filteredProjetos.reduce((acc, p) => acc + p.alunosMestradoEnvolvidos, 0);
  }, [filteredProjetos]);

  const totalDoutorandosProjetos = useMemo(() => {
    return filteredProjetos.reduce((acc, p) => acc + p.alunosDoutoradoEnvolvidos, 0);
  }, [filteredProjetos]);
  
  const totalProjetosColaboracao = useMemo(() => {
    return filteredProjetos.filter(p => p.colaboracaoNaoAcademica?.toLowerCase() === 'sim').length;
  }, [filteredProjetos]);

  const forMetric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10) || -Infinity;
    const endYear = parseInt(filters.endYear, 10) || Infinity;

    const relevantDocentes = docentes.filter(d => d.ano >= startYear && d.ano <= endYear);
    
    const permanentDocenteNames = new Set(
      relevantDocentes
        .filter(d => d.categoria?.toUpperCase() === 'PERMANENTE')
        .map(d => d.nome)
    );
    
    const totalPermanentes = permanentDocenteNames.size;
    if (totalPermanentes === 0) return 0;

    const comBolsaNames = new Set(
      relevantDocentes
        .filter(d => d.categoria?.toUpperCase() === 'PERMANENTE' && d.bolsaPQDT)
        .map(d => d.nome)
    );

    const totalComBolsa = comBolsaNames.size;
    return totalComBolsa / totalPermanentes;
  }, [docentes, filters.startYear, filters.endYear]);

  const dedMetric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10) || -Infinity;
    const endYear = parseInt(filters.endYear, 10) || Infinity;

    const relevantDocentes = docentes.filter(d => d.ano >= startYear && d.ano <= endYear);
    
    const permanentDocenteNames = new Set(
      relevantDocentes
        .filter(d => d.categoria?.toUpperCase() === 'PERMANENTE')
        .map(d => d.nome)
    );
    
    const totalPermanentes = permanentDocenteNames.size;
    if (totalPermanentes === 0) return 0;

    const comDedicacaoExclusivaNames = new Set(
      relevantDocentes
        .filter(d => d.categoria?.toUpperCase() === 'PERMANENTE' && d.dedicacaoExclusivaPPG)
        .map(d => d.nome)
    );
    
    const totalComDedicacaoExclusiva = comDedicacaoExclusivaNames.size;
    return totalComDedicacaoExclusiva / totalPermanentes;
  }, [docentes, filters.startYear, filters.endYear]);

  const d3aMetric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10) || -Infinity;
    const endYear = parseInt(filters.endYear, 10) || Infinity;

    const relevantDocentes = docentes.filter(d => d.ano >= startYear && d.ano <= endYear);
    
    const permanentDocenteNames = new Set(
      relevantDocentes
        .filter(d => d.categoria?.toUpperCase() === 'PERMANENTE')
        .map(d => d.nome)
    );
    
    const totalPermanentes = permanentDocenteNames.size;
    if (totalPermanentes === 0) return 0;

    const d3aCompliantDocenteNames = new Set(
      relevantDocentes
        .filter(d => 
            d.categoria?.toUpperCase() === 'PERMANENTE' &&
            d.lecionouDisciplinaQuadrienio &&
            d.participouPublicacaoQuadrienio &&
            d.teveOrientacaoConcluidaQuadrienio
        )
        .map(d => d.nome)
    );

    const totalD3aCompliant = d3aCompliantDocenteNames.size;
    return totalD3aCompliant / totalPermanentes;
  }, [docentes, filters.startYear, filters.endYear]);

  const ade1Metric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10);
    const endYear = parseInt(filters.endYear, 10);

    if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) return 0;
    
    const relevantTurmas = turmas.filter(t => t.ano >= startYear && t.ano <= endYear);
    const totalTurmas = relevantTurmas.length;
    if (totalTurmas === 0) return 0;

    const docenteCategoryMap = new Map<string, string>();
    docentes.forEach(d => {
        if (d.nome && d.ano && d.categoria) {
            docenteCategoryMap.set(`${d.nome.trim()}-${d.ano}`, d.categoria.trim().toUpperCase());
        }
    });

    const colaboradorTurmasCount = relevantTurmas.reduce((count, turma) => {
        if (!turma.docente || !turma.ano) return count;
        
        const key = `${turma.docente.trim()}-${turma.ano}`;
        const categoria = docenteCategoryMap.get(key);
        
        if (categoria === 'COLABORADOR') {
            return count + 1;
        }
        return count;
    }, 0);
    
    return colaboradorTurmasCount / totalTurmas;
  }, [turmas, docentes, filters.startYear, filters.endYear]);

  const ade2Metric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10) || -Infinity;
    const endYear = parseInt(filters.endYear, 10) || Infinity;

    const relevantGraduates = graduates.filter(g => {
        if (g.status !== Status.DEFENDIDO) return false;
        const defenseYear = getYear(g.anoDefesa);
        if (!defenseYear) return false;
        return defenseYear >= startYear && defenseYear <= endYear;
    });

    if (relevantGraduates.length === 0) return 0;

    const docenteCategoryMap = new Map<string, string>();
    docentes.forEach(d => {
        if (d.nome && d.ano && d.categoria) {
            docenteCategoryMap.set(`${d.nome.trim()}-${d.ano}`, d.categoria.trim().toUpperCase());
        }
    });

    const colaboradorOrientadorCount = relevantGraduates.reduce((count, graduate) => {
        const defenseYear = getYear(graduate.anoDefesa);
        if (!graduate.orientador || !defenseYear) return count;

        const key = `${graduate.orientador.trim()}-${defenseYear}`;
        const categoria = docenteCategoryMap.get(key);
        
        if (categoria === 'COLABORADOR') {
            return count + 1;
        }
        return count;
    }, 0);

    return colaboradorOrientadorCount / relevantGraduates.length;
  }, [graduates, docentes, filters.startYear, filters.endYear]);

  const atiMetric = useMemo(() => {
    const startYear = parseInt(filters.startYear, 10);
    const endYear = parseInt(filters.endYear, 10);

    if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) return 0;
    const numberOfYears = endYear - startYear + 1;

    // 1. Count unique permanent professors in the period
    const permanentDocenteNames = new Set(
      docentes
        .filter(d => d.ano >= startYear && d.ano <= endYear && d.categoria?.toUpperCase() === 'PERMANENTE')
        .map(d => d.nome)
    );
    const totalPermanentes = permanentDocenteNames.size;

    if (totalPermanentes === 0) return 0;

    // 2. Filter relevant classes
    const relevantTurmas = turmas.filter(t => t.ano >= startYear && t.ano <= endYear);
    if (relevantTurmas.length === 0) return 0;

    // 3. Create a map for professor categories per year
    const docenteCategoryMap = new Map<string, string>();
    docentes.forEach(d => {
        if (d.nome && d.ano && d.categoria) {
            docenteCategoryMap.set(`${d.nome.trim()}-${d.ano}`, d.categoria.trim().toUpperCase());
        }
    });

    // 4. Count classes taught by permanent professors
    const permanenteTurmasCount = relevantTurmas.reduce((count, turma) => {
        if (!turma.docente || !turma.ano) return count;
        
        const key = `${turma.docente.trim()}-${turma.ano}`;
        const categoria = docenteCategoryMap.get(key);
        
        if (categoria === 'PERMANENTE') {
            return count + 1;
        }
        return count;
    }, 0);
    
    // 5. Calculate the final metric
    const averageTurmasPerYear = permanenteTurmasCount / numberOfYears;
    const result = (averageTurmasPerYear / totalPermanentes) * 60;

    return result;
  }, [turmas, docentes, filters.startYear, filters.endYear]);

  // Placeholder metrics
  const atg1Metric = useMemo(() => 0, []);
  const atg2Metric = useMemo(() => 0, []);
  const oriMetric = useMemo(() => 0, []);
  const pdoMetric = useMemo(() => 0, []);
  const dpiDocenteMetric = useMemo(() => 0, []);
  const dpiDiscenteDoutMetric = useMemo(() => 0, []);
  const dpiDiscenteMestMetric = useMemo(() => 0, []);
  const dpdMetric = useMemo(() => 0, []);
  const dtdMetric = useMemo(() => 0, []);
  const aderMetric = useMemo(() => 0, []);


  const graduatesByYear = useMemo(() => {
    const counts: { [year: string]: { [key in Course]?: number } } = {};
    
    filteredGraduates.forEach(g => {
      // "Egressos" são os que defenderam
      if (g.anoDefesa && g.status === Status.DEFENDIDO) {
        const year = getYear(g.anoDefesa)?.toString();
        if (year) {
          if (!counts[year]) {
            counts[year] = {};
          }
          counts[year][g.curso] = (counts[year][g.curso] || 0) + 1;
        }
      }
    });

    return Object.keys(counts)
      .map(year => ({
        year,
        [Course.MESTRADO]: counts[year][Course.MESTRADO] || 0,
        [Course.DOUTORADO]: counts[year][Course.DOUTORADO] || 0,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [filteredGraduates]);

  const getTabClassName = (tabName: 'egressos' | 'projetos') => {
    const isActive = activeTable === tabName;
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
            <input type="number" name="startYear" id="startYear" value={filters.startYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2018" />
          </div>
          <div>
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Fim</label>
            <input type="number" name="endYear" id="endYear" value={filters.endYear} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ex: 2022" />
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              <option value={Status.DEFENDIDO}>Defendido</option>
              <option value={Status.CURSANDO}>Cursando</option>
            </select>
          </div>
          <div>
            <label htmlFor="orientador" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orientador</label>
            <select name="orientador" id="orientador" value={filters.orientador} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="todos">Todos</option>
              {uniqueOrientadores.map(orientador => (
                  <option key={orientador} value={orientador}>{orientador}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">A. Mestres Formados</h4>
            <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">{mestresFormados}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">B. Mestrado Tempo Médio</h4>
            <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {tempoMedioMestrado > 0 ? `${tempoMedioMestrado.toFixed(1)} meses` : '-'}
            </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">C. Doutores Formados</h4>
            <p className="mt-2 text-4xl font-bold text-green-500 dark:text-green-400">{doutoresFormados}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">E. Doutorado Tempo Médio</h4>
            <p className="mt-2 text-4xl font-bold text-purple-600 dark:text-purple-400">
                {tempoMedioDoutorado > 0 ? `${tempoMedioDoutorado.toFixed(1)} meses` : '-'}
            </p>
        </div>
      </div>

      {/* Project Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">F. Total de Projetos</h4>
            <p className="mt-2 text-4xl font-bold text-orange-600 dark:text-orange-400">{totalProjetos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">G. Mestrandos em Projetos</h4>
            <p className="mt-2 text-4xl font-bold text-yellow-500 dark:text-yellow-400">{totalMestrandosProjetos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">H. Doutorandos em Projetos</h4>
            <p className="mt-2 text-4xl font-bold text-cyan-500 dark:text-cyan-400">{totalDoutorandosProjetos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
           <div className="flex justify-center items-center gap-2">
            <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">I. Projetos NÃO InAcAgFo</h4>
             <div className="group relative flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                    Projetos, com recursos financeiros, excluindo-se parcerias com Instituições Acadêmicas e/ou Agências de Fomento.
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                </div>
             </div>
           </div>
            <p className="mt-2 text-4xl font-bold text-pink-600 dark:text-pink-400">{totalProjetosColaboracao}</p>
        </div>
      </div>
      
      {/* Docente Metrics Section Container */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Indicadores da Ficha de Avaliação Eng IV - CAPES (1-14)</h3>
          <button 
              onClick={() => setShowDocenteMetrics(!showDocenteMetrics)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-expanded={showDocenteMetrics}
          >
              {showDocenteMetrics ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {showDocenteMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">1. FOR</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>1. FOR:</strong> Esta métrica fatorial representa a fração de docentes permanentes que são detentores de bolsa de Produtividade em Pesquisa (Bolsa PQ) ou bolsa de Produtividade em Desenvolvimento Tecnológico e Extensão Inovadora (Bolsa DT) do CNPq. Seu objetivo é estimar a maturidade científica do corpo docente, considerando que os critérios para a concessão dessas bolsas abrangem a qualidade e o volume da produção científica e técnica, a experiência de orientação e aspectos qualitativos. 
Meta: 0,30.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {forMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">2. DED</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>2. DED:</strong> A métrica fatorial DED mede a fração de docentes permanentes do programa que possuem dedicação exclusiva ao programa. É calculada como: (número de docentes permanentes que atuam exclusivamente no programa) / (total de docentes permanentes do programa). As Engenharias IV consideram ideal que pelo menos a fração de 0,6 (60%) dos docentes permanentes tenham atuação exclusiva no Programa de Pós-Graduação (PPG) em avaliação. Exceções são consideradas quando a mesma Instituição de Ensino Superior (IES) mantém, simultaneamente, PPGs nas modalidades acadêmica e profissional na área de Engenharias IV.
Meta: 0,60.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-sky-600 dark:text-sky-400">
                  {dedMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">3. D3A</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>3. D3A:</strong> Esta métrica fatorial quantifica a fração de docentes permanentes intensamente envolvidos em atividades de pesquisa e de formação. Um docente é contabilizado neste índice quando atende a todos os seguintes requisitos: lecionou uma disciplina na pós-graduação, participou de produção relevante e teve orientação concluída no período da avaliação (quadriênio).
Meta: 0,85.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">
                  {d3aMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
            <div className="flex justify-center items-center gap-2">
              <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">4. ADE1</h4>
              <div className="group relative flex items-center">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                      <strong>4. ADE1:</strong> Representa a fração da carga horária anual de disciplinas oferecidas pelo PPG que é atribuída a docentes colaboradores ou visitantes. Meta: 10%.
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                  </div>
              </div>
            </div>
            <p className="mt-2 text-4xl font-bold text-purple-600 dark:text-purple-400">
                {ade1Metric.toFixed(3)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">5. ADE2</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>5. ADE2:</strong> Indica a fração das teses de doutorado e/ou dissertações de mestrado concluídas, para cada ano, que tem orientação atribuída a docentes colaboradores ou visitantes. Meta: 15%.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-lime-600 dark:text-lime-400">
                  {ade2Metric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">6. ATI</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>6. ATI:</strong> A métrica fatorial ATI é definida como a carga horária anual média de disciplinas ministradas na pós-graduação pelos docentes permanentes. Meta: 120h.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {atiMetric.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">7. ATG1</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>7. ATG1:</strong> [Descrição da métrica ATG1. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {atg1Metric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">8. ATG2</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>8. ATG2:</strong> [Descrição da métrica ATG2. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-rose-600 dark:text-rose-400">
                  {atg2Metric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">9. ORI</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>9. ORI:</strong> [Descrição da métrica ORI. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                  {oriMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">10. PDO</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>10. PDO:</strong> [Descrição da métrica PDO. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-violet-600 dark:text-violet-400">
                  {pdoMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">11.1 DPI Docente</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>11.1 DPI Docente:</strong> [Descrição da métrica. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {dpiDocenteMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">11.2 DPI Discente_Dout</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>11.2 DPI Discente_Dout:</strong> [Descrição da métrica. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {dpiDiscenteDoutMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">11.3 DPI Discente_Mest</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>11.3 DPI Discente_Mest:</strong> [Descrição da métrica. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {dpiDiscenteMestMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">12. DPD</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>12. DPD:</strong> [Descrição da métrica DPD. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {dpdMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">13. DTD</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        Teste provisorio
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {dtdMetric.toFixed(3)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-center transition-transform transform hover:scale-105">
              <div className="flex justify-center items-center gap-2">
                <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">14. ADER</h4>
                <div className="group relative flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 w-80 max-w-xs -translate-x-1/2 left-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg z-10 text-left normal-case tracking-normal">
                        <strong>14. ADER:</strong> [Descrição da métrica ADER. Meta: X.XX]
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-4xl font-bold text-pink-600 dark:text-pink-400">
                  {aderMetric.toFixed(3)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-80">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Egressos por Ano de Defesa</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graduatesByYear} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: 'none' }}/>
                    <Legend />
                    <Bar dataKey={Course.MESTRADO} fill="#3b82f6" name="Mestrado">
                       <LabelList 
                        dataKey={Course.MESTRADO} 
                        position="top" 
                        formatter={(value: number) => value > 0 ? value : ''} 
                        style={{ fill: 'currentColor', fontSize: '12px' }}
                      />
                    </Bar>
                    <Bar dataKey={Course.DOUTORADO} fill="#10b981" name="Doutorado">
                       <LabelList 
                        dataKey={Course.DOUTORADO} 
                        position="top" 
                        formatter={(value: number) => value > 0 ? value : ''} 
                        style={{ fill: 'currentColor', fontSize: '12px' }}
                      />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Listas Detalhadas</h3>
              <button 
                  onClick={() => setShowLists(!showLists)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  aria-expanded={showLists}
              >
                  {showLists ? 'Ocultar' : 'Mostrar'}
              </button>
           </div>
           {showLists && (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTable('egressos')}
                    className={getTabClassName('egressos')}
                  >
                    Lista de Egressos
                  </button>
                  <button
                    onClick={() => setActiveTable('projetos')}
                    className={getTabClassName('projetos')}
                  >
                    Lista de Projetos
                  </button>
                </nav>
              </div>
              <div className="mt-4">
                {activeTable === 'egressos' && (
                   <DataTable data={filteredGraduates} onUpdate={onUpdate} onDelete={onDelete} userRole={userRole} />
                )}
                {activeTable === 'projetos' && (
                   <ProjetoTable data={filteredProjetos} onUpdate={onUpdateProjeto} onDelete={onDeleteProjeto} userRole={userRole} />
                )}
              </div>
            </>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;