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
import { User } from '../types';
import { MOCK_USERS } from '../constants';

type View = 'dashboard' | 'turmas' | 'alunoRegular' | 'alunoEspecial' | 'docentes' | 'publicacoes' | 'dataManagement' | 'admin';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  userRole: 'Administrador' | 'Visualizador';
  onUserChange: (userId: string) => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggle, userRole, onUserChange, currentUser }) => {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, roles: ['Administrador', 'Visualizador'] },
    { id: 'turmas', label: 'Turmas', icon: BookOpenIcon, roles: ['Administrador', 'Visualizador'] },
    { id: 'alunoRegular', label: 'Aluno Regular', icon: UserIcon, roles: ['Administrador', 'Visualizador'] },
    { id: 'alunoEspecial', label: 'Aluno Especial', icon: UserPlusIcon, roles: ['Administrador', 'Visualizador'] },
    { id: 'docentes', label: 'Docentes', icon: AcademicCapIcon, roles: ['Administrador'] },
    { id: 'publicacoes', label: 'Publicações', icon: NewspaperIcon, roles: ['Administrador', 'Visualizador'] },
    { id: 'dataManagement', label: 'Gerenciar Dados', icon: DatabaseIcon, roles: ['Administrador'] },
    { id: 'admin', label: 'Painel Admin', icon: UsersIcon, roles: ['Administrador'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

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
      
      {/* Role Switcher for Testing */}
      <div className={`px-4 py-2 border-t border-gray-200 dark:border-gray-700 transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
          <label className="block text-xs font-medium text-gray-500 mb-1">Simular Usuário:</label>
          <select 
            value={currentUser.id} 
            onChange={(e) => onUserChange(e.target.value)}
            className="block w-full text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-1 px-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
              {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.role} ({u.name})</option>
              ))}
          </select>
      </div>

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