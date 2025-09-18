
import React, { useState, useEffect } from 'react';
import { Graduate, Course, Status } from '../types';

interface DataFormProps {
  graduate?: Graduate | null;
  onSave: (graduate: Graduate) => void;
  onClose: () => void;
}

const formatDateInput = (value: string): string => {
  const onlyNums = value.replace(/[^\d]/g, '');
  if (onlyNums.length <= 2) return onlyNums;
  if (onlyNums.length <= 4) return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2)}`;
  return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2, 4)}/${onlyNums.slice(4, 8)}`;
};

const DataForm: React.FC<DataFormProps> = ({ graduate, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Graduate, 'id'>>({
    nome: '',
    anoIngresso: '',
    anoDefesa: undefined,
    orientador: '',
    tituloDefesa: '',
    curso: Course.MESTRADO,
    status: Status.CURSANDO,
    cursandoDoutorado: false,
    trabalhando: '',
    trabalhandoOutroEstado: false,
  });

  useEffect(() => {
    if (graduate) {
      setFormData({ ...graduate });
    }
  }, [graduate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const dateFields = ['anoIngresso', 'anoDefesa'];

    if (dateFields.includes(name)) {
      setFormData(prev => ({ ...prev, [name]: formatDateInput(value) }));
    } else if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: graduate?.id || new Date().toISOString(),
      ...formData,
      // Values are already strings, no conversion needed
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{graduate ? 'Editar Egresso' : 'Adicionar Egresso'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Informações Acadêmicas</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Aluno</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orientador</label>
                <input type="text" name="orientador" value={formData.orientador} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Ingresso</label>
                <input type="text" placeholder="dd/mm/aaaa" name="anoIngresso" value={formData.anoIngresso} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required maxLength={10} pattern="\d{2}/\d{2}/\d{4}" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Defesa</label>
                <input type="text" placeholder="dd/mm/aaaa" name="anoDefesa" value={formData.anoDefesa || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" maxLength={10} pattern="\d{2}/\d{2}/\d{4}" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                <select name="curso" value={formData.curso} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                  <option value={Course.MESTRADO}>Mestrado</option>
                  <option value={Course.DOUTORADO}>Doutorado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                  <option value={Status.CURSANDO}>Cursando</option>
                  <option value={Status.DEFENDIDO}>Defendido</option>
                </select>
              </div>
            </div>
          </fieldset>
          
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Detalhes Adicionais</legend>
            <div className="space-y-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Defesa</label>
                  <textarea name="tituloDefesa" value={formData.tituloDefesa} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Onde trabalha? (Se aplicável)</label>
                  <input type="text" name="trabalhando" value={formData.trabalhando} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex items-start space-x-4">
                  <div className="flex items-center h-5">
                      <input type="checkbox" name="cursandoDoutorado" checked={formData.cursandoDoutorado} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                  </div>
                  <div className="text-sm">
                      <label className="font-medium text-gray-700 dark:text-gray-300">Está cursando doutorado?</label>
                  </div>
              </div>
              <div className="flex items-start space-x-4">
                  <div className="flex items-center h-5">
                      <input type="checkbox" name="trabalhandoOutroEstado" checked={formData.trabalhandoOutroEstado} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                  </div>
                  <div className="text-sm">
                      <label className="font-medium text-gray-700 dark:text-gray-300">Está trabalhando em outro estado?</label>
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

export default DataForm;
