import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import AdminPanel from './components/AdminPanel';
import { Graduate, Docente, Projeto, Turma, AlunoRegular, Periodico, Conferencia, AlunoEspecial, User } from './types';
import TurmasDashboard from './components/TurmasDashboard';
import AlunoRegularDashboard from './components/AlunoRegularDashboard';
import PublicacoesDashboard from './components/PublicacoesDashboard';
import DocentesDashboard from './components/DocentesDashboard';
import AlunoEspecialDashboard from './components/AlunoEspecialDashboard';
import { MOCK_USERS } from './constants';

// Declaração para o localforage carregado via CDN no index.html
declare const localforage: any;

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
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Admin
  const userRole = currentUser.role;

  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // States
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunosRegulares, setAlunosRegulares] = useState<AlunoRegular[]>([]);
  const [alunosEspeciais, setAlunosEspeciais] = useState<AlunoEspecial[]>([]);
  const [periodicos, setPeriodicos] = useState<Periodico[]>([]);
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect Viewer away from restricted pages
  useEffect(() => {
    if (userRole === 'Visualizador') {
      if (['docentes', 'dataManagement', 'admin'].includes(activeView)) {
        setActiveView('dashboard');
      }
    }
  }, [userRole, activeView]);

  // Load Data from IndexedDB on Startup
  useEffect(() => {
    const loadData = async () => {
        try {
            const [
                grads, 
                docs, 
                projs, 
                turmasData, 
                alunosReg, 
                alunosEsp, 
                periods, 
                confs
            ] = await Promise.all([
                localforage.getItem(APP_GRADUATES_STORAGE_KEY),
                localforage.getItem(APP_DOCENTES_STORAGE_KEY),
                localforage.getItem(APP_PROJETOS_STORAGE_KEY),
                localforage.getItem(APP_TURMAS_STORAGE_KEY),
                localforage.getItem(APP_ALUNOS_REGULARES_STORAGE_KEY),
                localforage.getItem(APP_ALUNOS_ESPECIAIS_STORAGE_KEY),
                localforage.getItem(APP_PERIODICOS_STORAGE_KEY),
                localforage.getItem(APP_CONFERENCIAS_STORAGE_KEY)
            ]);

            if (grads) setGraduates(grads);
            if (docs) setDocentes(docs);
            if (projs) setProjetos(projs);
            if (turmasData) setTurmas(turmasData);
            if (alunosReg) setAlunosRegulares(alunosReg);
            if (alunosEsp) setAlunosEspeciais(alunosEsp);
            if (periods) setPeriodicos(periods);
            if (confs) setConferencias(confs);
        } catch (err) {
            console.error("Erro ao carregar dados do banco de dados:", err);
        } finally {
            setIsLoaded(true);
        }
    };
    loadData();
  }, []);

  // Save Data Observers - Only save if initial load is complete
  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_GRADUATES_STORAGE_KEY, graduates);
  }, [graduates, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_DOCENTES_STORAGE_KEY, docentes);
  }, [docentes, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_PROJETOS_STORAGE_KEY, projetos);
  }, [projetos, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_TURMAS_STORAGE_KEY, turmas);
  }, [turmas, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_ALUNOS_REGULARES_STORAGE_KEY, alunosRegulares);
  }, [alunosRegulares, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_ALUNOS_ESPECIAIS_STORAGE_KEY, alunosEspeciais);
  }, [alunosEspeciais, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_PERIODICOS_STORAGE_KEY, periodicos);
  }, [periodicos, isLoaded]);

  useEffect(() => {
    if (isLoaded) localforage.setItem(APP_CONFERENCIAS_STORAGE_KEY, conferencias);
  }, [conferencias, isLoaded]);


  // --- Handlers ---

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
    setGraduates(prev => [...prev, ...newGraduates]);
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
        
        // Batch updates are fine as localforage will handle the async sets in the effects
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

  const handleClearAllData = useCallback(async () => {
    try {
      // Clear persistent storage
      await localforage.clear();
      
      // Clear React state
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
                  userRole={userRole}
                />;
      case 'turmas':
        return <TurmasDashboard 
                  turmas={turmas}
                  onUpdate={handleUpdateTurma}
                  onDelete={handleDeleteTurma}
                  userRole={userRole}
               />;
      case 'alunoRegular':
        return <AlunoRegularDashboard
                  alunos={alunosRegulares}
                  onUpdate={handleUpdateAlunoRegular}
                  onDelete={handleDeleteAlunoRegular}
                  userRole={userRole}
                />;
      case 'alunoEspecial':
        return <AlunoEspecialDashboard />;
      case 'docentes':
        if (userRole === 'Visualizador') return null;
        return <DocentesDashboard
                  docentes={docentes}
                  onUpdate={handleUpdateDocente}
                  onDelete={handleDeleteDocente}
                  userRole={userRole}
                />;
      case 'publicacoes':
        return <PublicacoesDashboard
                  periodicos={periodicos}
                  conferencias={conferencias}
                  onUpdatePeriodico={handleUpdatePeriodico}
                  onDeletePeriodico={handleDeletePeriodico}
                  onUpdateConferencia={handleUpdateConferencia}
                  onDeleteConferencia={handleDeleteConferencia}
                  userRole={userRole}
                />;
      case 'dataManagement':
        if (userRole === 'Visualizador') return null;
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
        if (userRole === 'Visualizador') return null;
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
                  userRole={userRole}
                />;
    }
  };

  if (!isLoaded) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
              <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
                  Carregando dados...
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        userRole={userRole}
        onUserChange={(userId) => {
            const user = MOCK_USERS.find(u => u.id === userId);
            if (user) setCurrentUser(user);
        }}
        currentUser={currentUser}
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