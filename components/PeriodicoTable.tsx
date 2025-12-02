import React, { useState, useMemo, useCallback } from 'react';
import { Periodico } from '../types';
import PeriodicoForm from './PeriodicoForm';

declare const XLSX: any;
declare const Papa: any;

interface PeriodicoTableProps {
  data: Periodico[];
  onUpdate: (periodico: Periodico) => void;
  onDelete: (id: string) => void;
  userRole: 'Administrador' | 'Visualizador';
}

const PeriodicoTable: React.FC<PeriodicoTableProps> = ({ data, onUpdate, onDelete, userRole }) => {
  const [sortKey, setSortKey] = useState<keyof Periodico>('ano');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [editingItem, setEditingItem] = useState<Periodico | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
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

  const handleSort = useCallback((key: keyof Periodico) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  }, [sortKey]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Periodicos');
    XLSX.writeFile(workbook, 'periodicos.xlsx');
  }, [data]);

  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'periodicos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);
  
  const handleUpdate = (item: Periodico) => {
    onUpdate(item);
    setEditingItem(null);
  };

  const headers = [
    { key: 'titulo', label: 'Título', className: 'w-2/5' },
    { key: 'periodico', label: 'Periódico', className: 'w-1/5' },
    { key: 'autor', label: 'Autor', className: 'w-1/5' },
    { key: 'ano', label: 'Ano' },
    { key: 'discenteEgresso', label: 'Discente/Egresso' },
    { key: 'docentePPGEE', label: 'Docente PPGEE' },
    { key: 'categoria', label: 'Categoria' },
  ];

  const renderBoolean = (value: boolean) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value ? 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-200'}`}>
      {value ? 's' : 'n'}
    </span>
  );

  const totalItems = data.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
    <div className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lista de Periódicos</h3>
            <div className="space-x-2">
                <button onClick={exportToCSV} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Exportar CSV</button>
                <button onClick={exportToExcel} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Exportar Excel</button>
            </div>
        </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-inner">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headers.map(header => (
                <th key={header.key} scope="col" onClick={() => handleSort(header.key as keyof Periodico)} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${header.className || ''}`}>
                  {header.label} {sortKey === header.key && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              ))}
              {userRole === 'Administrador' && (
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white">{item.titulo}</td>
                <td className="px-4 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{item.periodico}</td>
                <td className="px-4 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{item.autor}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.ano}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">{renderBoolean(item.discenteEgresso)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">{renderBoolean(item.docentePPGEE)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.categoria}</td>
                {userRole === 'Administrador' && (
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setEditingItem(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">Editar</button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    {editingItem && (
        <PeriodicoForm
            periodico={editingItem}
            onSave={handleUpdate}
            onClose={() => setEditingItem(null)}
        />
    )}
    </>
  );
};

export default PeriodicoTable;