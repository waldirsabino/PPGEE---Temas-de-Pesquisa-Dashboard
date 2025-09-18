
import React, { useState, useEffect } from 'react';
import { Docente } from '../types';

interface DocenteFormProps {
  docente?: Docente | null;
  onSave: (docente: Docente) => void;
  onClose: () => void;
  existingDocenteNames?: string[];
}

const DocenteForm: React.FC<DocenteFormProps> = ({ docente, onSave, onClose, existingDocenteNames = [] }) => {
  const [formData, setFormData] = useState<Omit<Docente, 'id'>>({
    nome: '',
    email: '',
    fone: '',
    categoria: '',
    ano: new Date().getFullYear(),
    bolsaPQDT: false,
    dedicacaoExclusivaPPG: false,
    lecionouDisciplinaQuadrienio: false,
    participouPublicacaoQuadrienio: false,
    teveOrientacaoConcluidaQuadrienio: false,
  });

  useEffect(() => {
    if (docente) {
      setFormData({ ...docente });
    }
  }, [docente]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      id: docente?.id || new Date().toISOString(),
      ...formData,
      ano: Number(formData.ano),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{docente ? 'Editar Registro de Docente' : 'Adicionar Registro de Docente'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Registro Anual do Docente</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Docente</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600" 
                  required
                  list="docente-names"
                  disabled={!!docente}
                />
                {existingDocenteNames.length > 0 && !docente && (
                  <datalist id="docente-names">
                    {existingDocenteNames.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fone</label>
                <input type="tel" name="fone" value={formData.fone || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select 
                  name="categoria" 
                  value={formData.categoria} 
                  onChange={handleChange} 
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" 
                  required
                >
                  <option value="">Selecione a categoria</option>
                  <option value="PERMANENTE">PERMANENTE</option>
                  <option value="COLABORADOR">COLABORADOR</option>
                  <option value="PESQUISADOR">PESQUISADOR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div className="md:col-span-2 space-y-3 pt-2">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="bolsaPQDT" name="bolsaPQDT" type="checkbox" checked={formData.bolsaPQDT} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="bolsaPQDT" className="font-medium text-gray-700 dark:text-gray-300">Detentor de bolsa PQ ou DT</label>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="dedicacaoExclusivaPPG" name="dedicacaoExclusivaPPG" type="checkbox" checked={formData.dedicacaoExclusivaPPG} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="dedicacaoExclusivaPPG" className="font-medium text-gray-700 dark:text-gray-300">Dedicação Exclusiva ao PPG</label>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="lecionouDisciplinaQuadrienio" name="lecionouDisciplinaQuadrienio" type="checkbox" checked={formData.lecionouDisciplinaQuadrienio} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="lecionouDisciplinaQuadrienio" className="font-medium text-gray-700 dark:text-gray-300">Lecionou 1 disciplina no quadriênio</label>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="participouPublicacaoQuadrienio" name="participouPublicacaoQuadrienio" type="checkbox" checked={formData.participouPublicacaoQuadrienio} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="participouPublicacaoQuadrienio" className="font-medium text-gray-700 dark:text-gray-300">Participou de 1 publicação em periódico no quadriênio</label>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="teveOrientacaoConcluidaQuadrienio" name="teveOrientacaoConcluidaQuadrienio" type="checkbox" checked={formData.teveOrientacaoConcluidaQuadrienio} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-2 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="teveOrientacaoConcluidaQuadrienio" className="font-medium text-gray-700 dark:text-gray-300">Teve 1 orientação concluída no quadriênio</label>
                    </div>
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

export default DocenteForm;
