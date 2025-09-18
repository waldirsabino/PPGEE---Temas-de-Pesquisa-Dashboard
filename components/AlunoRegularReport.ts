import { AlunoRegular, Course } from '../types';

declare const jspdf: any;

interface Filters {
  startYear: string;
  endYear: string;
  course: string;
  status: string;
  orientador: string;
  bolsista: string;
  durationType: 'none' | 'gt' | 'lt';
  durationValue: string;
}

const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
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

const calculateDuration = (aluno: AlunoRegular): string => {
  const { ingresso, situacao, defesa } = aluno;
  
  const ingressoDate = parseDate(ingresso);
  if (!ingressoDate) return '-';

  let endDate: Date | null = null;
  
  if (situacao?.toLowerCase() === 'sem evasão') {
      endDate = new Date();
  } else if (situacao?.toLowerCase() === 'defendido') {
      endDate = parseDate(defesa);
  } else { // Handles "Desligado" and any other situation
      return '-';
  }
  
  if (!endDate) return '-';
  
  // Calculate difference in milliseconds and convert to months
  const diffTime = Math.abs(endDate.getTime() - ingressoDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const months = diffDays / 30.4375; // Average days in a month (365.25 / 12)

  return `${months.toFixed(1)} meses`;
};

export const generateAlunoRegularPDF = (data: AlunoRegular[], filters: Filters) => {
  if (!data || data.length === 0) {
    alert("Não há dados para gerar o relatório.");
    return;
  }

  const doc = new jspdf.jsPDF({ orientation: 'landscape' });
  const tableColumn = ["Aluno", "Curso", "Ingresso", "Situação", "Orientador", "Duração", "Bolsista", "Proficiencia", "Qualificação"];
  
  const date = new Date();
  const dateStr = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;

  const drawFooter = (pageData: any) => {
    doc.setFontSize(10);
    doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageData.settings.margin.left, doc.internal.pageSize.height - 10);
  };

  const processTableForOrientador = (orientador: string, alunosDoOrientador: AlunoRegular[], isFirstPage: boolean) => {
    if (!isFirstPage) {
      doc.addPage();
    }
  
    doc.setFontSize(18);
    doc.text("Relatório de Alunos Regulares", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dateStr}`, 14, 29);
    
    const filterDescriptions = [];
    filterDescriptions.push(`Orientador: ${orientador}`);

    if (filters.startYear || filters.endYear) {
        const start = filters.startYear || 'Início';
        const end = filters.endYear || 'Fim';
        filterDescriptions.push(`Período (Ingresso): ${start} a ${end}`);
    }
    
    if (filters.course && filters.course !== 'todos') {
        filterDescriptions.push(`Curso: ${filters.course}`);
    }
    
    if (filters.status && filters.status !== 'todos') {
        filterDescriptions.push(`Situação: ${filters.status}`);
    }

    if (filters.bolsista && filters.bolsista !== 'todos') {
        const bolsistaText = filters.bolsista === 'sim' ? 'Sim' : 'Não';
        filterDescriptions.push(`Bolsista: ${bolsistaText}`);
    }
    
    if (filters.durationType !== 'none' && filters.durationValue) {
        const typeText = filters.durationType === 'gt' ? 'Maior que' : 'Menor que';
        filterDescriptions.push(`Duração: ${typeText} ${filters.durationValue} meses`);
    }

    const filtersText = `Filtros Aplicados: ${filterDescriptions.join(' | ')}`;
    doc.setFontSize(9);
    doc.text(filtersText, 14, 36);
  
    const tableRowsForOrientador: any[][] = [];
    
    // Ordena alunos: primeiro por curso, depois por data de ingresso
    const sortedAlunos = [...alunosDoOrientador].sort((a, b) => {
      // 1. Sort by course
      const cursoComparison = a.curso.localeCompare(b.curso);
      if (cursoComparison !== 0) {
        return cursoComparison;
      }

      // 2. If course is the same, sort by ingresso date
      const dateA = parseDate(a.ingresso);
      const dateB = parseDate(b.ingresso);

      if (dateA && dateB) {
        const dateComparison = dateA.getTime() - dateB.getTime();
        if (dateComparison !== 0) {
          return dateComparison; // Mais antigo primeiro
        }
      } else if (dateA) {
        return -1; // a comes first if it has a date and b doesn't
      } else if (dateB) {
        return 1; // b comes first if it has a date and a doesn't
      }

      // 3. Fallback to student name if dates are the same or invalid
      return a.aluno.localeCompare(b.aluno);
    });

    let mestradoCount = 0;
    let doutoradoCount = 0;
  
    sortedAlunos.forEach(aluno => {
        if (aluno.curso === Course.MESTRADO) mestradoCount++;
        else if (aluno.curso === Course.DOUTORADO) doutoradoCount++;
        
        tableRowsForOrientador.push([
            aluno.aluno,
            aluno.curso,
            aluno.ingresso,
            aluno.situacao,
            aluno.orientador || 'N/A',
            calculateDuration(aluno),
            aluno.bolsista || '-',
            aluno.proficiencia || '-',
            aluno.qualificacao || '-'
        ]);
    });
    
    tableRowsForOrientador.push([{
        content: `Total Mestrado: ${mestradoCount}   |   Total Doutorado: ${doutoradoCount}`,
        colSpan: 9,
        styles: { halign: 'right', fontStyle: 'italic', fontSize: 9, fillColor: [245, 245, 245] }
    }]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRowsForOrientador,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [34, 107, 148] },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Aluno
        1: { cellWidth: 25 },  // Curso
        2: { cellWidth: 22 },  // Ingresso
        3: { cellWidth: 25 },  // Situação
        4: { cellWidth: 'auto' }, // Orientador
        5: { cellWidth: 22 },  // Duração
        6: { cellWidth: 20 },  // Bolsista
        7: { cellWidth: 25 },  // Proficiencia
        8: { cellWidth: 25 },  // Qualificação
      },
      didDrawPage: drawFooter,
    });
  }

  if (filters.orientador === 'todos') {
    const groupedData: Record<string, AlunoRegular[]> = data.reduce((acc, aluno) => {
        const orientador = aluno.orientador || 'Sem Orientador';
        if (!acc[orientador]) {
            acc[orientador] = [];
        }
        acc[orientador].push(aluno);
        return acc;
    }, {} as Record<string, AlunoRegular[]>);

    const sortedOrientadores = Object.keys(groupedData).sort((a, b) => {
        if (a === 'Sem Orientador' && b !== 'Sem Orientador') {
            return 1; // Move 'Sem Orientador' to the end
        }
        if (a !== 'Sem Orientador' && b === 'Sem Orientador') {
            return -1; // Keep 'b' at the end
        }
        return a.localeCompare(b); // Alphabetical sort for others
    });

    sortedOrientadores.forEach((orientador, index) => {
        processTableForOrientador(orientador, groupedData[orientador], index === 0);
    });
  } else {
    processTableForOrientador(filters.orientador, data, true);
  }

  doc.save(`relatorio_alunos_regulares_${date.toISOString().slice(0,10)}.pdf`);
};