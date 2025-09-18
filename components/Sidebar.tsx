import React from 'react';
import ChartBarIcon from './icons/ChartBarIcon';
import UsersIcon from './icons/UsersIcon';
import DatabaseIcon from './icons/DatabaseIcon';
import ChevronDoubleLeftIcon from './icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from './icons/ChevronDoubleRightIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import NewspaperIcon from './icons/NewspaperIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import UserIcon from './icons/UserIcon';
import UserPlusIcon from './icons/UserPlusIcon';

type View = 'dashboard' | 'turmas' | 'alunoRegular' | 'alunoEspecial' | 'docentes' | 'publicacoes' | 'dataManagement' | 'admin';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggle }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'turmas', label: 'Turmas', icon: BookOpenIcon },
    { id: 'alunoRegular', label: 'Aluno Regular', icon: UserIcon },
    { id: 'alunoEspecial', label: 'Aluno Especial', icon: UserPlusIcon },
    { id: 'docentes', label: 'Docentes', icon: AcademicCapIcon },
    { id: 'publicacoes', label: 'Publicações', icon: NewspaperIcon },
    { id: 'dataManagement', label: 'Gerenciar Dados', icon: DatabaseIcon },
    { id: 'admin', label: 'Painel Admin', icon: UsersIcon },
  ];

  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <h1 className={`text-2xl font-bold text-blue-600 dark:text-blue-400 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          PPGEE
        </h1>
      </div>
      <nav className="flex-1 px-2 py-6">
        <ul className="pl-0 space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as View)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center py-3 rounded-lg transition-colors duration-200 ${isCollapsed ? 'px-4 justify-center' : 'px-4'} ${
                  activeView === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-blue-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
         <button 
            onClick={onToggle} 
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
        </button>
        <p className={`text-xs text-center text-gray-500 mt-4 transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>© 2024 PPGEE App</p>
      </div>
    </aside>
  );
};

export default Sidebar;