import React, { useState, useMemo, useCallback } from 'react';
import { Projeto } from '../types';
import ProjetoForm from './ProjetoForm';

declare const XLSX: any;
declare const Papa: any;

interface ProjetoTableProps {
  data: Projeto[];
  onUpdate: (projeto: Projeto) => void;
  onDelete: (id: string) => void;
}

type SortKey = keyof Projeto;

const ProjetoTable: React.FC<ProjetoTableProps> = ({ data, onUpdate, onDelete }) => {
  const [sortKey, setSortKey] = useState<SortKey>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projetos');
    XLSX.writeFile(workbook, 'projetos.xlsx');
  }, [data]);

  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'projetos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const handleUpdate = (projeto: Projeto) => {
    onUpdate(projeto);
    setEditingProjeto(null);
  };

  const headers: { key: SortKey; label: string, className?: string }[] = [
    { key: 'titulo', label: 'Título do Projeto', className: 'w-1/4' },
    { key: 'natureza', label: 'Natureza' },
    { key: 'coordenador', label: 'Coordenador' },
    { key: 'financiador', label: 'Financiador' },
    { key: 'colaboracaoNaoAcademica', label: 'Colab. Não Acadêmica' },
    { key: 'valorFinanciado', label: 'Valor Financiado' },
    { key: 'atuacao', label: 'Atuação' },
    { key: 'alunosMestradoEnvolvidos', label: 'Mestrandos' },
    { key: 'alunosDoutoradoEnvolvidos', label: 'Doutorandos' },
    { key: 'anoInicio', label: 'Ano Início' },
    { key: 'anoFim', label: 'Ano Fim' },
  ];
  
  const totalItems = data.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
    <div className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lista de Projetos</h3>
            <div className="space-x-2">
                <button onClick={exportToCSV} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Exportar CSV</button>
                <button onClick={exportToExcel} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Exportar Excel</button>
            </div>
        </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headers.map(header => (
                <th key={header.key} scope="col" onClick={() => handleSort(header.key)} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${header.className || ''}`}>
                  {header.label} {sortKey === header.key && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              ))}
               <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map(p => (
              <tr key={p.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white">{p.titulo}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.natureza || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.coordenador}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.financiador || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.colaboracaoNaoAcademica}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.valorFinanciado > 0 ? p.valorFinanciado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.atuacao}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{p.alunosMestradoEnvolvidos}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{p.alunosDoutoradoEnvolvidos}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.anoInicio}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.anoFim || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setEditingProjeto(p)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">Editar</button>
                  <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Excluir</button>
                </td>
              </tr>
            ))}
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
    {editingProjeto && (
        <ProjetoForm
            projeto={editingProjeto}
            onSave={handleUpdate}
            onClose={() => setEditingProjeto(null)}
        />
    )}
    </>
  );
};

export default ProjetoTable;