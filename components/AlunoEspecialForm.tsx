import React, { useState, useEffect } from 'react';
import { AlunoEspecial } from '../types';

interface AlunoEspecialFormProps {
  aluno?: AlunoEspecial | null;
  onSave: (aluno: AlunoEspecial) => void;
  onClose: () => void;
}

const AlunoEspecialForm: React.FC<AlunoEspecialFormProps> = ({ aluno, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<AlunoEspecial, 'id'>>({
    matricula: '',
    aluno: '',
    ano: new Date().getFullYear(),
    periodo: '1º Semestre',
    codDisciplina: '',
    disciplina: '',
    situacao: 'Cursando',
    email: '',
    fone: '',
  });

  useEffect(() => {
    if (aluno) {
      setFormData({ ...aluno });
    }
  }, [aluno]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: aluno?.id || new Date().toISOString(),
      ...formData,
      ano: Number(formData.ano),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{aluno ? 'Editar Aluno Especial' : 'Adicionar Aluno Especial'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Dados do Aluno</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matrícula</label>
                  <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aluno</label>
                  <input type="text" name="aluno" value={formData.aluno} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
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
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Dados da Disciplina</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                  <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                  <input type="text" name="periodo" value={formData.periodo} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cód. Disciplina</label>
                  <input type="text" name="codDisciplina" value={formData.codDisciplina} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina</label>
                  <input type="text" name="disciplina" value={formData.disciplina} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situação</label>
                  <select name="situacao" value={formData.situacao} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                      <option value="Cursando">Cursando</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Reprovado por Nota">Reprovado por Nota</option>
                      <option value="Reprovado por Frequência">Reprovado por Frequência</option>
                  </select>
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

export default AlunoEspecialForm;
