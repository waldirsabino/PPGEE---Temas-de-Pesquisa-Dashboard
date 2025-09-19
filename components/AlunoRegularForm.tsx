import React, { useState, useEffect } from 'react';
import { AlunoRegular, Course } from '../types';

interface AlunoRegularFormProps {
  aluno?: AlunoRegular | null;
  onSave: (aluno: AlunoRegular) => void;
  onClose: () => void;
}

const formatDateInput = (value: string): string => {
  const onlyNums = value.replace(/[^\d]/g, '');
  if (onlyNums.length <= 2) return onlyNums;
  if (onlyNums.length <= 4) return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2)}`;
  return `${onlyNums.slice(0, 2)}/${onlyNums.slice(2, 4)}/${onlyNums.slice(4, 8)}`;
};

const AlunoRegularForm: React.FC<AlunoRegularFormProps> = ({ aluno, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<AlunoRegular, 'id'>>({
    matricula: '',
    aluno: '',
    ingresso: '',
    situacao: 'Sem Evasão',
    orientador: '',
    coOrientador: '',
    proficiencia: undefined,
    qualificacao: '',
    defesa: '',
    bolsista: 'Não',
    curso: Course.MESTRADO,
    email: '',
    fone: '',
    informacoesExtras: '',
  });

  useEffect(() => {
    if (aluno) {
      setFormData({ ...aluno });
    }
  }, [aluno]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const dateFields = ['ingresso', 'qualificacao', 'defesa'];

    if (dateFields.includes(name)) {
        setFormData(prev => ({ ...prev, [name]: formatDateInput(value) }));
    } else if (name === 'proficiencia') {
        // Allow empty string to clear the number, otherwise parse it.
        const numericValue = value === '' ? undefined : parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: isNaN(numericValue!) ? undefined : numericValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: aluno?.id || new Date().toISOString(),
      ...formData,
      proficiencia: formData.proficiencia != null ? Number(formData.proficiencia) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{aluno ? 'Editar Aluno Regular' : 'Adicionar Aluno Regular'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Dados Cadastrais</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matrícula</label>
                  <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aluno</label>
                  <input type="text" name="aluno" value={formData.aluno} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingresso (dd/mm/aaaa)</label>
                  <input type="text" name="ingresso" placeholder="dd/mm/aaaa" value={formData.ingresso} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required maxLength={10} pattern="\d{2}/\d{2}/\d{4}" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situação</label>
                  <select name="situacao" value={formData.situacao} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                      <option value="Sem Evasão">Sem Evasão</option>
                      <option value="Desligado">Desligado</option>
                      <option value="Defendido">Defendido</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                  <select name="curso" value={formData.curso} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                      <option value={Course.MESTRADO}>Mestrado</option>
                      <option value={Course.DOUTORADO}>Doutorado</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orientador(a)</label>
                  <input type="text" name="orientador" value={formData.orientador} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Co Orientador(a)</label>
                  <input type="text" name="coOrientador" value={formData.coOrientador} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bolsista</label>
                  <input type="text" name="bolsista" value={formData.bolsista} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </fieldset>
          
           <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Contato</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fone</label>
                  <input type="tel" name="fone" value={formData.fone} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Marcos Acadêmicos</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proficiência Nota</label>
                  <input type="number" step="0.01" name="proficiencia" value={formData.proficiencia ?? ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qualificação (dd/mm/aaaa)</label>
                  <input type="text" name="qualificacao" placeholder="dd/mm/aaaa" value={formData.qualificacao} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" maxLength={10} pattern="\d{2}/\d{2}/\d{4}" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Defesa (dd/mm/aaaa)</label>
                  <input type="text" name="defesa" placeholder="dd/mm/aaaa" value={formData.defesa} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" maxLength={10} pattern="\d{2}/\d{2}/\d{4}" />
              </div>
            </div>
          </fieldset>
          
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Informações Extras</legend>
            <div className="mt-4">
                <textarea
                  name="informacoesExtras"
                  value={formData.informacoesExtras || ''}
                  onChange={handleChange}
                  maxLength={100}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Até 100 caracteres"
                />
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

export default AlunoRegularForm;