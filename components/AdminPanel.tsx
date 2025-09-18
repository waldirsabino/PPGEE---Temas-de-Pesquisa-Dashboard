
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSaveUser = (user: User) => {
        if(users.find(u => u.id === user.id)) {
            setUsers(users.map(u => u.id === user.id ? user : u));
        } else {
            setUsers([...users, { ...user, id: `u${users.length + 1}` }]);
        }
        setEditingUser(null);
        setIsAdding(false);
    }
    
    const handleDeleteUser = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
    }

    return (
        <div className="p-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gerenciamento de Usuários</h3>
                    <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Adicionar Usuário</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Permissão</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4">Editar</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {(isAdding || editingUser) && <UserForm user={editingUser} onSave={handleSaveUser} onClose={() => { setIsAdding(false); setEditingUser(null); }} />}
        </div>
    );
}

interface UserFormProps {
    user: User | null;
    onSave: (user: User) => void;
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'Visualizador' as 'Administrador' | 'Visualizador'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{user ? 'Editar Usuário' : 'Adicionar Usuário'}</h3>
                <form onSubmit={handleSubmit}>
                    <fieldset className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend className="px-2 text-sm font-medium text-gray-800 dark:text-gray-200">Dados do Usuário</legend>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium">Nome</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Permissão</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                                    <option value="Visualizador">Visualizador</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <div className="flex justify-end space-x-2 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminPanel;
