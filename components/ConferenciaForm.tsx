
import React, { useState, useEffect } from 'react';
import { Conferencia } from '../types';

interface ConferenciaFormProps {
  conferencia?: Conferencia | null;
  onSave: (conferencia: Conferencia) => void;
  onClose: () => void;
}

const ConferenciaForm: React.FC<ConferenciaFormProps> = ({ conferencia, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Conferencia, 'id'>>({
    titulo: '',
    autor: '',
    ano: new Date().getFullYear(),
    categoria: '',
  });

  useEffect(() => {
    if (conferencia) {
      setFormData({ ...conferencia });
    }
  }, [conferencia]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: conferencia?.id || new Date().toISOString(),
      ...formData,
      ano: Number(formData.ano),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{conferencia ? 'Editar Conferência' : 'Adicionar Conferência'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
           <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Detalhes da Publicação</legend>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                <textarea name="titulo" value={formData.titulo} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Autor</label>
                  <input type="text" name="autor" value={formData.autor} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                  <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                  <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </fieldset>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConferenciaForm;
