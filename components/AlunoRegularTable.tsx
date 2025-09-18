import React, { useState, useMemo, useCallback } from 'react';
import { AlunoRegular, Course } from '../types';
import AlunoRegularForm from './AlunoRegularForm';
import { generateAlunoRegularPDF } from './AlunoRegularReport';
import EnvelopeIcon from './icons/EnvelopeIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';


declare const XLSX: any;
declare const Papa: any;

interface AlunoRegularTableProps {
  data: AlunoRegular[];
  onUpdate: (aluno: AlunoRegular) => void;
  onDelete: (id: string) => void;
  filters: any;
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

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Defendido':
      return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200';
    case 'Desligado':
      return 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-200';
    case 'Sem Evasão':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
  }
};


const AlunoRegularTable: React.FC<AlunoRegularTableProps> = ({ data, onUpdate, onDelete, filters }) => {
  const [sortKey, setSortKey] = useState<keyof AlunoRegular>('ingresso');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [editingAluno, setEditingAluno] = useState<AlunoRegular | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [copyToSuccess, setCopyToSuccess] = useState('');


  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const isDateKey = ['ingresso', 'qualificacao', 'defesa'].includes(sortKey);

      if (isDateKey) {
        const dateA = parseDate(a[sortKey as 'ingresso' | 'qualificacao' | 'defesa']);
        const dateB = parseDate(b[sortKey as 'ingresso' | 'qualificacao' | 'defesa']);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        const timeA = dateA.getTime();
        const timeB = dateB.getTime();

        if (timeA < timeB) return sortOrder === 'asc' ? -1 : 1;
        if (timeA > timeB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }

      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (String(aValue).localeCompare(String(bValue)) < 0) return sortOrder === 'asc' ? -1 : 1;
      if (String(aValue).localeCompare(String(bValue)) > 0) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = useCallback((key: keyof AlunoRegular) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }, [sortKey]);

  const exportToExcel = useCallback(() => {
    const exportData = data.map(aluno => {
        const durationMonths = calculateDurationInMonths(aluno);
        return {
        ...aluno,
        'DURAÇÃO': durationMonths !== null ? `${durationMonths.toFixed(1)} meses` : '-'
    }});
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos Regulares');
    XLSX.writeFile(workbook, 'alunos_regulares.xlsx');
  }, [data]);

  const exportToCSV = useCallback(() => {
    const exportData = data.map(aluno => {
        const durationMonths = calculateDurationInMonths(aluno);
        return {
        ...aluno,
        'DURAÇÃO': durationMonths !== null ? `${durationMonths.toFixed(1)} meses` : '-'
    }});
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'alunos_regulares.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);
  
  const handleUpdate = (aluno: AlunoRegular) => {
    onUpdate(aluno);
    setEditingAluno(null);
  };
  
  const handlePrepareEmail = useCallback(() => {
    if (!data || data.length === 0) {
        alert("Não há alunos na lista para preparar o e-mail.");
        return;
    }

    const emails = data.map(aluno => aluno.email).filter(Boolean).join(', ');
    setEmailTo(emails);

    const subject = "Acompanhamento Alunos Regulares PPGEE";
    
    const styles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
        thead tr { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    `;
    
    const tableHeader = `
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Orientador(a)</th>
          <th>Curso</th>
          <th>Ingresso</th>
          <th>Duração</th>
          <th>Bolsista</th>
          <th>Proficiência</th>
          <th>Qualificação</th>
        </tr>
      </thead>
    `;

    const tableBody = data.map(aluno => {
        const durationMonths = calculateDurationInMonths(aluno);
        const durationText = durationMonths !== null ? `${durationMonths.toFixed(1)} meses` : '-';
        return `
      <tr>
        <td>${aluno.aluno || 'N/A'}</td>
        <td>${aluno.orientador || 'N/A'}</td>
        <td>${aluno.curso || 'N/A'}</td>
        <td>${aluno.ingresso || 'N/A'}</td>
        <td>${durationText}</td>
        <td>${aluno.bolsista || 'Não'}</td>
        <td>${aluno.proficiencia || 'Pendente'}</td>
        <td>${aluno.qualificacao || 'Pendente'}</td>
      </tr>
    `}).join('');

    const htmlBody = `
      <html>
        <head>${styles}</head>
        <body>
          <p>Olá,</p>
          <p>Segue a lista de alunos regulares para acompanhamento, com base nos filtros aplicados no painel.</p>
          <br>
          <table>
            ${tableHeader}
            <tbody>
              ${tableBody}
            </tbody>
          </table>
          <br>
          <p>Atenciosamente,<br>Coordenação PPGEE</p>
        </body>
      </html>
    `;
    
    setEmailSubject(subject);
    setEmailBody(htmlBody);
    setIsEmailModalOpen(true);
  }, [data]);
  
  const handleCopyToClipboard = () => {
    try {
        const blob = new Blob([emailBody], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
        navigator.clipboard.write([clipboardItem]).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Falha ao copiar');
            console.error('Could not copy rich text: ', err);
            navigator.clipboard.writeText(emailBody);
        });
    } catch (e) {
        navigator.clipboard.writeText(emailBody).then(() => {
            setCopySuccess('Copiado como HTML!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
        console.error('ClipboardItem API not supported, copying as plain text HTML.', e);
    }
  };

  const handleCopyTo = () => {
    navigator.clipboard.writeText(emailTo).then(() => {
        setCopyToSuccess('Copiado!');
        setTimeout(() => setCopyToSuccess(''), 2000);
    }, (err) => {
        setCopyToSuccess('Falha ao copiar');
        console.error('Could not copy text: ', err);
    });
  };

  const handleOpenMailClient = () => {
    const mailtoLink = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}`;
    if (mailtoLink.length > 2000) {
        alert("A lista de e-mails é muito longa para abrir diretamente no cliente de e-mail. Por favor, use o botão 'Copiar' e cole o conteúdo manualmente.");
        return;
    }
    window.location.href = mailtoLink;
  };

  const headers = [
    { key: 'matricula', label: 'Matrícula' },
    { key: 'aluno', label: 'Aluno', className: 'w-1/5' },
    { key: 'ingresso', label: 'Ingresso' },
    { key: 'situacao', label: 'Situação' },
    { key: 'orientador', label: 'Orientador(a)' },
    { key: 'coOrientador', label: 'Co Orientador(a)' },
    { key: null, label: 'Duração' }, // Not sortable
    { key: 'proficiencia', label: 'Proficiência' },
    { key: 'qualificacao', label: 'Qualificação' },
    { key: 'defesa', label: 'Defesa' },
    { key: 'bolsista', label: 'Bolsista' },
    { key: 'curso', label: 'Curso' },
  ];

  const totalItems = data.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
    <div className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lista de Alunos Regulares</h3>
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={handlePrepareEmail} 
                    className="inline-flex items-center gap-2 px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
                >
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>Preparar E-mail</span>
                </button>
                <button onClick={() => generateAlunoRegularPDF(data, filters)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Gerar Relatório PDF</button>
                <button onClick={exportToCSV} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Exportar CSV</button>
                <button onClick={exportToExcel} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Exportar Excel</button>
            </div>
        </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headers.map(header => (
                <th 
                  key={header.key || header.label} 
                  scope="col" 
                  onClick={() => header.key && handleSort(header.key as keyof AlunoRegular)} 
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${header.key ? 'cursor-pointer' : ''} ${header.className || ''}`}
                >
                  {header.label} {header.key && sortKey === header.key && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              ))}
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map(a => {
              const durationMonths = calculateDurationInMonths(a);
              const durationText = durationMonths !== null ? `${durationMonths.toFixed(1)} meses` : '-';
              
              let durationBadgeClass = '';
              if (durationMonths !== null) {
                  if (a.curso === Course.MESTRADO) {
                      if (durationMonths > 22.0) {
                          durationBadgeClass = 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-200';
                      } else if (durationMonths > 17.0 && a.qualificacao) {
                          durationBadgeClass = 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200';
                      }
                  } else if (a.curso === Course.DOUTORADO) {
                      durationBadgeClass = 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200';
                  }
              }

              return (
                <tr key={a.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">{a.matricula}</td>
                  <td className="px-3 py-4 whitespace-normal text-xs font-medium text-gray-900 dark:text-white">{a.aluno}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">{a.ingresso}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                      <span className={`px-2 inline-flex leading-5 font-semibold rounded-full ${getStatusBadgeClass(a.situacao)}`}>
                          {a.situacao}
                      </span>
                  </td>
                  <td className="px-3 py-4 whitespace-normal text-xs text-gray-500 dark:text-gray-300">
                     <div className="flex items-center gap-1">
                        {a.curso === Course.MESTRADO && durationMonths !== null && durationMonths > 6.0 && !a.orientador ? (
                          <span title="Orientador pendente após 6 meses">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                          </span>
                        ) : null}
                        <span>{a.orientador || '-'}</span>
                      </div>
                  </td>
                  <td className="px-3 py-4 whitespace-normal text-xs text-gray-500 dark:text-gray-300">{a.coOrientador || '-'}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {durationBadgeClass ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${durationBadgeClass}`}>
                        {durationText}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-300">{durationText}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                     <div className="flex items-center gap-1">
                      {a.curso === Course.MESTRADO && !a.proficiencia ? (
                        // FIX: Wrapped ExclamationTriangleIcon in a span to provide a tooltip, as the 'title' prop is not valid on the component.
                        <span title="Proficiência pendente">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                        </span>
                      ) : null}
                      <span>{a.proficiencia || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {a.curso === Course.MESTRADO && durationMonths !== null && durationMonths > 17.0 && !a.qualificacao ? (
                        // FIX: Wrapped ExclamationTriangleIcon in a span to provide a tooltip, as the 'title' prop is not valid on the component.
                        <span title="Qualificação pendente e prazo se esgotando">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                        </span>
                      ) : null}
                      <span>{a.qualificacao || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">{a.defesa || '-'}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">{a.bolsista || '-'}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">{a.curso}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button onClick={() => setEditingAluno(a)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">Editar</button>
                    <button onClick={() => onDelete(a.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Excluir</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between py-3">
        <div className="text-sm text-gray-700 dark:text-gray-400">
            Mostrando {startIndex} a {endIndex} de {totalItems} resultados
        </div>
        <div className="flex-1 flex justify-end">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50">Próximo</button>
        </div>
      </div>
    </div>
    {editingAluno && (
        <AlunoRegularForm
            aluno={editingAluno}
            onSave={handleUpdate}
            onClose={() => setEditingAluno(null)}
        />
    )}
    {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Preparar E-mail</h2>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Para</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input type="text" readOnly value={emailTo} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-text" placeholder="Nenhum e-mail encontrado"/>
                  <button type="button" onClick={handleCopyTo} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500">
                     {copyToSuccess ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assunto</label>
                <input type="text" readOnly value={emailSubject} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Corpo do E-mail (Pré-visualização)</label>
                <div
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-4 h-96 overflow-auto bg-white dark:bg-gray-900 dark:border-gray-600"
                  dangerouslySetInnerHTML={{ __html: emailBody }}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Atenção:</strong> O botão "Abrir..." apenas preenche destinatários e assunto. Copie e cole o corpo do e-mail acima.
                </p>
                <div className="flex flex-wrap justify-end items-center gap-3">
                    {copySuccess && <span className="text-sm text-green-600 dark:text-green-400">{copySuccess}</span>}
                    <button
                        type="button"
                        onClick={handleCopyToClipboard}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                        disabled={!!copySuccess}
                    >
                        {copySuccess ? 'Copiado!' : 'Copiar Corpo do E-mail'}
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenMailClient}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Abrir no Cliente de E-mail
                    </button>
                </div>
            </div>
          </div>
        </div>
    )}
    </>
  );
};

export default AlunoRegularTable;