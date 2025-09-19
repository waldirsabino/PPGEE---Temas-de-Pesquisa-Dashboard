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

const createRowData = (aluno: AlunoRegular) => {
    const durationMonths = calculateDurationInMonths(aluno);
    const durationText = durationMonths !== null ? `${durationMonths.toFixed(1)} meses` : '-';

    const isDesligado = aluno.situacao === 'Desligado';
    const isMestrado = aluno.curso === Course.MESTRADO;
    const isDoutorado = aluno.curso === Course.DOUTORADO;
    
    // --- Alert Logic ---
    let orientadorCell: any = aluno.orientador || 'N/A';
    if (!isDesligado && durationMonths !== null && durationMonths > 6.0 && (!aluno.orientador || aluno.orientador === 'N/A')) {
        orientadorCell = { content: aluno.orientador || 'N/A', styles: { fillColor: [254, 249, 195] } };
    }

    const proficienciaText = aluno.proficiencia != null ? aluno.proficiencia.toFixed(2) : '-';
    let proficienciaCell: any = proficienciaText;
    if (!isDesligado && aluno.proficiencia == null) {
        proficienciaCell = { content: '-', styles: { fillColor: [254, 249, 195] } };
    }
        
    let qualificacaoCell: any = aluno.qualificacao || '-';
    let isQualAlert = false;
    if (!isDesligado && durationMonths !== null && !aluno.qualificacao) {
      if ((isMestrado && durationMonths > 17.0) || (isDoutorado && durationMonths > 22.0)) {
        isQualAlert = true;
      }
    }
    if (isQualAlert) {
        qualificacaoCell = { content: aluno.qualificacao || '-', styles: { fillColor: [254, 249, 195] } };
    }
    
    // --- Duration Coloring Logic ---
    // FIX: Expanded cell style type to be compatible with summary row styles, resolving a TypeScript error where `halign` was not a known property.
    const durationCell: { content: string; styles: { 
        fillColor?: number[];
        halign?: 'left' | 'center' | 'right' | 'justify';
        fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
        fontSize?: number;
    } } = {
        content: durationText,
        styles: {}
    };
    if (durationMonths !== null && !isDesligado) {
        const isMestradoQualPendente = isMestrado && durationMonths > 17.0 && !aluno.qualificacao;
        const isMestradoDefesaPendente = isMestrado && durationMonths > 22.0;

        const isDoutoradoQualPendente = isDoutorado && durationMonths > 22.0 && !aluno.qualificacao;
        const isDoutoradoDefesaPendente = isDoutorado && durationMonths > 46.0;
        
        const isDoutoradoQualificadoOk = isDoutorado && durationMonths > 22.0 && !!aluno.qualificacao;

        if (isMestradoQualPendente || isMestradoDefesaPendente || isDoutoradoQualPendente || isDoutoradoDefesaPendente) {
            durationCell.styles.fillColor = [254, 226, 226]; // red-100
        } else if (isDoutoradoQualificadoOk) {
            durationCell.styles.fillColor = [220, 252, 231]; // green-100
        } else if (isMestrado) { // Mestrado OK
            durationCell.styles.fillColor = [220, 252, 231]; // green-100
        }
    }
            
    return [
        aluno.aluno,
        aluno.curso,
        aluno.ingresso,
        aluno.situacao,
        orientadorCell,
        durationCell,
        aluno.bolsista || '-',
        proficienciaCell,
        qualificacaoCell
    ];
};

const drawHeaderAndFilters = (doc: any, filters: Filters, orientador?: string) => {
    const date = new Date();
    const dateStr = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;

    doc.setFontSize(18);
    doc.text("Relatório de Alunos Regulares", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dateStr}`, 14, 29);
    
    const filterDescriptions = [];
    if(orientador) {
        filterDescriptions.push(`Orientador: ${orientador}`);
    } else if (filters.orientador && filters.orientador !== 'todos') {
         filterDescriptions.push(`Orientador: ${filters.orientador}`);
    }


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
};


export const generateAlunoRegularPDF = (data: AlunoRegular[], filters: Filters, organization: 'by_orientador' | 'as_ui') => {
  if (!data || data.length === 0) {
    alert("Não há dados para gerar o relatório.");
    return;
  }

  const doc = new jspdf.jsPDF({ orientation: 'landscape' });
  const tableColumn = ["Aluno", "Curso", "Ingresso", "Situação", "Orientador", "Duração", "Bolsista", "Proficiência Nota", "Qualificação"];
  
  const drawFooter = (pageData: any) => {
    doc.setFontSize(10);
    doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageData.settings.margin.left, doc.internal.pageSize.height - 10);
  };

  const tableOptions = {
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
  };


  if (organization === 'by_orientador') {
    const groupedData: Record<string, AlunoRegular[]> = data.reduce((acc, aluno) => {
        const orientador = aluno.orientador || 'Sem Orientador';
        if (!acc[orientador]) {
            acc[orientador] = [];
        }
        acc[orientador].push(aluno);
        return acc;
    }, {} as Record<string, AlunoRegular[]>);

    const sortedOrientadores = Object.keys(groupedData).sort((a, b) => {
        if (a === 'Sem Orientador') return 1;
        if (b === 'Sem Orientador') return -1;
        return a.localeCompare(b);
    });

    sortedOrientadores.forEach((orientador, index) => {
        if (index > 0) doc.addPage();
        
        drawHeaderAndFilters(doc, filters, orientador);
        
        const alunosDoOrientador = groupedData[orientador];
        const tableRows = alunosDoOrientador.map(aluno => createRowData(aluno));
        
        let mestradoCount = 0;
        let doutoradoCount = 0;
        alunosDoOrientador.forEach(aluno => {
            if (aluno.curso === Course.MESTRADO) mestradoCount++;
            else if (aluno.curso === Course.DOUTORADO) doutoradoCount++;
        });

        tableRows.push([{
            content: `Total Mestrado: ${mestradoCount}   |   Total Doutorado: ${doutoradoCount}`,
            colSpan: 9,
            styles: { halign: 'right', fontStyle: 'italic', fontSize: 9, fillColor: [245, 245, 245] }
        }]);

        (doc as any).autoTable({
            ...tableOptions,
            head: [tableColumn],
            body: tableRows,
            startY: 42,
        });
    });
  } else { // 'as_ui'
    drawHeaderAndFilters(doc, filters);

    const tableRows = data.map(aluno => createRowData(aluno));
    
    let mestradoCount = 0;
    let doutoradoCount = 0;
    data.forEach(aluno => {
        if (aluno.curso === Course.MESTRADO) mestradoCount++;
        else if (aluno.curso === Course.DOUTORADO) doutoradoCount++;
    });

    tableRows.push([{
        content: `Total Mestrado: ${mestradoCount}   |   Total Doutorado: ${doutoradoCount}`,
        colSpan: 9,
        styles: { halign: 'right', fontStyle: 'italic', fontSize: 9, fillColor: [245, 245, 245] }
    }]);

    (doc as any).autoTable({
      ...tableOptions,
      head: [tableColumn],
      body: tableRows,
      startY: 42,
    });
  }

  const date = new Date();
  doc.save(`relatorio_alunos_regulares_${date.toISOString().slice(0,10)}.pdf`);
};