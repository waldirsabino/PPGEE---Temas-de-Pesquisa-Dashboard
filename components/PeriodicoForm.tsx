
import React, { useState, useEffect } from 'react';
import { Periodico } from '../types';

interface PeriodicoFormProps {
  periodico?: Periodico | null;
  onSave: (periodico: Periodico) => void;
  onClose: () => void;
}

const PeriodicoForm: React.FC<PeriodicoFormProps> = ({ periodico, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Periodico, 'id'>>({
    titulo: '',
    periodico: '',
    autor: '',
    ano: new Date().getFullYear(),
    discenteEgresso: false,
    docentePPGEE: false,
    categoria: '',
  });

  useEffect(() => {
    if (periodico) {
      setFormData({ ...periodico });
    }
  }, [periodico]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: periodico?.id || new Date().toISOString(),
      ...formData,
      ano: Number(formData.ano),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{periodico ? 'Editar Periódico' : 'Adicionar Periódico'}</h2>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Periódico</label>
                  <input type="text" name="periodico" value={formData.periodico} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Autor</label>
                  <input type="text" name="autor" value={formData.autor} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                  <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                  <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Vínculos de Autoria</legend>
            <div className="space-y-4 mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="discenteEgresso" name="discenteEgresso" type="checkbox" checked={formData.discenteEgresso} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="discenteEgresso" className="font-medium text-gray-700 dark:text-gray-300">Discente ou egresso (s/n)</label>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="docentePPGEE" name="docentePPGEE" type="checkbox" checked={formData.docentePPGEE} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="docentePPGEE" className="font-medium text-gray-700 dark:text-gray-300">Docente do PPGEE (s/n)</label>
                </div>
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

export default PeriodicoForm;
