import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import axios from '../utils/axiosConfig';

// Constants
const TABS = {
  PROFILE: 'profile',
  SECURITY: 'security',
  SYSTEM: 'system',
  NOTIFICATIONS: 'notifications'
};

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' }
];

// Custom Hook
const useSettings = (user) => {
  const [state, setState] = useState({
    activeTab: TABS.PROFILE,
    profileData: {
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      poste: user?.poste || ''
    },
    securityData: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    systemSettings: {
      language: 'fr',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'DD/MM/YYYY'
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      activityAlerts: true,
      securityAlerts: true,
      weeklyReports: false
    },
    loading: false,
    errors: {},
    success: null
  });

  const setPartialState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!state.profileData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!state.profileData.email.trim()) errors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(state.profileData.email)) errors.email = 'Email invalide';
    
    return errors;
  };

  const validatePassword = () => {
    const errors = {};
    if (!state.securityData.currentPassword) errors.currentPassword = 'Le mot de passe actuel est requis';
    if (!state.securityData.newPassword) errors.newPassword = 'Le nouveau mot de passe est requis';
    else if (state.securityData.newPassword.length < 8) errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(state.securityData.newPassword)) {
      errors.newPassword = 'Le mot de passe doit contenir des majuscules, minuscules et chiffres';
    }
    if (state.securityData.newPassword !== state.securityData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    return errors;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const errors = validateProfile();
    
    if (Object.keys(errors).length > 0) {
      setPartialState({ errors });
      return;
    }

    try {
      setPartialState({ loading: true, errors: {}, success: null });
      
      await axios.put('/api/user/profile/', state.profileData);
      
      setPartialState({ 
        loading: false, 
        success: 'Profil mis à jour avec succès' 
      });
      
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setPartialState({ 
        loading: false, 
        errors: { submit: error.response?.data?.message || 'Erreur lors de la mise à jour' } 
      });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    
    if (Object.keys(errors).length > 0) {
      setPartialState({ errors });
      return;
    }

    try {
      setPartialState({ loading: true, errors: {}, success: null });
      
      await axios.put('/api/user/change-password/', {
        current_password: state.securityData.currentPassword,
        new_password: state.securityData.newPassword
      });
      
      setPartialState({ 
        loading: false, 
        success: 'Mot de passe changé avec succès',
        securityData: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      });
      
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setPartialState({ 
        loading: false, 
        errors: { submit: error.response?.data?.message || 'Erreur lors du changement de mot de passe' } 
      });
    }
  };

  const saveSystemSettings = async () => {
    try {
      await axios.put('/api/user/settings/', {
        system: state.systemSettings,
        notifications: state.notificationSettings
      });
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  const updateSystemSetting = (key, value) => {
    setPartialState({
      systemSettings: { ...state.systemSettings, [key]: value }
    });
  };

  const updateNotificationSetting = (key, value) => {
    setPartialState({
      notificationSettings: { ...state.notificationSettings, [key]: value }
    });
  };

  // Sauvegarde automatique des paramètres système
  useEffect(() => {
    if (state.activeTab === TABS.SYSTEM || state.activeTab === TABS.NOTIFICATIONS) {
      const timeoutId = setTimeout(saveSystemSettings, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.systemSettings, state.notificationSettings]);

  return {
    ...state,
    setPartialState,
    handleProfileUpdate,
    handlePasswordUpdate,
    updateSystemSetting,
    updateNotificationSetting
  };
};

// Components
const Notification = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${styles[type]} flex justify-between items-center animate-fade-in`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <span className="text-green-600 mr-2">✓</span>
        ) : (
          <span className="text-red-600 mr-2">⚠</span>
        )}
        {message}
      </div>
      <button onClick={onClose} className="text-lg font-semibold hover:opacity-70">
        ×
      </button>
    </div>
  );
};

const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="border-b border-gray-200 dark:border-gray-700">
    <nav className="flex -mb-px overflow-x-auto">
      {Object.entries(TABS).map(([key, value]) => (
        <button
          key={value}
          onClick={() => onTabChange(value)}
          className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === value
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {key === 'PROFILE' && '👤 Profil Utilisateur'}
          {key === 'SECURITY' && '🔒 Sécurité'}
          {key === 'SYSTEM' && '⚙️ Système'}
          {key === 'NOTIFICATIONS' && '🔔 Notifications'}
        </button>
      ))}
    </nav>
  </div>
);

const ProfileTab = ({ state, onUpdate, onChange }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold dark:text-white">Informations du profil</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Gérez vos informations personnelles et votre profil public
      </p>
    </div>

    <div className="flex items-center space-x-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-2xl font-bold">
          {state.profileData.nom?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold dark:text-white">{state.profileData.nom}</p>
        <p className="text-gray-500 dark:text-gray-400 capitalize">{state.profileData.poste || 'Non spécifié'}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">{state.profileData.email}</p>
      </div>
    </div>

    <form onSubmit={onUpdate} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            value={state.profileData.nom}
            onChange={(e) => onChange('nom', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              state.errors.nom ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre nom complet"
          />
          {state.errors.nom && (
            <p className="mt-1 text-sm text-red-600">{state.errors.nom}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Poste
          </label>
          <input
            type="text"
            value={state.profileData.poste}
            onChange={(e) => onChange('poste', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Votre poste"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={state.profileData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              state.errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="votre@email.com"
          />
          {state.errors.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={state.profileData.telephone}
            onChange={(e) => onChange('telephone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+261 XX XX XXX XX"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={state.loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {state.loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Mise à jour...
          </>
        ) : (
          'Mettre à jour le profil'
        )}
      </button>
    </form>
  </div>
);

const SecurityTab = ({ state, onUpdate, onChange }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold dark:text-white">Sécurité du compte</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Changez votre mot de passe et sécurisez votre compte
      </p>
    </div>

    <form onSubmit={onUpdate} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe actuel *
          </label>
          <input
            type="password"
            value={state.securityData.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              state.errors.currentPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre mot de passe actuel"
          />
          {state.errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nouveau mot de passe *
          </label>
          <input
            type="password"
            value={state.securityData.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              state.errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Minimum 8 caractères"
          />
          {state.errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmer le nouveau mot de passe *
          </label>
          <input
            type="password"
            value={state.securityData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              state.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirmez votre nouveau mot de passe"
          />
          {state.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {state.errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{state.errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={state.loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {state.loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Changement en cours...
          </>
        ) : (
          'Changer le mot de passe'
        )}
      </button>
    </form>
  </div>
);

const SystemTab = ({ state, onUpdate, isDarkMode, onToggleDarkMode }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold dark:text-white">Paramètres système</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Personnalisez l'apparence et le comportement de l'application
      </p>
    </div>

    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-700 transition-colors">
        <div>
          <p className="font-medium dark:text-white">Mode sombre</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDarkMode ? 'Thème sombre activé' : 'Thème clair activé'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isDarkMode}
            onChange={onToggleDarkMode}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-700 transition-colors">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Langue
        </label>
        <select 
          value={state.systemSettings.language}
          onChange={(e) => onUpdate('language', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-600 dark:border-gray-500 dark:text-white"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-700 transition-colors">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Format de date
        </label>
        <select 
          value={state.systemSettings.dateFormat}
          onChange={(e) => onUpdate('dateFormat', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-600 dark:border-gray-500 dark:text-white"
        >
          <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
          <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
          <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
        </select>
      </div>
    </div>
  </div>
);

const NotificationsTab = ({ state, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold dark:text-white">Préférences de notifications</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Contrôlez les notifications que vous recevez
      </p>
    </div>

    <div className="space-y-4 max-w-2xl">
      {Object.entries(state.notificationSettings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-700 transition-colors">
          <div>
            <p className="font-medium dark:text-white capitalize">
              {key === 'emailNotifications' && 'Notifications par email'}
              {key === 'pushNotifications' && 'Notifications push'}
              {key === 'activityAlerts' && 'Alertes d\'activité'}
              {key === 'securityAlerts' && 'Alertes de sécurité'}
              {key === 'weeklyReports' && 'Rapports hebdomadaires'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {key === 'emailNotifications' && 'Recevoir les notifications par email'}
              {key === 'pushNotifications' && 'Notifications en temps réel dans l\'application'}
              {key === 'activityAlerts' && 'Alertes pour les activités importantes'}
              {key === 'securityAlerts' && 'Alertes pour les événements de sécurité'}
              {key === 'weeklyReports' && 'Rapports hebdomadaires de performance'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={value}
              onChange={(e) => onUpdate(key, e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
    </div>
  </div>
);

// Main Component
const Settings = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const {
    activeTab,
    profileData,
    securityData,
    systemSettings,
    notificationSettings,
    loading,
    errors,
    success,
    setPartialState,
    handleProfileUpdate,
    handlePasswordUpdate,
    updateSystemSetting,
    updateNotificationSetting
  } = useSettings(user);

  const handleTabChange = (tab) => {
    setPartialState({ 
      activeTab: tab,
      errors: {},
      success: null 
    });
  };

  const handleProfileChange = (field, value) => {
    setPartialState({
      profileData: { ...profileData, [field]: value },
      errors: { ...errors, [field]: null }
    });
  };

  const handleSecurityChange = (field, value) => {
    setPartialState({
      securityData: { ...securityData, [field]: value },
      errors: { ...errors, [field]: null, submit: null }
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.PROFILE:
        return (
          <ProfileTab
            state={{ profileData, errors, loading }}
            onUpdate={handleProfileUpdate}
            onChange={handleProfileChange}
          />
        );
      case TABS.SECURITY:
        return (
          <SecurityTab
            state={{ securityData, errors, loading }}
            onUpdate={handlePasswordUpdate}
            onChange={handleSecurityChange}
          />
        );
      case TABS.SYSTEM:
        return (
          <SystemTab
            state={{ systemSettings }}
            onUpdate={updateSystemSetting}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      case TABS.NOTIFICATIONS:
        return (
          <NotificationsTab
            state={{ notificationSettings }}
            onUpdate={updateNotificationSetting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Paramètres</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
        </div>

        {/* Notifications */}
        <Notification 
          type="success" 
          message={success} 
          onClose={() => setPartialState({ success: null })} 
        />
        <Notification 
          type="error" 
          message={errors.submit} 
          onClose={() => setPartialState({ errors: { ...errors, submit: null } })} 
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;