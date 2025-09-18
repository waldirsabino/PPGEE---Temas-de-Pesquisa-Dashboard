
import React, { useState, useEffect } from 'react';
import { Projeto } from '../types';

interface ProjetoFormProps {
  projeto?: Projeto | null;
  onSave: (projeto: Projeto) => void;
  onClose: () => void;
}

const ProjetoForm: React.FC<ProjetoFormProps> = ({ projeto, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Projeto, 'id'>>({
    titulo: '',
    natureza: '',
    coordenador: '',
    financiador: '',
    colaboracaoNaoAcademica: 'Não',
    resumo: '',
    valorFinanciado: 0,
    atuacao: 'Coordenador',
    alunosMestradoEnvolvidos: 0,
    alunosDoutoradoEnvolvidos: 0,
    anoInicio: new Date().getFullYear(),
    anoFim: undefined,
  });

  useEffect(() => {
    if (projeto) {
      setFormData({ ...projeto });
    }
  }, [projeto]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: projeto?.id || new Date().toISOString(),
      ...formData,
      valorFinanciado: Number(formData.valorFinanciado),
      alunosMestradoEnvolvidos: Number(formData.alunosMestradoEnvolvidos),
      alunosDoutoradoEnvolvidos: Number(formData.alunosDoutoradoEnvolvidos),
      anoInicio: Number(formData.anoInicio),
      anoFim: formData.anoFim ? Number(formData.anoFim) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{projeto ? 'Editar Projeto' : 'Adicionar Projeto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Informações do Projeto</legend>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título do Projeto</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Natureza</label>
                  <input type="text" name="natureza" value={formData.natureza} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coordenador</label>
                  <input type="text" name="coordenador" value={formData.coordenador} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Financiador</label>
                  <input type="text" name="financiador" value={formData.financiador} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Financiado (R$)</label>
                  <input type="number" name="valorFinanciado" value={formData.valorFinanciado} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resumo</label>
                  <textarea name="resumo" value={formData.resumo} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Projetos estabelecidos com instituições que NÃO sejam acadêmicas e NÃO sejam de agências de fomento, que resultem em produtos tecnológicos ou impacto na formação de recurso humanos (Sim ou Não)</label>
                  <select name="colaboracaoNaoAcademica" value={formData.colaboracaoNaoAcademica} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
              </div>
            </div>
          </fieldset>
          
          <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Detalhes Operacionais</legend>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Atuação</label>
                <select name="atuacao" value={formData.atuacao} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                  <option value="Coordenador">Coordenador</option>
                  <option value="Membro">Membro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mestrandos</label>
                <input type="number" name="alunosMestradoEnvolvidos" value={formData.alunosMestradoEnvolvidos} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doutorandos</label>
                <input type="number" name="alunosDoutoradoEnvolvidos" value={formData.alunosDoutoradoEnvolvidos} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Início</label>
                <input type="number" name="anoInicio" value={formData.anoInicio} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano Fim</label>
                <input type="number" name="anoFim" value={formData.anoFim || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
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

export default ProjetoForm;
