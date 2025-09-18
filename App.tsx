import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import AdminPanel from './components/AdminPanel';
import { Graduate, Docente, Projeto, Turma, AlunoRegular, Periodico, Conferencia, AlunoEspecial } from './types';
import TurmasDashboard from './components/TurmasDashboard';
import AlunoRegularDashboard from './components/AlunoRegularDashboard';
import PublicacoesDashboard from './components/PublicacoesDashboard';
import DocentesDashboard from './components/DocentesDashboard';
import AlunoEspecialDashboard from './components/AlunoEspecialDashboard';

type View = 'dashboard' | 'turmas' | 'alunoRegular' | 'alunoEspecial' | 'docentes' | 'publicacoes' | 'dataManagement' | 'admin';

const viewTitles: Record<View, string> = {
  dashboard: 'Painel PPGEE - Elétrica e Computação',
  turmas: 'Visualização de Dados de Turmas',
  alunoRegular: 'Visualização de Alunos Regulares',
  alunoEspecial: 'Visualização de Alunos Especiais',
  docentes: 'Visualização de Dados de Docentes',
  publicacoes: 'Visualização de Dados de Publicações',
  dataManagement: 'Gerenciamento de Dados',
  admin: 'Painel Administrativo'
};

const APP_GRADUATES_STORAGE_KEY = 'ppgee-graduates-data';
const APP_DOCENTES_STORAGE_KEY = 'ppgee-docentes-data';
const APP_PROJETOS_STORAGE_KEY = 'ppgee-projetos-data';
const APP_TURMAS_STORAGE_KEY = 'ppgee-turmas-data';
const APP_ALUNOS_REGULARES_STORAGE_KEY = 'ppgee-alunos-regulares-data';
const APP_ALUNOS_ESPECIAIS_STORAGE_KEY = 'ppgee-alunos-especiais-data';
const APP_PERIODICOS_STORAGE_KEY = 'ppgee-periodicos-data';
const APP_CONFERENCIAS_STORAGE_KEY = 'ppgee-conferencias-data';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [graduates, setGraduates] = useState<Graduate[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_GRADUATES_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de egressos do localStorage:", error);
      return [];
    }
  });
   const [docentes, setDocentes] = useState<Docente[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_DOCENTES_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de docentes do localStorage:", error);
      return [];
    }
  });
  const [projetos, setProjetos] = useState<Projeto[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_PROJETOS_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de projetos do localStorage:", error);
      return [];
    }
  });
  const [turmas, setTurmas] = useState<Turma[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_TURMAS_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de turmas do localStorage:", error);
      return [];
    }
  });
  const [alunosRegulares, setAlunosRegulares] = useState<AlunoRegular[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_ALUNOS_REGULARES_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de alunos regulares do localStorage:", error);
      return [];
    }
  });
  const [alunosEspeciais, setAlunosEspeciais] = useState<AlunoEspecial[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_ALUNOS_ESPECIAIS_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de alunos especiais do localStorage:", error);
      return [];
    }
  });
  const [periodicos, setPeriodicos] = useState<Periodico[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_PERIODICOS_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de periódicos do localStorage:", error);
      return [];
    }
  });
  const [conferencias, setConferencias] = useState<Conferencia[]>(() => {
    try {
      const savedData = localStorage.getItem(APP_CONFERENCIAS_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Erro ao carregar dados de conferências do localStorage:", error);
      return [];
    }
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(APP_GRADUATES_STORAGE_KEY, JSON.stringify(graduates));
    } catch (error) {
      console.error("Erro ao salvar dados de egressos no localStorage:", error);
    }
  }, [graduates]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_DOCENTES_STORAGE_KEY, JSON.stringify(docentes));
    } catch (error) {
      console.error("Erro ao salvar dados de docentes no localStorage:", error);
    }
  }, [docentes]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_PROJETOS_STORAGE_KEY, JSON.stringify(projetos));
    } catch (error) {
      console.error("Erro ao salvar dados de projetos do localStorage:", error);
    }
  }, [projetos]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_TURMAS_STORAGE_KEY, JSON.stringify(turmas));
    } catch (error) {
      console.error("Erro ao salvar dados de turmas do localStorage:", error);
    }
  }, [turmas]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_ALUNOS_REGULARES_STORAGE_KEY, JSON.stringify(alunosRegulares));
    } catch (error) {
      console.error("Erro ao salvar dados de alunos regulares do localStorage:", error);
    }
  }, [alunosRegulares]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_ALUNOS_ESPECIAIS_STORAGE_KEY, JSON.stringify(alunosEspeciais));
    } catch (error) {
      console.error("Erro ao salvar dados de alunos especiais no localStorage:", error);
    }
  }, [alunosEspeciais]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_PERIODICOS_STORAGE_KEY, JSON.stringify(periodicos));
    } catch (error) {
      console.error("Erro ao salvar dados de periódicos do localStorage:", error);
    }
  }, [periodicos]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFERENCIAS_STORAGE_KEY, JSON.stringify(conferencias));
    } catch (error) {
      console.error("Erro ao salvar dados de conferências do localStorage:", error);
    }
  }, [conferencias]);


  const handleAddGraduate = useCallback((graduate: Graduate) => {
    setGraduates(prev => [...prev, graduate]);
  }, []);

  const handleUpdateGraduate = useCallback((updatedGraduate: Graduate) => {
    setGraduates(prev => prev.map(g => g.id === updatedGraduate.id ? updatedGraduate : g));
  }, []);

  const handleDeleteGraduate = useCallback((id: string) => {
    setGraduates(prev => prev.filter(g => g.id !== id));
  }, []);
  
  const handleImportGraduates = useCallback((newGraduates: Graduate[]) => {
    setGraduates(prev => {
        const updatedGraduates = [...prev, ...newGraduates];
        return updatedGraduates;
    });
    setActiveView('dashboard');
  }, []);

  const handleAddDocente = useCallback((docente: Docente) => {
    setDocentes(prev => [...prev, docente]);
  }, []);
  
  const handleUpdateDocente = useCallback((updatedDocente: Docente) => {
    setDocentes(prev => prev.map(d => d.id === updatedDocente.id ? updatedDocente : d));
  }, []);

  const handleDeleteDocente = useCallback((id: string) => {
    setDocentes(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleImportDocentes = useCallback((newDocentes: Docente[]) => {
    setDocentes(prev => [...prev, ...newDocentes]);
  }, []);

  const handleAddProjeto = useCallback((projeto: Projeto) => {
    setProjetos(prev => [...prev, projeto]);
  }, []);

  const handleUpdateProjeto = useCallback((updatedProjeto: Projeto) => {
    setProjetos(prev => prev.map(p => p.id === updatedProjeto.id ? updatedProjeto : p));
  }, []);

  const handleDeleteProjeto = useCallback((id: string) => {
    setProjetos(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleImportProjetos = useCallback((newProjetos: Projeto[]) => {
    setProjetos(prev => [...prev, ...newProjetos]);
  }, []);

  const handleAddTurma = useCallback((turma: Turma) => {
    setTurmas(prev => [...prev, turma]);
  }, []);

  const handleUpdateTurma = useCallback((updatedTurma: Turma) => {
    setTurmas(prev => prev.map(t => t.id === updatedTurma.id ? updatedTurma : t));
  }, []);

  const handleDeleteTurma = useCallback((id: string) => {
    setTurmas(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const handleImportTurmas = useCallback((newTurmas: Turma[]) => {
    setTurmas(prev => [...prev, ...newTurmas]);
  }, []);

  const handleAddAlunoRegular = useCallback((aluno: AlunoRegular) => {
    setAlunosRegulares(prev => [...prev, aluno]);
  }, []);

  const handleUpdateAlunoRegular = useCallback((updatedAluno: AlunoRegular) => {
    setAlunosRegulares(prev => prev.map(a => a.id === updatedAluno.id ? updatedAluno : a));
  }, []);

  const handleDeleteAlunoRegular = useCallback((id: string) => {
    setAlunosRegulares(prev => prev.filter(a => a.id !== id));
  }, []);
  
  const handleImportAlunosRegulares = useCallback((newAlunos: AlunoRegular[]) => {
    setAlunosRegulares(prev => [...prev, ...newAlunos]);
  }, []);
  
  const handleAddAlunoEspecial = useCallback((aluno: AlunoEspecial) => {
    setAlunosEspeciais(prev => [...prev, aluno]);
  }, []);

  const handleUpdateAlunoEspecial = useCallback((updatedAluno: AlunoEspecial) => {
    setAlunosEspeciais(prev => prev.map(a => a.id === updatedAluno.id ? updatedAluno : a));
  }, []);

  const handleDeleteAlunoEspecial = useCallback((id: string) => {
    setAlunosEspeciais(prev => prev.filter(a => a.id !== id));
  }, []);
  
  const handleImportAlunosEspeciais = useCallback((newAlunos: AlunoEspecial[]) => {
    setAlunosEspeciais(prev => [...prev, ...newAlunos]);
  }, []);

  const handleAddPeriodico = useCallback((periodico: Periodico) => {
    setPeriodicos(prev => [...prev, periodico]);
  }, []);
  const handleUpdatePeriodico = useCallback((updatedPeriodico: Periodico) => {
    setPeriodicos(prev => prev.map(p => p.id === updatedPeriodico.id ? updatedPeriodico : p));
  }, []);
  const handleDeletePeriodico = useCallback((id: string) => {
    setPeriodicos(prev => prev.filter(p => p.id !== id));
  }, []);
  const handleImportPeriodicos = useCallback((newPeriodicos: Periodico[]) => {
    setPeriodicos(prev => [...prev, ...newPeriodicos]);
  }, []);

  const handleAddConferencia = useCallback((conferencia: Conferencia) => {
    setConferencias(prev => [...prev, conferencia]);
  }, []);
  const handleUpdateConferencia = useCallback((updatedConferencia: Conferencia) => {
    setConferencias(prev => prev.map(c => c.id === updatedConferencia.id ? updatedConferencia : c));
  }, []);
  const handleDeleteConferencia = useCallback((id: string) => {
    setConferencias(prev => prev.filter(c => c.id !== id));
  }, []);
  const handleImportConferencias = useCallback((newConferencias: Conferencia[]) => {
    setConferencias(prev => [...prev, ...newConferencias]);
  }, []);
  
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);
  
  const handleRestoreBackup = useCallback((data: any) => {
    try {
        if (!data || typeof data !== 'object') {
            throw new Error("Backup data is not a valid object.");
        }
        
        setGraduates(Array.isArray(data.graduates) ? data.graduates : []);
        setDocentes(Array.isArray(data.docentes) ? data.docentes : []);
        setProjetos(Array.isArray(data.projetos) ? data.projetos : []);
        setTurmas(Array.isArray(data.turmas) ? data.turmas : []);
        setAlunosRegulares(Array.isArray(data.alunosRegulares) ? data.alunosRegulares : []);
        setAlunosEspeciais(Array.isArray(data.alunosEspeciais) ? data.alunosEspeciais : []);
        setPeriodicos(Array.isArray(data.periodicos) ? data.periodicos : []);
        setConferencias(Array.isArray(data.conferencias) ? data.conferencias : []);

        alert('Backup restaurado com sucesso.');
    } catch (error) {
        console.error("Falha ao restaurar dados:", error);
        alert(`Ocorreu um erro ao restaurar os dados do backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, []);

  const handleClearAllData = useCallback(() => {
    try {
      localStorage.removeItem(APP_GRADUATES_STORAGE_KEY);
      localStorage.removeItem(APP_DOCENTES_STORAGE_KEY);
      localStorage.removeItem(APP_PROJETOS_STORAGE_KEY);
      localStorage.removeItem(APP_TURMAS_STORAGE_KEY);
      localStorage.removeItem(APP_ALUNOS_REGULARES_STORAGE_KEY);
      localStorage.removeItem(APP_ALUNOS_ESPECIAIS_STORAGE_KEY);
      localStorage.removeItem(APP_PERIODICOS_STORAGE_KEY);
      localStorage.removeItem(APP_CONFERENCIAS_STORAGE_KEY);
      
      setGraduates([]);
      setDocentes([]);
      setProjetos([]);
      setTurmas([]);
      setAlunosRegulares([]);
      setAlunosEspeciais([]);
      setPeriodicos([]);
      setConferencias([]);

      alert('Todos os dados foram removidos com sucesso.');
    } catch (error) {
        console.error("Falha ao limpar dados:", error);
        alert('Ocorreu um erro ao limpar os dados.');
    }
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
                  graduates={graduates} 
                  docentes={docentes}
                  turmas={turmas}
                  onUpdate={handleUpdateGraduate} 
                  onDelete={handleDeleteGraduate}
                  projetos={projetos}
                  onUpdateProjeto={handleUpdateProjeto}
                  onDeleteProjeto={handleDeleteProjeto}
                />;
      case 'turmas':
        return <TurmasDashboard 
                  turmas={turmas}
                  onUpdate={handleUpdateTurma}
                  onDelete={handleDeleteTurma}
               />;
      case 'alunoRegular':
        return <AlunoRegularDashboard
                  alunos={alunosRegulares}
                  onUpdate={handleUpdateAlunoRegular}
                  onDelete={handleDeleteAlunoRegular}
                />;
      case 'alunoEspecial':
        return <AlunoEspecialDashboard />;
      case 'docentes':
        return <DocentesDashboard
                  docentes={docentes}
                  onUpdate={handleUpdateDocente}
                  onDelete={handleDeleteDocente}
                />;
      case 'publicacoes':
        return <PublicacoesDashboard
                  periodicos={periodicos}
                  conferencias={conferencias}
                  onUpdatePeriodico={handleUpdatePeriodico}
                  onDeletePeriodico={handleDeletePeriodico}
                  onUpdateConferencia={handleUpdateConferencia}
                  onDeleteConferencia={handleDeleteConferencia}
                />;
      case 'dataManagement':
        return <DataManagement 
                  onAddGraduate={handleAddGraduate} 
                  onImportGraduates={handleImportGraduates}
                  onAddDocente={handleAddDocente}
                  onImportDocentes={handleImportDocentes}
                  onAddProjeto={handleAddProjeto}
                  onImportProjetos={handleImportProjetos}
                  onAddTurma={handleAddTurma}
                  onImportTurmas={handleImportTurmas}
                  onAddAlunoRegular={handleAddAlunoRegular}
                  onImportAlunosRegulares={handleImportAlunosRegulares}
                  onAddAlunoEspecial={handleAddAlunoEspecial}
                  onImportAlunosEspeciais={handleImportAlunosEspeciais}
                  onAddPeriodico={handleAddPeriodico}
                  onImportPeriodicos={handleImportPeriodicos}
                  onAddConferencia={handleAddConferencia}
                  onImportConferencias={handleImportConferencias}
                  onRestoreBackup={handleRestoreBackup}
                  graduates={graduates}
                  docentes={docentes}
                  projetos={projetos}
                  turmas={turmas}
                  alunosRegulares={alunosRegulares}
                  alunosEspeciais={alunosEspeciais}
                  periodicos={periodicos}
                  conferencias={conferencias}
                  onClearAllData={handleClearAllData}
                />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard 
                  graduates={graduates} 
                  docentes={docentes}
                  turmas={turmas}
                  onUpdate={handleUpdateGraduate} 
                  onDelete={handleDeleteGraduate}
                  projetos={projetos}
                  onUpdateProjeto={handleUpdateProjeto}
                  onDeleteProjeto={handleDeleteProjeto}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewTitles[activeView]} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;