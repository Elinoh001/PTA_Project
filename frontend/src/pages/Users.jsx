import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import Layout from '../components/Layout';

// Constants
const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISEUR: 'superviseur',
  USER: 'user'
};

const ROLE_CONFIG = {
  [USER_ROLES.ADMIN]: {
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: '👑'
  },
  [USER_ROLES.SUPERVISEUR]: {
    label: 'Superviseur',
    description: 'Gestion des activités et suivi',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: '🔍'
  },
  [USER_ROLES.USER]: {
    label: 'Utilisateur',
    description: 'Consultation et activités de base',
    badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: '👤'
  }
};

// Custom Hooks
const useUsersManagement = () => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    showForm: false,
    editingUser: null,
    formData: {
      nom: '',
      email: '',
      role: USER_ROLES.USER
    },
    error: null,
    success: null
  });

  const setPartialState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setPartialState({ loading: true, error: null });
      const response = await axios.get('/api/api/users/');
      setPartialState({ users: response.data, loading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      const errorMessage = error.response?.status === 403 
        ? 'Vous n\'avez pas les permissions pour accéder à cette page.'
        : 'Erreur lors du chargement des utilisateurs';
      
      setPartialState({ 
        error: errorMessage, 
        loading: false 
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPartialState({ error: null, success: null });

      if (state.editingUser) {
        await axios.put(`/api/api/users/${state.editingUser.id}/`, state.formData);
        setPartialState({ success: 'Utilisateur modifié avec succès' });
      } else {
        await axios.post('/api/api/create-user/', state.formData);
        setPartialState({ success: 'Utilisateur créé avec succès' });
      }

      await fetchUsers();
      resetForm();
      
      // Auto-clear success message
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || 'Erreur lors de la sauvegarde';
      
      setPartialState({ error: errorMessage });
    }
  };

  const resetForm = () => {
    setPartialState({
      formData: {
        nom: '',
        email: '',
        role: USER_ROLES.USER
      },
      editingUser: null,
      showForm: false
    });
  };

  const editUser = (user) => {
    setPartialState({
      formData: {
        nom: user.nom,
        email: user.email,
        role: user.role
      },
      editingUser: user,
      showForm: true
    });
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setPartialState({ error: null });
      await axios.patch(`/api/api/users/${userId}/update-role/`, { role: newRole });
      await fetchUsers();
      setPartialState({ success: 'Rôle mis à jour avec succès' });
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      setPartialState({ error: 'Erreur lors du changement de rôle' });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      setPartialState({ error: null });
      await axios.delete(`/api/api/users/${userId}/`);
      await fetchUsers();
      setPartialState({ success: 'Utilisateur supprimé avec succès' });
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setPartialState({ error: 'Erreur lors de la suppression' });
    }
  };

  return {
    ...state,
    setPartialState,
    fetchUsers,
    handleSubmit,
    resetForm,
    editUser,
    updateUserRole,
    deleteUser
  };
};

// Components
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
  </div>
);

const Notification = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${styles[type]} flex justify-between items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-lg font-semibold hover:opacity-70">
        ×
      </button>
    </div>
  );
};

const StatsCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    gray: 'bg-gray-100 dark:bg-gray-800'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const UserForm = ({ state, onSubmit, onCancel }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 animate-fade-in">
    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
      {state.editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
    </h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            required
            value={state.formData.nom}
            onChange={(e) => state.setPartialState({ 
              formData: { ...state.formData, nom: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
            placeholder="Nom et prénom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={state.formData.email}
            onChange={(e) => state.setPartialState({ 
              formData: { ...state.formData, email: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rôle *
        </label>
        <select
          value={state.formData.role}
          onChange={(e) => state.setPartialState({ 
            formData: { ...state.formData, role: e.target.value } 
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
        >
          {Object.entries(ROLE_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {state.editingUser ? 'Modifier' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
);

const UserTable = ({ users, onEdit, onDelete, onRoleChange }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Liste des Utilisateurs ({users.length})
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {user.nom?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.nom}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value)}
                  className={`text-sm font-medium rounded-lg border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${ROLE_CONFIG[user.role]?.badgeClass}`}
                >
                  {Object.entries(ROLE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RoleLegend = () => (
  <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Légende des rôles :</h4>
    <div className="flex flex-wrap gap-4">
      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
        <div key={role} className="flex items-center space-x-2">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${config.badgeClass}`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{config.description}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main Component
const Users = () => {
  const {
    users,
    loading,
    showForm,
    editingUser,
    formData,
    error,
    success,
    setPartialState,
    fetchUsers,
    handleSubmit,
    resetForm,
    editUser,
    updateUserRole,
    deleteUser
  } = useUsersManagement();

  // Setup axios interceptor
  useEffect(() => {
    const setupAxios = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    };
    
    setupAxios();
    fetchUsers();
  }, [fetchUsers]);

  // Calculate statistics
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === USER_ROLES.ADMIN).length,
    superviseurs: users.filter(u => u.role === USER_ROLES.SUPERVISEUR).length,
    users: users.filter(u => u.role === USER_ROLES.USER).length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Notifications */}
          <Notification 
            type="error" 
            message={error} 
            onClose={() => setPartialState({ error: null })} 
          />
          <Notification 
            type="success" 
            message={success} 
            onClose={() => setPartialState({ success: null })} 
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion des Utilisateurs</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Administration des utilisateurs et permissions</p>
              </div>
              <button
                onClick={() => setPartialState({ showForm: true })}
                className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                + Nouvel Utilisateur
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Total Utilisateurs" 
              value={stats.total} 
              icon="👥" 
              color="blue"
            />
            <StatsCard 
              title="Administrateurs" 
              value={stats.admins} 
              icon="👑" 
              color="red"
            />
            <StatsCard 
              title="Superviseurs" 
              value={stats.superviseurs} 
              icon="🔍" 
              color="blue"
            />
            <StatsCard 
              title="Utilisateurs" 
              value={stats.users} 
              icon="👤" 
              color="gray"
            />
          </div>

          {/* User Form */}
          {showForm && (
            <UserForm 
              state={{ formData, editingUser, setPartialState }}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}

          {/* User Table */}
          <UserTable 
            users={users}
            onEdit={editUser}
            onDelete={deleteUser}
            onRoleChange={updateUserRole}
          />

          {/* Role Legend */}
          <RoleLegend />
        </div>
      </div>
    </Layout>
  );
};

export default Users;