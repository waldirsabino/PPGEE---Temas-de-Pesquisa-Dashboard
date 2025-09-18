
export enum Course {
  MESTRADO = 'Mestrado',
  DOUTORADO = 'Doutorado',
}

export enum Status {
  DEFENDIDO = 'Defendido',
  CURSANDO = 'Cursando',
}

export interface Graduate {
  id: string;
  nome: string;
  anoIngresso: string; // ex: 'dd/mm/aaaa'
  anoDefesa?: string; // ex: 'dd/mm/aaaa'
  orientador: string;
  tituloDefesa: string;
  curso: Course;
  status: Status;
  cursandoDoutorado: boolean;
  trabalhando?: string; // Company name or place
  trabalhandoOutroEstado: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Administrador' | 'Visualizador';
}

export interface Docente {
  id:string;
  nome: string; // Coluna "Docente"
  email?: string;
  fone?: string;
  categoria: string; // Coluna "Categoria"
  ano: number; // Coluna "Ano"
  bolsaPQDT: boolean; // Coluna "Bolsa PQ-DT"
  dedicacaoExclusivaPPG: boolean; // Coluna "Dedicação Exclusiva ao PPG"
  lecionouDisciplinaQuadrienio: boolean; // Coluna "Lecionou 1 disciplina no quadriênio"
  participouPublicacaoQuadrienio: boolean; // Coluna "Participou 1 publicação em periódico no quadrienio"
  teveOrientacaoConcluidaQuadrienio: boolean; // Coluna "Teve 1 orientação concluida no quadrienio"
}

export interface Projeto {
  id: string;
  titulo: string;
  natureza: string;
  coordenador: string;
  financiador: string;
  colaboracaoNaoAcademica: string;
  resumo: string;
  valorFinanciado: number;
  atuacao: 'Coordenador' | 'Membro';
  alunosMestradoEnvolvidos: number;
  alunosDoutoradoEnvolvidos: number;
  anoInicio: number;
  anoFim?: number;
}

export interface Turma {
  id: string;
  ano: number;
  periodo: string;
  codDisciplina: string;
  disciplina: string;
  siglaDisciplina: string;
  situacao: string;
  docente: string;
  vagasOferecidas: number;
  qtdMatriculado: number;
  qtdAprovados: number;
  qtdReprovadoNota: number;
  qtdReprovadoFreq: number;
  curso: Course;
  categoria: string;
}

export interface AlunoRegular {
  id: string;
  matricula: string;
  aluno: string;
  ingresso: string; // 'dd/mm/aaaa'
  situacao: string;
  orientador: string;
  coOrientador?: string;
  proficiencia?: string;
  qualificacao?: string; // 'dd/mm/aaaa'
  defesa?: string; // 'dd/mm/aaaa'
  bolsista?: string;
  curso: Course;
  email?: string;
  fone?: string;
  informacoesExtras?: string;
}

export interface AlunoEspecial {
  id: string;
  matricula: string;
  aluno: string;
  ano: number;
  periodo: string;
  codDisciplina: string;
  disciplina: string;
  situacao: 'Aprovado' | 'Reprovado por Nota' | 'Reprovado por Frequência' | 'Cursando';
  email?: string;
  fone?: string;
}

export interface Periodico {
  id: string;
  titulo: string;
  periodico: string;
  autor: string;
  ano: number;
  discenteEgresso: boolean;
  docentePPGEE: boolean;
  categoria: string;
}

export interface Conferencia {
  id: string;
  titulo: string;
  autor: string;
  ano: number;
  categoria: string;
}