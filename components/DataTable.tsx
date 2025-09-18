
import React, { useState, useMemo, useCallback } from 'react';
import { Graduate } from '../types';
import DataForm from './DataForm';

declare const XLSX: any;
declare const Papa: any;

interface DataTableProps {
  data: Graduate[];
  onUpdate: (graduate: Graduate) => void;
  onDelete: (id: string) => void;
}

type SortKey = keyof Graduate;

const DataTable: React.FC<DataTableProps> = ({ data, onUpdate, onDelete }) => {
  const [sortKey, setSortKey] = useState<SortKey>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [editingGraduate, setEditingGraduate] = useState<Graduate | null>(null);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Egressos');
    XLSX.writeFile(workbook, 'egressos.xlsx');
  }, [data]);

  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'egressos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);
  
  const handleUpdate = (graduate: Graduate) => {
    onUpdate(graduate);
    setEditingGraduate(null);
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'curso', label: 'Curso' },
    { key: 'anoIngresso', label: 'Data Ingresso' },
    { key: 'anoDefesa', label: 'Data Defesa' },
    { key: 'status', label: 'Status' },
    { key: 'orientador', label: 'Orientador' },
    { key: 'trabalhando', label: 'Local de Trabalho' },
  ];

  const totalItems = data.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
    <div className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lista de Egressos</h3>
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
                <th key={header.key} scope="col" onClick={() => handleSort(header.key)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">
                  {header.label} {sortKey === header.key && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map(g => (
              <tr key={g.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{g.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{g.curso}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{g.anoIngresso}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{g.anoDefesa || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.status === 'Defendido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {g.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{g.orientador}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{g.trabalhando || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setEditingGraduate(g)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">Editar</button>
                  <button onClick={() => onDelete(g.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Excluir</button>
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
    {editingGraduate && (
        <DataForm
            graduate={editingGraduate}
            onSave={handleUpdate}
            onClose={() => setEditingGraduate(null)}
        />
    )}
    </>
  );
};

export default DataTable;