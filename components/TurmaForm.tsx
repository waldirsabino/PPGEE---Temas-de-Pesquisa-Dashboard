
import React, { useState, useEffect } from 'react';
import { Turma, Course } from '../types';

interface TurmaFormProps {
  turma?: Turma | null;
  onSave: (turma: Turma) => void;
  onClose: () => void;
}

const TurmaForm: React.FC<TurmaFormProps> = ({ turma, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Turma, 'id'>>({
    ano: new Date().getFullYear(),
    periodo: '1º Semestre',
    codDisciplina: '',
    disciplina: '',
    siglaDisciplina: '',
    situacao: 'Lançamento de Notas',
    docente: '',
    vagasOferecidas: 0,
    qtdMatriculado: 0,
    qtdAprovados: 0,
    qtdReprovadoNota: 0,
    qtdReprovadoFreq: 0,
    curso: Course.MESTRADO,
    categoria: '',
  });

  useEffect(() => {
    if (turma) {
      setFormData({ ...turma });
    }
  }, [turma]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: turma?.id || new Date().toISOString(),
      ...formData,
      ano: Number(formData.ano),
      vagasOferecidas: Number(formData.vagasOferecidas),
      qtdMatriculado: Number(formData.qtdMatriculado),
      qtdAprovados: Number(formData.qtdAprovados),
      qtdReprovadoNota: Number(formData.qtdReprovadoNota),
      qtdReprovadoFreq: Number(formData.qtdReprovadoFreq),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{turma ? 'Editar Turma' : 'Adicionar Turma'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Identificação da Turma</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
                  <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                  <input type="text" name="periodo" value={formData.periodo} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                  <select name="curso" value={formData.curso} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                      <option value={Course.MESTRADO}>Mestrado</option>
                      <option value={Course.DOUTORADO}>Doutorado</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                  <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina</label>
                  <input type="text" name="disciplina" value={formData.disciplina} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cód. Disciplina</label>
                  <input type="text" name="codDisciplina" value={formData.codDisciplina} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sigla e Disciplina</label>
                  <input type="text" name="siglaDisciplina" value={formData.siglaDisciplina} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Docente</label>
                  <input type="text" name="docente" value={formData.docente} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situação</label>
                  <input type="text" name="situacao" value={formData.situacao} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </fieldset>
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Quantitativos</legend>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vagas Oferecidas</label>
                  <input type="number" name="vagasOferecidas" value={formData.vagasOferecidas} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matriculados</label>
                  <input type="number" name="qtdMatriculado" value={formData.qtdMatriculado} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aprovados</label>
                  <input type="number" name="qtdAprovados" value={formData.qtdAprovados} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reprov. Nota</label>
                  <input type="number" name="qtdReprovadoNota" value={formData.qtdReprovadoNota} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reprov. Freq.</label>
                  <input type="number" name="qtdReprovadoFreq" value={formData.qtdReprovadoFreq} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
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

export default TurmaForm;
