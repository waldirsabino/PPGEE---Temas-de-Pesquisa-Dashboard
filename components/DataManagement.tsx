
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Graduate, Course, Status, Docente, Projeto, Turma, AlunoRegular, Periodico, Conferencia, AlunoEspecial } from '../types';
import DataForm from './DataForm';
import DocenteForm from './DocenteForm';
import ProjetoForm from './ProjetoForm';
import TurmaForm from './TurmaForm';
import AlunoRegularForm from './AlunoRegularForm';
import PeriodicoForm from './PeriodicoForm';
import ConferenciaForm from './ConferenciaForm';
import AlunoEspecialForm from './AlunoEspecialForm';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import TrashIcon from './icons/TrashIcon';

declare const XLSX: any;

interface DataManagementProps {
  onAddGraduate: (graduate: Graduate) => void;
  onImportGraduates: (graduates: Graduate[]) => void;
  onAddDocente: (docente: Docente) => void;
  onImportDocentes: (docentes: Docente[]) => void;
  onAddProjeto: (projeto: Projeto) => void;
  onImportProjetos: (projetos: Projeto[]) => void;
  onAddTurma: (turma: Turma) => void;
  onImportTurmas: (turmas: Turma[]) => void;
  onAddAlunoRegular: (aluno: AlunoRegular) => void;
  onImportAlunosRegulares: (alunos: AlunoRegular[]) => void;
  onAddAlunoEspecial: (aluno: AlunoEspecial) => void;
  onImportAlunosEspeciais: (alunos: AlunoEspecial[]) => void;
  onAddPeriodico: (periodico: Periodico) => void;
  onImportPeriodicos: (periodicos: Periodico[]) => void;
  onAddConferencia: (conferencia: Conferencia) => void;
  onImportConferencias: (conferencias: Conferencia[]) => void;
  onRestoreBackup: (data: any) => void;
  graduates: Graduate[];
  docentes: Docente[];
  projetos: Projeto[];
  turmas: Turma[];
  alunosRegulares: AlunoRegular[];
  alunosEspeciais: AlunoEspecial[];
  periodicos: Periodico[];
  conferencias: Conferencia[];
  onClearAllData: () => void;
}

const getBooleanFromRow = (row: any, keys: string[]): boolean => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null) {
      return String(value).trim().toLowerCase() === 's';
    }
  }
  return false;
};


const DataManagement: React.FC<DataManagementProps> = ({ 
  onAddGraduate, 
  onImportGraduates, 
  onAddDocente, 
  onImportDocentes,
  onAddProjeto,
  onImportProjetos,
  onAddTurma,
  onImportTurmas,
  onAddAlunoRegular,
  onImportAlunosRegulares,
  onAddAlunoEspecial,
  onImportAlunosEspeciais,
  onAddPeriodico,
  onImportPeriodicos,
  onAddConferencia,
  onImportConferencias,
  onRestoreBackup,
  graduates,
  docentes,
  projetos,
  turmas,
  alunosRegulares,
  alunosEspeciais,
  periodicos,
  conferencias,
  onClearAllData
}) => {
  const [isAddingGraduate, setIsAddingGraduate] = useState(false);
  const [graduateError, setGraduateError] = useState<string | null>(null);
  const graduateFileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingDocente, setIsAddingDocente] = useState(false);
  const [docenteError, setDocenteError] = useState<string | null>(null);
  const docenteFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingProjeto, setIsAddingProjeto] = useState(false);
  const [projetoError, setProjetoError] = useState<string | null>(null);
  const projetoFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingTurma, setIsAddingTurma] = useState(false);
  const [turmaError, setTurmaError] = useState<string | null>(null);
  const turmaFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingAlunoRegular, setIsAddingAlunoRegular] = useState(false);
  const [alunoRegularError, setAlunoRegularError] = useState<string | null>(null);
  const alunoRegularFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingAlunoEspecial, setIsAddingAlunoEspecial] = useState(false);
  const [alunoEspecialError, setAlunoEspecialError] = useState<string | null>(null);
  const alunoEspecialFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingPeriodico, setIsAddingPeriodico] = useState(false);
  const [periodicoError, setPeriodicoError] = useState<string | null>(null);
  const periodicoFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddingConferencia, setIsAddingConferencia] = useState(false);
  const [conferenciaError, setConferenciaError] = useState<string | null>(null);
  const conferenciaFileInputRef = useRef<HTMLInputElement>(null);

  const uniqueDocenteNames = useMemo(() => (
    Array.from(
      new Set(docentes.map(d => d.nome).filter(name => typeof name === 'string' && name.trim() !== ''))
    ).sort()
  ), [docentes]);

  const formatDate = (date: any): string | undefined => {
      if (!date) return undefined;
      if (date instanceof Date && !isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
      }
      if (typeof date === 'string' && /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(date)) {
          return date.replace(/-/g, '/');
      }
      return undefined;
  };

  const createJsonDownloader = (data: any[], fileNamePrefix: string) => {
    return () => {
      if (!data || data.length === 0) {
        alert(`Não há dados de ${fileNamePrefix} para exportar.`);
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `ppgee-${fileNamePrefix}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  };

  const handleGraduateFileExport = useCallback(createJsonDownloader(graduates, 'egressos'), [graduates]);
  const handleDocenteFileExport = useCallback(createJsonDownloader(docentes, 'docentes'), [docentes]);
  const handleProjetoFileExport = useCallback(createJsonDownloader(projetos, 'projetos'), [projetos]);
  const handleTurmaFileExport = useCallback(createJsonDownloader(turmas, 'turmas'), [turmas]);
  const handleAlunoRegularFileExport = useCallback(createJsonDownloader(alunosRegulares, 'alunos-regulares'), [alunosRegulares]);
  const handleAlunoEspecialFileExport = useCallback(createJsonDownloader(alunosEspeciais, 'alunos-especiais'), [alunosEspeciais]);
  const handlePeriodicoFileExport = useCallback(createJsonDownloader(periodicos, 'periodicos'), [periodicos]);
  const handleConferenciaFileExport = useCallback(createJsonDownloader(conferencias, 'conferencias'), [conferencias]);


  const handleGraduateFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setGraduateError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de egressos.");
                }
                const sanitizedGraduates: Graduate[] = (jsonData as any[]).map((item, index): Graduate => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    nome: String(item.nome ?? 'N/A'),
                    anoIngresso: String(item.anoIngresso ?? 'N/A'),
                    anoDefesa: item.anoDefesa ? String(item.anoDefesa) : undefined,
                    orientador: String(item.orientador ?? 'N/A'),
                    tituloDefesa: String(item.tituloDefesa ?? ''),
                    curso: item.curso === Course.DOUTORADO ? Course.DOUTORADO : Course.MESTRADO,
                    status: item.status === Status.DEFENDIDO ? Status.DEFENDIDO : Status.CURSANDO,
                    cursandoDoutorado: Boolean(item.cursandoDoutorado ?? false),
                    trabalhando: item.trabalhando ? String(item.trabalhando) : undefined,
                    trabalhandoOutroEstado: Boolean(item.trabalhandoOutroEstado ?? false),
                }));
                onImportGraduates(sanitizedGraduates);
                alert(`${sanitizedGraduates.length} registros de egressos importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de egressos:", err);
                setGraduateError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if(graduateFileInputRef.current) graduateFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            const newGraduates: Graduate[] = json.reduce((acc: Graduate[], row: any) => {
                const anoIngresso = formatDate(row['ANO DE INGRESSO']);
                if (!anoIngresso) return acc;
                const anoDefesa = formatDate(row['ANO DE DEFESA']);
                acc.push({
                  id: `imported-${new Date().toISOString()}-${Math.random()}`,
                  nome: row['NOME DO ALUNO'] || 'N/A',
                  anoIngresso,
                  anoDefesa,
                  orientador: row['ORIENTADOR'] || 'N/A',
                  tituloDefesa: row['TÍTULO DE DEFESA'] || '',
                  curso: row['CURSO'] === 'Doutorado' ? Course.DOUTORADO : Course.MESTRADO,
                  status: row['Status'] === 'Defendido' ? Status.DEFENDIDO : Status.CURSANDO,
                  cursandoDoutorado: String(row['Está cursando doutorado como aluno regular?'])?.toLowerCase() === 'sim',
                  trabalhando: row['Encontra-se trabalhando? Se sim, onde?'] || undefined,
                  trabalhandoOutroEstado: String(row['Está trabalhando em outro estado da federação?'])?.toLowerCase() === 'sim',
                });
                return acc;
            }, []);
            onImportGraduates(newGraduates);
            alert(`${newGraduates.length} registros de egressos importados com sucesso do arquivo Excel!`);
          } catch (err) {
            console.error("Erro ao processar o arquivo Excel de egressos:", err);
            setGraduateError("Erro ao processar o arquivo Excel. Verifique o formato e as colunas. As datas devem estar em um formato de data válido.");
          } finally {
            if(graduateFileInputRef.current) graduateFileInputRef.current.value = "";
          }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportGraduates, formatDate]);

  const handleDocenteFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocenteError(null);
    const reader = new FileReader();
    
    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de docentes.");
                }
                const sanitizedDocentes: Docente[] = (jsonData as any[]).map((item, index): Docente => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    nome: String(item.nome ?? 'N/A'),
                    email: item.email ? String(item.email) : undefined,
                    fone: item.fone ? String(item.fone) : undefined,
                    categoria: String(item.categoria ?? 'N/A'),
                    ano: Number(item.ano ?? new Date().getFullYear()),
                    bolsaPQDT: Boolean(item.bolsaPQDT ?? false),
                    dedicacaoExclusivaPPG: Boolean(item.dedicacaoExclusivaPPG ?? false),
                    lecionouDisciplinaQuadrienio: Boolean(item.lecionouDisciplinaQuadrienio ?? false),
                    participouPublicacaoQuadrienio: Boolean(item.participouPublicacaoQuadrienio ?? false),
                    teveOrientacaoConcluidaQuadrienio: Boolean(item.teveOrientacaoConcluidaQuadrienio ?? false),
                }));
                onImportDocentes(sanitizedDocentes);
                alert(`${sanitizedDocentes.length} registros de docentes importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de docentes:", err);
                setDocenteError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if(docenteFileInputRef.current) docenteFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            const newDocentes: Docente[] = json.reduce((acc: Docente[], row: any) => {
              const ano = parseInt(row['Ano'], 10);
              const nome = row['Docente'];
              if (nome && !isNaN(ano)) {
                acc.push({
                  id: `imported-${new Date().toISOString()}-${Math.random()}`,
                  nome: nome,
                  email: row['Email'] || row['email'] || row['E-mail'] || undefined,
                  fone: row['Fone'] || row['fone'] || row['Telefone'] || undefined,
                  categoria: row['Categoria'] || 'N/A',
                  ano: ano,
                  bolsaPQDT: getBooleanFromRow(row, ['Bolsa PQ-DT']),
                  dedicacaoExclusivaPPG: getBooleanFromRow(row, ['Dedicação Exclusiva ao PPG']),
                  lecionouDisciplinaQuadrienio: getBooleanFromRow(row, [
                    'Lecionou uma disciplina no quadrienio',
                    'Lecionou 1 disciplina no quadriênio'
                  ]),
                  participouPublicacaoQuadrienio: getBooleanFromRow(row, [
                    'Participou de uma publicação em periódico no quadrienio',
                    'Participou 1 publicação em periódico no quadrienio'
                  ]),
                  teveOrientacaoConcluidaQuadrienio: getBooleanFromRow(row, [
                    'Teve uma orientação concluida no quadrienio',
                    'Teve 1 orientação concluida no quadrienio'
                  ]),
                });
              }
              return acc;
            }, []);

            onImportDocentes(newDocentes);
            alert(`${newDocentes.length} registros de docentes importados com sucesso do arquivo Excel!`);
          } catch (err) {
            console.error("Erro ao processar o arquivo Excel de docentes:", err);
            setDocenteError("Erro ao processar o arquivo Excel de docentes. Verifique o formato e as colunas (ex: 'Docente', 'Categoria', 'Ano', 'Bolsa PQ-DT', 'Dedicação Exclusiva ao PPG', etc.).");
          } finally {
            if(docenteFileInputRef.current) docenteFileInputRef.current.value = "";
          }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportDocentes]);

  const handleProjetoFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProjetoError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de projetos.");
                }
                 const sanitizedProjetos: Projeto[] = (jsonData as any[]).map((item, index): Projeto => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    titulo: String(item.titulo ?? 'N/A'),
                    natureza: String(item.natureza ?? ''),
                    coordenador: String(item.coordenador ?? 'N/A'),
                    financiador: String(item.financiador ?? ''),
                    colaboracaoNaoAcademica: String(item.colaboracaoNaoAcademica ?? 'Não'),
                    resumo: String(item.resumo ?? ''),
                    valorFinanciado: Number(item.valorFinanciado ?? 0),
                    atuacao: item.atuacao === 'Membro' ? 'Membro' : 'Coordenador',
                    alunosMestradoEnvolvidos: Number(item.alunosMestradoEnvolvidos ?? 0),
                    alunosDoutoradoEnvolvidos: Number(item.alunosDoutoradoEnvolvidos ?? 0),
                    anoInicio: Number(item.anoInicio ?? new Date().getFullYear()),
                    anoFim: item.anoFim ? Number(item.anoFim) : undefined,
                }));
                onImportProjetos(sanitizedProjetos);
                alert(`${sanitizedProjetos.length} registros de projetos importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de projetos:", err);
                setProjetoError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if(projetoFileInputRef.current) projetoFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            const newProjetos: Projeto[] = json.reduce((acc: Projeto[], row: any) => {
              const anoInicio = parseInt(row['Ano de Início'], 10);
              if (row['Título do Projeto'] && !isNaN(anoInicio)) {
                const anoFim = parseInt(row['Ano de Fim'], 10);
                
                const mestrandosValue = row['Quantidade de alunos de Mestrado do PPGEE envolvidos'] ?? row['Mestrandos'];
                const doutorandosValue = row['Quantidade de alunos de Doutorado do PPGEE envolvidos'] ?? row['Doutorandos'];

                acc.push({
                  id: `imported-${new Date().toISOString()}-${Math.random()}`,
                  titulo: row['Título do Projeto'],
                  natureza: row['Natureza'] || '',
                  coordenador: row['Coordenador'] || 'N/A',
                  financiador: row['Financiador'] || '',
                  colaboracaoNaoAcademica: row['Projetos estabelecidos com instituições que NÃO sejam acadêmicas e NÃO sejam de agências de fomento, que resultem em produtos tecnológicos ou impacto na formação de recurso humanos'] || '',
                  resumo: row['Resumo'] || '',
                  valorFinanciado: Number(row['Valor financiado']) || 0,
                  atuacao: (String(row['Atuação (ou Coordenador ou Membro)'])?.toLowerCase() === 'membro' ? 'Membro' : 'Coordenador'),
                  alunosMestradoEnvolvidos: parseInt(mestrandosValue, 10) || 0,
                  alunosDoutoradoEnvolvidos: parseInt(doutorandosValue, 10) || 0,
                  anoInicio: anoInicio,
                  anoFim: !isNaN(anoFim) ? anoFim : undefined,
                });
              }
              return acc;
            }, []);

            onImportProjetos(newProjetos);
            alert(`${newProjetos.length} registros de projetos importados com sucesso do arquivo Excel!`);
          } catch (err) {
            console.error("Erro ao processar o arquivo Excel de projetos:", err);
            setProjetoError("Erro ao processar o arquivo Excel de projetos. Verifique o formato e as colunas.");
          } finally {
            if(projetoFileInputRef.current) projetoFileInputRef.current.value = "";
          }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportProjetos]);

  const handleTurmaFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTurmaError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de turmas.");
                }
                const sanitizedTurmas: Turma[] = (jsonData as any[]).map((item, index): Turma => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    ano: Number(item.ano ?? new Date().getFullYear()),
                    periodo: String(item.periodo ?? ''),
                    codDisciplina: String(item.codDisciplina ?? ''),
                    disciplina: String(item.disciplina ?? 'N/A'),
                    siglaDisciplina: String(item.siglaDisciplina ?? ''),
                    situacao: String(item.situacao ?? ''),
                    docente: String(item.docente ?? 'N/A'),
                    vagasOferecidas: Number(item.vagasOferecidas ?? 0),
                    qtdMatriculado: Number(item.qtdMatriculado ?? 0),
                    qtdAprovados: Number(item.qtdAprovados ?? 0),
                    qtdReprovadoNota: Number(item.qtdReprovadoNota ?? 0),
                    qtdReprovadoFreq: Number(item.qtdReprovadoFreq ?? 0),
                    curso: item.curso === Course.DOUTORADO ? Course.DOUTORADO : Course.MESTRADO,
                    categoria: String(item.categoria ?? ''),
                }));
                onImportTurmas(sanitizedTurmas);
                alert(`${sanitizedTurmas.length} registros de turmas importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de turmas:", err);
                setTurmaError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if(turmaFileInputRef.current) turmaFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const newTurmas: Turma[] = json.reduce((acc: Turma[], row: any) => {
                    const ano = parseInt(row['ANO'], 10);
                    const codCurso = row['CÓD_CURSO'] || '';
                    let curso: Course;
                    if (codCurso.includes('-M')) {
                        curso = Course.MESTRADO;
                    } else if (codCurso.includes('-D')) {
                        curso = Course.DOUTORADO;
                    } else {
                        return acc;
                    }

                    if (row['DISCIPLINA'] && !isNaN(ano)) {
                        acc.push({
                            id: `imported-${new Date().toISOString()}-${Math.random()}`,
                            ano: ano,
                            periodo: row['PERÍODO'] || '',
                            codDisciplina: row['CÓD_DISCIPLINA'] || '',
                            disciplina: row['DISCIPLINA'] || '',
                            siglaDisciplina: row['SIGLA E DISCIPLINA'] || '',
                            situacao: row['SITUAÇÃO'] || '',
                            docente: row['DOCENTE'] || 'N/A',
                            vagasOferecidas: parseInt(row['VAGAS_OFERECIDAS'], 10) || 0,
                            qtdMatriculado: parseInt(row['QTD_MATRICULADO'], 10) || 0,
                            qtdAprovados: parseInt(row['QTD_APROVADOS'], 10) || 0,
                            qtdReprovadoNota: parseInt(row['QTD_REPROVADO_NOTA'], 10) || 0,
                            qtdReprovadoFreq: parseInt(row['QTD_REPROVADO_FREQ'], 10) || 0,
                            curso: curso,
                            categoria: row['CATEGORIA'] || '',
                        });
                    }
                    return acc;
                }, []);

                onImportTurmas(newTurmas);
                alert(`${newTurmas.length} registros de turmas importados com sucesso do arquivo Excel!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo Excel de turmas:", err);
                setTurmaError("Erro ao processar o arquivo Excel. Verifique o formato e as colunas.");
            } finally {
                if(turmaFileInputRef.current) turmaFileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportTurmas]);
  
  const handleAlunoRegularFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAlunoRegularError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de alunos regulares.");
                }
                 const sanitizedAlunos: AlunoRegular[] = (jsonData as any[]).map((item, index): AlunoRegular => {
                    const proficienciaNum = item.proficiencia != null ? Number(item.proficiencia) : NaN;
                    return {
                        id: item.id ?? `imported-json-${Date.now()}-${index}`,
                        matricula: String(item.matricula ?? ''),
                        aluno: String(item.aluno ?? 'N/A'),
                        ingresso: String(item.ingresso ?? 'N/A'),
                        situacao: String(item.situacao ?? 'Sem Evasão'),
                        orientador: String(item.orientador ?? 'N/A'),
                        coOrientador: item.coOrientador ? String(item.coOrientador) : undefined,
                        proficiencia: !isNaN(proficienciaNum) ? proficienciaNum : undefined,
                        qualificacao: item.qualificacao ? String(item.qualificacao) : undefined,
                        defesa: item.defesa ? String(item.defesa) : undefined,
                        bolsista: item.bolsista ? String(item.bolsista) : undefined,
                        curso: item.curso === Course.DOUTORADO ? Course.DOUTORADO : Course.MESTRADO,
                        email: item.email ? String(item.email) : undefined,
                        fone: item.fone ? String(item.fone) : undefined,
                        informacoesExtras: item.informacoesExtras ? String(item.informacoesExtras) : undefined,
                    };
                });
                onImportAlunosRegulares(sanitizedAlunos);
                alert(`${sanitizedAlunos.length} registros de alunos regulares importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de Alunos Regulares:", err);
                setAlunoRegularError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if(alunoRegularFileInputRef.current) alunoRegularFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const newAlunos: AlunoRegular[] = json.reduce((acc: AlunoRegular[], row: any) => {
                    const ingresso = formatDate(row['INGRESSO']);
                    const alunoRaw = row['ALUNO'];

                    if (ingresso && alunoRaw) {
                        const alunoNome = String(alunoRaw).toUpperCase();
                        const matriculaValue = row['MATRÍCULA'] ?? row['MATRICULA'] ?? '';
                        
                        // Handle column name typo and normalize values
                        const rawSituacao = row['SITUAÇÃO'] || row['SITUCAÇÃO'];
                        let situacaoValue = 'Sem Evasão'; // Default
                        if (rawSituacao) {
                            const trimmedLower = String(rawSituacao).trim().toLowerCase();
                            if (trimmedLower === 'desligado') {
                                situacaoValue = 'Desligado';
                            } else if (trimmedLower === 'defendido') {
                                situacaoValue = 'Defendido';
                            }
                            // Any other value (like 'sem evasão') will default to 'Sem Evasão'
                        }

                        const proficienciaRaw = row['PROFICIÊNCIA NOTA'] || row['PROFICIÊNCIA'];
                        const proficienciaValue = proficienciaRaw != null ? parseFloat(String(proficienciaRaw).replace(',', '.')) : NaN;

                        const bolsistaValue = row['BOLSISTA'] ?? row['Bolsista'] ?? row['bolsista'];

                        acc.push({
                            id: `imported-${new Date().toISOString()}-${Math.random()}`,
                            matricula: String(matriculaValue),
                            aluno: alunoNome,
                            ingresso: ingresso,
                            situacao: situacaoValue,
                            orientador: row['ORIENTADOR(A)'] || 'N/A',
                            coOrientador: row['CO ORIENTADOR(A)'] || undefined,
                            proficiencia: !isNaN(proficienciaValue) ? proficienciaValue : undefined,
                            qualificacao: formatDate(row['QUALIFICAÇÃO']) || undefined,
                            defesa: formatDate(row['DEFESA']) || undefined,
                            bolsista: bolsistaValue ? String(bolsistaValue).trim() : undefined,
                            curso: String(row['CURSO']).toLowerCase() === 'doutorado' ? Course.DOUTORADO : Course.MESTRADO,
                            email: row['email'] || row['EMAIL'] || undefined,
                            fone: row['fone'] || row['FONE'] || undefined,
                            informacoesExtras: row['Informações Extras'] || undefined,
                        });
                    }
                    return acc;
                }, []);

                onImportAlunosRegulares(newAlunos);
                alert(`${newAlunos.length} registros de alunos regulares importados com sucesso do arquivo Excel!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo Excel de Alunos Regulares:", err);
                setAlunoRegularError("Erro ao processar o arquivo Excel. Verifique o formato e as colunas.");
            } finally {
                if(alunoRegularFileInputRef.current) alunoRegularFileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportAlunosRegulares, formatDate]);

  const handleAlunoEspecialFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAlunoEspecialError(null);
    const reader = new FileReader();

    const handleData = (jsonData: any[]) => {
      const newAlunos: AlunoEspecial[] = jsonData.reduce((acc: AlunoEspecial[], row: any, index: number) => {
        const ano = parseInt(row['ANO'], 10);
        const aluno = row['ALUNO'];
        if (aluno && !isNaN(ano)) {
          acc.push({
            id: row.id || `imported-${Date.now()}-${index}`,
            matricula: String(row['MATRICULA'] ?? ''),
            aluno: String(aluno),
            ano: ano,
            periodo: String(row['PERIODO'] ?? ''),
            codDisciplina: String(row['COD_DISCIPLINA'] ?? ''),
            disciplina: String(row['DISCIPLINA'] ?? ''),
            situacao: row['SITUACAO'] ?? 'Cursando',
            email: row['EMAIL'] || undefined,
            fone: row['FONE'] || undefined,
          });
        }
        return acc;
      }, []);
      onImportAlunosEspeciais(newAlunos);
      alert(`${newAlunos.length} registros de alunos especiais importados com sucesso!`);
    };

    if (file.name.toLowerCase().endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const jsonData = JSON.parse(text);
          if (!Array.isArray(jsonData)) throw new Error("JSON deve ser um array.");
          handleData(jsonData);
        } catch (err) {
          console.error("Erro ao processar JSON de Alunos Especiais:", err);
          setAlunoEspecialError(`Erro ao processar arquivo JSON: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        } finally {
          if (alunoEspecialFileInputRef.current) alunoEspecialFileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          handleData(json);
        } catch (err) {
          console.error("Erro ao processar Excel de Alunos Especiais:", err);
          setAlunoEspecialError("Erro ao processar arquivo Excel. Verifique o formato e colunas.");
        } finally {
          if (alunoEspecialFileInputRef.current) alunoEspecialFileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onImportAlunosEspeciais]);

  const handlePeriodicoFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPeriodicoError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de periódicos.");
                }
                const sanitizedPeriodicos: Periodico[] = (jsonData as any[]).map((item, index): Periodico => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    titulo: String(item.titulo ?? 'N/A'),
                    periodico: String(item.periodico ?? 'N/A'),
                    autor: String(item.autor ?? 'N/A'),
                    ano: Number(item.ano ?? new Date().getFullYear()),
                    discenteEgresso: Boolean(item.discenteEgresso ?? false),
                    docentePPGEE: Boolean(item.docentePPGEE ?? false),
                    categoria: String(item.categoria ?? ''),
                }));
                onImportPeriodicos(sanitizedPeriodicos);
                alert(`${sanitizedPeriodicos.length} registros de periódicos importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de periódicos:", err);
                setPeriodicoError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if (periodicoFileInputRef.current) periodicoFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newPeriodicos: Periodico[] = json.reduce((acc: Periodico[], row: any) => {
              const ano = parseInt(row['Ano'], 10);
              if (row['Título'] && !isNaN(ano)) {
                acc.push({
                  id: `imported-${new Date().toISOString()}-${Math.random()}`,
                  titulo: row['Título'],
                  periodico: row['Periódico'],
                  autor: row['Autor'],
                  ano: ano,
                  discenteEgresso: getBooleanFromRow(row, ['Discente ou egresso (s/n)']),
                  docentePPGEE: getBooleanFromRow(row, ['Docente do PPGEE (s/n)']),
                  categoria: row['Categoria'],
                });
              }
              return acc;
            }, []);

            onImportPeriodicos(newPeriodicos);
            alert(`${newPeriodicos.length} registros de periódicos importados com sucesso do arquivo Excel!`);
          } catch (err) {
            console.error("Erro ao processar o arquivo Excel de periódicos:", err);
            setPeriodicoError("Erro ao processar o arquivo Excel. Verifique o formato e as colunas.");
          } finally {
            if (periodicoFileInputRef.current) periodicoFileInputRef.current.value = "";
          }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportPeriodicos]);

  const handleConferenciaFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setConferenciaError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.json')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const jsonData = JSON.parse(text);
                if (!Array.isArray(jsonData)) {
                    throw new Error("O arquivo JSON deve conter um array de conferências.");
                }
                const sanitizedConferencias: Conferencia[] = (jsonData as any[]).map((item, index): Conferencia => ({
                    id: item.id ?? `imported-json-${Date.now()}-${index}`,
                    titulo: String(item.titulo ?? 'N/A'),
                    autor: String(item.autor ?? 'N/A'),
                    ano: Number(item.ano ?? new Date().getFullYear()),
                    categoria: String(item.categoria ?? ''),
                }));
                onImportConferencias(sanitizedConferencias);
                alert(`${sanitizedConferencias.length} registros de conferências importados com sucesso do arquivo JSON!`);
            } catch (err) {
                console.error("Erro ao processar o arquivo JSON de conferências:", err);
                setConferenciaError(`Erro ao processar o arquivo JSON. Verifique o formato. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            } finally {
                if (conferenciaFileInputRef.current) conferenciaFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newConferencias: Conferencia[] = json.reduce((acc: Conferencia[], row: any) => {
              const ano = parseInt(row['Ano'], 10);
              if (row['Título'] && !isNaN(ano)) {
                acc.push({
                  id: `imported-${new Date().toISOString()}-${Math.random()}`,
                  titulo: row['Título'],
                  autor: row['Autor'],
                  ano: ano,
                  categoria: row['Categoria'],
                });
              }
              return acc;
            }, []);

            onImportConferencias(newConferencias);
            alert(`${newConferencias.length} registros de conferências importados com sucesso do arquivo Excel!`);
          } catch (err) {
            console.error("Erro ao processar o arquivo Excel de conferências:", err);
            setConferenciaError("Erro ao processar o arquivo Excel. Verifique o formato e as colunas.");
          } finally {
            if (conferenciaFileInputRef.current) conferenciaFileInputRef.current.value = "";
          }
        };
        reader.readAsArrayBuffer(file);
    }
  }, [onImportConferencias]);

  const handleAddGraduate = (graduate: Graduate) => {
    onAddGraduate(graduate);
    setIsAddingGraduate(false);
  };
  
  const handleAddDocente = (docente: Docente) => {
    onAddDocente(docente);
    setIsAddingDocente(false);
  };

  const handleAddProjeto = (projeto: Projeto) => {
    onAddProjeto(projeto);
    setIsAddingProjeto(false);
  };

  const handleAddTurma = (turma: Turma) => {
    onAddTurma(turma);
    setIsAddingTurma(false);
  };
  
  const handleAddAlunoRegular = (aluno: AlunoRegular) => {
    onAddAlunoRegular(aluno);
    setIsAddingAlunoRegular(false);
  };
  
  const handleAddAlunoEspecial = (aluno: AlunoEspecial) => {
    onAddAlunoEspecial(aluno);
    setIsAddingAlunoEspecial(false);
  };

  const handleAddPeriodico = (periodico: Periodico) => {
    onAddPeriodico(periodico);
    setIsAddingPeriodico(false);
  };

  const handleAddConferencia = (conferencia: Conferencia) => {
    onAddConferencia(conferencia);
    setIsAddingConferencia(false);
  };

  const handleBackup = useCallback(() => {
    const backupData = {
      graduates,
      docentes,
      projetos,
      turmas,
      alunosRegulares,
      alunosEspeciais,
      periodicos,
      conferencias,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    a.download = `ppgee-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [graduates, docentes, projetos, turmas, alunosRegulares, alunosEspeciais, periodicos, conferencias]);
  
  const handleRestore = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!data || typeof data !== 'object') {
          throw new Error("Arquivo de backup inválido. O conteúdo deve ser um objeto JSON.");
        }
        
        const confirmation = window.confirm(
          "Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos."
        );

        if (confirmation) {
          onRestoreBackup(data);
        }
      } catch (err) {
        console.error("Erro ao restaurar o backup:", err);
        alert(`Erro ao restaurar o backup. Verifique se o arquivo é um backup válido. Detalhe: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      } finally {
        if(restoreFileInputRef.current) restoreFileInputRef.current.value = "";
      }
    };
    reader.onerror = (e) => {
        console.error("Erro ao ler arquivo:", e);
        alert("Erro ao ler o arquivo de backup.");
        if(restoreFileInputRef.current) restoreFileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }, [onRestoreBackup]);

  const handleClearData = useCallback(() => {
    const confirmationMessage = "ATENÇÃO!\n\nEsta ação é irreversível e irá apagar TODOS os dados (Egressos, Docentes, Projetos, Turmas, Alunos Regulares e Publicações) da aplicação.\n\nTem certeza que deseja continuar?";
    if (window.confirm(confirmationMessage)) {
      onClearAllData();
    }
  }, [onClearAllData]);
  
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">1. Gerenciamento de Dados - Egressos</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados dos egressos.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingGraduate(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Egresso
            </button>
            <button onClick={handleGraduateFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={graduateFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleGraduateFileImport} />
            </label>
          </div>
        </div>
        {graduateError && <p className="mt-4 text-sm text-red-600">{graduateError}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">2. Gerenciamento de Dados - Docentes</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados dos docentes.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingDocente(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Docente
            </button>
            <button onClick={handleDocenteFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={docenteFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleDocenteFileImport} />
            </label>
          </div>
        </div>
        {docenteError && <p className="mt-4 text-sm text-red-600">{docenteError}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">3. Gerenciamento de Dados - Projetos</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados dos projetos.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingProjeto(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Projeto
            </button>
            <button onClick={handleProjetoFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={projetoFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleProjetoFileImport} />
            </label>
          </div>
        </div>
        {projetoError && <p className="mt-4 text-sm text-red-600">{projetoError}</p>}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">4. Gerenciamento de Dados - Turmas</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados das turmas.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingTurma(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Turma
            </button>
             <button onClick={handleTurmaFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={turmaFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleTurmaFileImport} />
            </label>
          </div>
        </div>
        {turmaError && <p className="mt-4 text-sm text-red-600">{turmaError}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">5. Gerenciamento de Dados - Alunos Regulares</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados dos alunos.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingAlunoRegular(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Aluno
            </button>
            <button onClick={handleAlunoRegularFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={alunoRegularFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleAlunoRegularFileImport} />
            </label>
          </div>
        </div>
        {alunoRegularError && <p className="mt-4 text-sm text-red-600">{alunoRegularError}</p>}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">6. Gerenciamento de Dados - Alunos Especiais</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados dos alunos especiais.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setIsAddingAlunoEspecial(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Adicionar Aluno
            </button>
            <button onClick={handleAlunoEspecialFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Exp Arquivo
            </button>
            <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
              <span>Imp Arquivo</span>
              <input ref={alunoEspecialFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleAlunoEspecialFileImport} />
            </label>
          </div>
        </div>
        {alunoEspecialError && <p className="mt-4 text-sm text-red-600">{alunoEspecialError}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">7. Gerenciamento de Dados - Publicações</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Adicione, importe (.xlsx ou .json) ou exporte (.json) os dados das publicações.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Periódicos</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setIsAddingPeriodico(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                  Adicionar Periód
                </button>
                <button onClick={handlePeriodicoFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
                  Exp Periód
                </button>
                <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
                  <span>Imp Periód</span>
                  <input ref={periodicoFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handlePeriodicoFileImport} />
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Conferências</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setIsAddingConferencia(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                  Adicionar Conf
                </button>
                 <button onClick={handleConferenciaFileExport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
                  Exp Conf
                </button>
                <label className="cursor-pointer px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
                  <span>Imp Conf</span>
                  <input ref={conferenciaFileInputRef} type="file" accept=".xlsx, .xls, .json" className="hidden" onChange={handleConferenciaFileImport} />
                </label>
              </div>
            </div>
          </div>
        </div>
        {periodicoError && <p className="mt-4 text-sm text-red-600">{periodicoError}</p>}
        {conferenciaError && <p className="mt-4 text-sm text-red-600">{conferenciaError}</p>}
      </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-yellow-500/30 dark:border-yellow-400/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Backup e Limpeza de Dados</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Exporte todos os dados para um backup, restaure a partir de um arquivo, ou limpe a base de dados.
            </p>
             <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              <strong>Atenção:</strong> Ações de restauração e limpeza são irreversíveis e podem causar perda de dados. Faça um backup antes de continuar.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleBackup} 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Fazer Backup</span>
            </button>
            <button 
              onClick={() => {
                // Reseta o valor do input antes de clicar para garantir que o evento onChange dispare
                // mesmo se o usuário selecionar o mesmo arquivo novamente.
                if (restoreFileInputRef.current) {
                  restoreFileInputRef.current.value = '';
                  restoreFileInputRef.current.click();
                }
              }} 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>Restaurar Backup</span>
            </button>
            <input
              ref={restoreFileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestore}
            />
            <button 
              onClick={handleClearData} 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-500 font-semibold rounded-lg shadow-sm hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Limpar Dados</span>
            </button>
          </div>
        </div>
      </div>
      
       {isAddingGraduate && (
        <DataForm
            onSave={handleAddGraduate}
            onClose={() => setIsAddingGraduate(false)}
        />
      )}
      {isAddingDocente && (
        <DocenteForm
            onSave={handleAddDocente}
            onClose={() => setIsAddingDocente(false)}
            existingDocenteNames={uniqueDocenteNames}
        />
      )}
      {isAddingProjeto && (
        <ProjetoForm
            onSave={handleAddProjeto}
            onClose={() => setIsAddingProjeto(false)}
        />
      )}
      {isAddingTurma && (
        <TurmaForm
            onSave={handleAddTurma}
            onClose={() => setIsAddingTurma(false)}
        />
      )}
      {isAddingAlunoRegular && (
        <AlunoRegularForm
            onSave={handleAddAlunoRegular}
            onClose={() => setIsAddingAlunoRegular(false)}
        />
      )}
      {isAddingAlunoEspecial && (
        <AlunoEspecialForm
          onSave={handleAddAlunoEspecial}
          onClose={() => setIsAddingAlunoEspecial(false)}
        />
      )}
      {isAddingPeriodico && (
        <PeriodicoForm
          onSave={handleAddPeriodico}
          onClose={() => setIsAddingPeriodico(false)}
        />
      )}
      {isAddingConferencia && (
        <ConferenciaForm
          onSave={handleAddConferencia}
          onClose={() => setIsAddingConferencia(false)}
        />
      )}
    </div>
  );
};

export default DataManagement;
