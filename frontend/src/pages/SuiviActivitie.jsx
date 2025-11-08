import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';


const LoadingSpinner = () => (
  <div className="p-8 text-center animate-fade-in">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
    <p className="text-gray-600 dark:text-gray-300 text-lg">Chargement des données...</p>
  </div>
);

const Notification = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${styles[type]} flex justify-between items-center animate-fade-in`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-lg font-semibold hover:opacity-70">
        ×
      </button>
    </div>
  );
};

const ProgressBar = ({ percentage, showLabel = true, size = 'md' }) => {
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-blue-500';
    if (percent >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-32 bg-gray-200 dark:bg-gray-600 rounded-full ${sizes[size]} flex-1`}>
        <div 
          className={`${sizes[size]} rounded-full transition-all duration-500 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showLabel && (
        <span className={`text-sm font-bold min-w-12 ${
          percentage >= 80 ? 'text-green-700 dark:text-green-400' :
          percentage >= 50 ? 'text-blue-700 dark:text-blue-400' :
          percentage >= 25 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'
        }`}>
          {percentage}%
        </span>
      )}
    </div>
  );
};

// Nouveau composant pour les alertes de retard
const RetardAlert = ({ activite, onViewDetails, onAddSuivi }) => {
  const joursRetard = Math.ceil((new Date() - new Date(activite.date_fin)) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
          </div>
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300">
              Activité en retard
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400">
              "{activite.activite?.substring(0, 50)}..." - {joursRetard} jour(s) de retard
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(activite)}
            className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 text-sm font-medium px-3 py-1 border border-red-300 dark:border-red-700 rounded-md transition-colors"
          >
            Voir détails
          </button>
          <button
            onClick={() => onAddSuivi(activite)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1 rounded-md transition-colors"
          >
            Ajouter suivi
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsOverview = ({ suivis, activites, lastUpdated, activitesEnRetard }) => {
  const stats = useMemo(() => {
    const totalSuivis = suivis.length;
    const totalActivites = activites.length;
    const moyenneAvancement = totalSuivis > 0 
      ? Math.round(suivis.reduce((acc, curr) => acc + curr.avancement, 0) / totalSuivis)
      : 0;
    
    const derniereDate = totalSuivis > 0 
      ? new Date(Math.max(...suivis.map(s => new Date(s.date_suivi))))
      : null;

    // Calcul des activités à risque (moins de 7 jours restants)
    const activitesARisque = activites.filter(activite => {
      if (!activite.date_fin || activite.etat === 'Terminé') return false;
      const joursRestants = Math.ceil((new Date(activite.date_fin) - new Date()) / (1000 * 60 * 60 * 24));
      return joursRestants > 0 && joursRestants <= 7;
    }).length;

    return {
      totalSuivis,
      totalActivites,
      moyenneAvancement,
      derniereActivite: derniereDate ? derniereDate.toLocaleDateString('fr-FR') : 'Aucune',
      activitesEnRetard,
      activitesARisque
    };
  }, [suivis, activites, activitesEnRetard]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Suivis</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSuivis}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Activités</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalActivites}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <span className="text-2xl">📈</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avancement Moyen</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.moyenneAvancement}%</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <span className="text-2xl">📅</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernier Suivi</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.derniereActivite}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">En Retard</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activitesEnRetard}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <span className="text-2xl">⏰</span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">À Risque</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activitesARisque}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Hooks
const useSuiviActivite = () => {
  const [state, setState] = useState({
    suivis: [],
    activites: [],
    loading: false,
    showForm: false,
    editingSuivi: null,
    selectedActivite: null,
    showDetail: false,
    formData: {
      activite: '',
      date_suivi: new Date().toISOString().split('T')[0],
      observation: '',
      avancement: 0,
      notification_retard: false,
      message_notification: ''
    },
    filters: {
      activite: '',
      dateDebut: '',
      dateFin: '',
      avecRetard: false,
      etat: ''
    },
    error: null,
    success: null,
    autoRefresh: false,
    lastUpdated: null
  });

  const setPartialState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fonction pour vérifier si une activité est en retard
  const isActiviteEnRetard = useCallback((activite) => {
    if (!activite.date_fin || activite.etat === 'Terminé') return false;
    const aujourdhui = new Date();
    const dateFin = new Date(activite.date_fin);
    return aujourdhui > dateFin;
  }, []);

  // Fonction pour calculer les jours restants
  const getJoursRestants = useCallback((activite) => {
    if (!activite.date_fin) return null;
    const aujourdhui = new Date();
    const dateFin = new Date(activite.date_fin);
    const diffTime = dateFin - aujourdhui;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setPartialState({ loading: true, error: null });
      const [suivisRes, activitesRes] = await Promise.all([
        axios.get('/api/suivis/'),
        axios.get('/api/activites/')
      ]);
      
      // Vérifier les notifications de retard pour chaque suivi
      const suivisAvecNotifications = suivisRes.data.map(suivi => {
        const activite = activitesRes.data.find(a => a.id === suivi.activite);
        if (activite && isActiviteEnRetard(activite) && !suivi.notification_retard) {
          // Auto-générer une notification si l'activité est en retard
          return {
            ...suivi,
            notification_retard: true,
            message_notification: `ATTENTION : L'activité "${activite.activite?.substring(0, 50)}..." est en retard. Date de fin prévue : ${new Date(activite.date_fin).toLocaleDateString('fr-FR')}`
          };
        }
        return suivi;
      });

      setPartialState({ 
        suivis: suivisAvecNotifications, 
        activites: activitesRes.data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setPartialState({ 
        error: 'Erreur lors du chargement des données',
        loading: false 
      });
    }
  }, [setPartialState, isActiviteEnRetard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPartialState({ error: null });
      
      // Vérifier si l'activité est en retard pour générer une notification automatique
      const activite = state.activites.find(a => a.id === parseInt(state.formData.activite));
      const estEnRetard = activite ? isActiviteEnRetard(activite) : false;
      
      const suiviData = {
        ...state.formData,
        activite: parseInt(state.formData.activite),
        notification_retard: estEnRetard,
        message_notification: estEnRetard 
          ? `ATTENTION : L'activité "${activite.activite?.substring(0, 50)}..." est en retard. Date de fin prévue : ${new Date(activite.date_fin).toLocaleDateString('fr-FR')}`
          : ''
      };

      if (state.editingSuivi) {
        await axios.put(`/api/suivis/${state.editingSuivi.id}/`, suiviData);
        setPartialState({ success: 'Suivi modifié avec succès' });
      } else {
        await axios.post('/api/suivis/', suiviData);
        setPartialState({ success: 'Suivi enregistré avec succès' });
      }
      
      await fetchData();
      resetForm();
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setPartialState({ 
        error: `Erreur lors de ${state.editingSuivi ? 'la modification' : 'la sauvegarde'} du suivi` 
      });
    }
  };

  const resetForm = useCallback(() => {
    setPartialState({
      formData: {
        activite: '',
        date_suivi: new Date().toISOString().split('T')[0],
        observation: '',
        avancement: 0,
        notification_retard: false,
        message_notification: ''
      },
      showForm: false,
      editingSuivi: null
    });
  }, [setPartialState]);

  const editSuivi = useCallback((suivi) => {
    setPartialState({
      showForm: true,
      editingSuivi: suivi,
      formData: {
        activite: suivi.activite.toString(),
        date_suivi: suivi.date_suivi,
        observation: suivi.observation || '',
        avancement: suivi.avancement,
        notification_retard: suivi.notification_retard || false,
        message_notification: suivi.message_notification || ''
      }
    });
  }, [setPartialState]);

  const deleteSuivi = async (suiviId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce suivi ?')) return;

    try {
      setPartialState({ error: null });
      await axios.delete(`/api/suivis/${suiviId}/`);
      await fetchData();
      setPartialState({ success: 'Suivi supprimé avec succès' });
      setTimeout(() => setPartialState({ success: null }), 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setPartialState({ error: 'Erreur lors de la suppression du suivi' });
    }
  };

  const handleViewDetails = useCallback((activite) => {
    setPartialState({
      selectedActivite: activite,
      showDetail: true
    });
  }, [setPartialState]);

  const handleAddSuiviForActivite = useCallback((activite) => {
    setPartialState({
      showForm: true,
      editingSuivi: null,
      formData: {
        activite: activite.id.toString(),
        date_suivi: new Date().toISOString().split('T')[0],
        observation: '',
        avancement: activite.avancement || 0,
        notification_retard: false,
        message_notification: ''
      }
    });
  }, [setPartialState]);

  return {
    ...state,
    setPartialState,
    fetchData,
    handleSubmit,
    resetForm,
    editSuivi,
    deleteSuivi,
    isActiviteEnRetard,
    getJoursRestants,
    handleViewDetails,
    handleAddSuiviForActivite
  };
};

// SuiviForm Component amélioré
const SuiviForm = ({ state, onSubmit, onCancel, isActiviteEnRetard, getJoursRestants }) => {
  const { formData, activites, setPartialState, editingSuivi } = state;

  const handleInputChange = useCallback((field, value) => {
    setPartialState({ 
      formData: { ...formData, [field]: value } 
    });
  }, [formData, setPartialState]);

  // Obtenir les informations de l'activité sélectionnée
  const selectedActivite = useMemo(() => {
    return activites.find(a => a.id === parseInt(formData.activite));
  }, [activites, formData.activite]);

  const estEnRetard = selectedActivite ? isActiviteEnRetard(selectedActivite) : false;
  const joursRestants = selectedActivite ? getJoursRestants(selectedActivite) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {editingSuivi ? 'Modifier le Suivi' : 'Nouveau Suivi d\'Activité'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>
      
      {/* Alertes pour les activités en retard */}
      {selectedActivite && estEnRetard && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                Activité en retard
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cette activité a dépassé sa date de fin prévue ({selectedActivite.date_fin ? new Date(selectedActivite.date_fin).toLocaleDateString('fr-FR') : 'N/A'})
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedActivite && joursRestants !== null && joursRestants > 0 && joursRestants <= 7 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-sm">⏰</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                Activité à risque
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Il reste seulement {joursRestants} jour(s) avant la date de fin prévue
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Activité *
            </label>
            <select
              required
              value={formData.activite}
              onChange={(e) => handleInputChange('activite', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
            >
              <option value="">Sélectionner une activité</option>
              {activites.map((activite) => (
                <option key={activite.id} value={activite.id}>
                  {activite.activite} 
                  {activite.date_fin && ` (Fin: ${new Date(activite.date_fin).toLocaleDateString('fr-FR')})`}
                </option>
              ))}
            </select>
            {selectedActivite && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedActivite.date_debut && selectedActivite.date_fin && (
                  <span>
                    Planning: {new Date(selectedActivite.date_debut).toLocaleDateString('fr-FR')} - {new Date(selectedActivite.date_fin).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date de Suivi *
            </label>
            <input
              type="date"
              required
              value={formData.date_suivi}
              onChange={(e) => handleInputChange('date_suivi', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Avancement
            </label>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              {formData.avancement}%
            </span>
          </div>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.avancement}
              onChange={(e) => handleInputChange('avancement', parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Observation
          </label>
          <textarea
            value={formData.observation}
            onChange={(e) => handleInputChange('observation', e.target.value)}
            rows="4"
            maxLength="500"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200 resize-none"
            placeholder="Décrivez l'avancement, les difficultés rencontrées, les prochaines étapes..."
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Partagez les détails importants du suivi</span>
            <span>{formData.observation.length}/500 caractères</span>
          </div>
        </div>

        {/* Section notifications */}
        {estEnRetard && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notification_retard}
                onChange={(e) => handleInputChange('notification_retard', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>
                <label className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                  Notifier le retard
                </label>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Cocher pour envoyer une notification concernant le retard de cette activité
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <span>💾</span>
            <span>{editingSuivi ? 'Modifier le Suivi' : 'Enregistrer le Suivi'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

// SuiviTable Component amélioré
const SuiviTable = ({ 
  suivis, 
  activites, 
  onDelete, 
  onEdit, 
  filters, 
  onFilterChange,
  isActiviteEnRetard,
  getJoursRestants 
}) => {
  const getActiviteName = useCallback((activiteId) => {
    const activite = activites.find(a => a.id === activiteId);
    return activite ? activite.activite : 'Activité inconnue';
  }, [activites]);

  const getActiviteDetails = useCallback((activiteId) => {
    return activites.find(a => a.id === activiteId);
  }, [activites]);

  const filteredSuivis = useMemo(() => {
    return suivis.filter(suivi => {
      const matchesActivite = !filters.activite || suivi.activite === parseInt(filters.activite);
      const matchesDateDebut = !filters.dateDebut || new Date(suivi.date_suivi) >= new Date(filters.dateDebut);
      const matchesDateFin = !filters.dateFin || new Date(suivi.date_suivi) <= new Date(filters.dateFin);
      const matchesEtat = !filters.etat || filters.etat === '';
      
      // Filtre pour les suivis avec notification de retard
      const matchesRetard = !filters.avecRetard || suivi.notification_retard;
      
      return matchesActivite && matchesDateDebut && matchesDateFin && matchesEtat && matchesRetard;
    });
  }, [suivis, filters]);

  const handleFilterChange = useCallback((filterName, value) => {
    onFilterChange(filterName, value);
  }, [onFilterChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Historique des Suivis
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              {filteredSuivis.length} suivi(s)
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.activite}
              onChange={(e) => handleFilterChange('activite', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
            >
              <option value="">Toutes les activités</option>
              {activites.map(activite => (
                <option key={activite.id} value={activite.id}>
                  {activite.activite.length > 30 ? activite.activite.substring(0, 30) + '...' : activite.activite}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
              placeholder="Date début"
            />
            
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
              placeholder="Date fin"
            />

            <button
              onClick={() => handleFilterChange('avecRetard', !filters.avecRetard)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.avecRetard 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              ⚠️ Retard
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {["Activité", "Date", "Planning", "Avancement", "Observation", "Notifications", "Actions"].map((header) => (
                <th 
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSuivis.map((suivi) => {
              const activite = getActiviteDetails(suivi.activite);
              const estEnRetard = activite ? isActiviteEnRetard(activite) : false;
              const joursRestants = activite ? getJoursRestants(activite) : null;

              return (
                <tr 
                  key={suivi.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group ${
                    estEnRetard ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {getActiviteName(suivi.activite)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-600 px-3 py-1 rounded-full inline-block">
                      {new Date(suivi.date_suivi).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {activite && (activite.date_debut || activite.date_fin) ? (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div>{activite.date_debut && new Date(activite.date_debut).toLocaleDateString('fr-FR')} →</div>
                        <div>{activite.date_fin && new Date(activite.date_fin).toLocaleDateString('fr-FR')}</div>
                        {joursRestants !== null && (
                          <div className={`font-semibold ${
                            estEnRetard 
                              ? 'text-red-600 dark:text-red-400'
                              : joursRestants <= 7 
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {estEnRetard ? `${Math.abs(joursRestants)}j retard` : `${joursRestants}j restants`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">Non planifié</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ProgressBar percentage={suivi.avancement} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                      {suivi.observation ? (
                        <div className="line-clamp-2">
                          {suivi.observation}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">Aucune observation</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {suivi.notification_retard ? (
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Retard</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onEdit(suivi)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Modifier le suivi"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(suivi.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Supprimer le suivi"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSuivis.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">Aucun suivi trouvé</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 max-w-md mx-auto">
              {suivis.length === 0 
                ? "Commencez par créer votre premier suivi d'activité pour suivre l'avancement de vos projets"
                : "Aucun suivi ne correspond aux critères de filtrage sélectionnés"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de détail d'activité
const ActiviteDetailModal = ({ activite, onClose, onAddSuivi, isActiviteEnRetard, getJoursRestants }) => {
  if (!activite) return null;

  const estEnRetard = isActiviteEnRetard(activite);
  const joursRestants = getJoursRestants(activite);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Détails de l'Activité</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{activite.activite}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activite.service_nom || 'Non assigné'}</p>
              {estEnRetard && (
                <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
                  <span className="text-sm mr-1">⚠️</span>
                  <span className="text-sm font-semibold">Activité en retard !</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations de planning */}
          {(activite.date_debut || activite.date_fin) && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3">Planning</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-purple-700 dark:text-purple-400">Date de début:</span>
                  <p className="text-purple-600 dark:text-purple-300 mt-1">
                    {activite.date_debut ? new Date(activite.date_debut).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-purple-700 dark:text-purple-400">Date de fin prévue:</span>
                  <p className="text-purple-600 dark:text-purple-300 mt-1">
                    {activite.date_fin ? new Date(activite.date_fin).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  </p>
                </div>
                {joursRestants !== null && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-purple-700 dark:text-purple-400">Statut:</span>
                    <p className={`mt-1 font-semibold ${
                      estEnRetard
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {estEnRetard
                        ? `En retard (${Math.abs(joursRestants)} jours)`
                        : `${joursRestants} jours restants`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Objectif Général</h4>
              <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {activite.objectif_general || <span className="text-gray-400 dark:text-gray-500 italic">Non spécifié</span>}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">État</h4>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                activite.etat === 'Terminé' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : activite.etat === 'En cours'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {activite.etat || 'Non spécifié'}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => onAddSuivi(activite)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ajouter un suivi
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const SuiviActivite = () => {
  const {
    suivis,
    activites,
    loading,
    showForm,
    editingSuivi,
    selectedActivite,
    showDetail,
    formData,
    filters,
    error,
    success,
    autoRefresh,
    lastUpdated,
    setPartialState,
    fetchData,
    handleSubmit,
    resetForm,
    editSuivi,
    deleteSuivi,
    isActiviteEnRetard,
    getJoursRestants,
    handleViewDetails,
    handleAddSuiviForActivite
  } = useSuiviActivite();

  // Calcul des activités en retard
  const activitesEnRetard = useMemo(() => {
    return activites.filter(activite => isActiviteEnRetard(activite)).length;
  }, [activites, isActiviteEnRetard]);

  // Alertes de retard
  const alertesRetard = useMemo(() => {
    return activites
      .filter(activite => isActiviteEnRetard(activite))
      .slice(0, 5); // Limiter à 5 alertes
  }, [activites, isActiviteEnRetard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 300000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleFilterChange = useCallback((filterName, value) => {
    setPartialState({
      filters: { ...filters, [filterName]: value }
    });
  }, [filters, setPartialState]);

  const closeDetailModal = useCallback(() => {
    setPartialState({ showDetail: false, selectedActivite: null });
  }, [setPartialState]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
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

          {/* Alertes de retard en haut de la page */}
          {alertesRetard.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Alertes de Retard ({alertesRetard.length})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Activités nécessitant une attention immédiate
                </span>
              </div>
              {alertesRetard.map(activite => (
                <RetardAlert
                  key={activite.id}
                  activite={activite}
                  onViewDetails={handleViewDetails}
                  onAddSuivi={handleAddSuiviForActivite}
                />
              ))}
            </div>
          )}

          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Suivi des Activités PTA</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Suivi détaillé de l'avancement et du progrès des activités avec gestion des délais
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPartialState({ autoRefresh: !autoRefresh })}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  } hover:scale-105`}
                  title="Auto-refresh"
                >
                  🔄
                </button>
                
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>↻</span>
                  <span>Actualiser</span>
                </button>
                
                <button
                  onClick={() => setPartialState({ showForm: true, editingSuivi: null })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Nouveau Suivi</span>
                </button>
              </div>
            </div>
          </div>

          <StatsOverview 
            suivis={suivis} 
            activites={activites} 
            lastUpdated={lastUpdated}
            activitesEnRetard={activitesEnRetard}
          />

          {(showForm || editingSuivi) && (
            <SuiviForm 
              state={{ formData, activites, setPartialState, editingSuivi }}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isActiviteEnRetard={isActiviteEnRetard}
              getJoursRestants={getJoursRestants}
            />
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <SuiviTable 
              suivis={suivis}
              activites={activites}
              onDelete={deleteSuivi}
              onEdit={editSuivi}
              filters={filters}
              onFilterChange={handleFilterChange}
              isActiviteEnRetard={isActiviteEnRetard}
              getJoursRestants={getJoursRestants}
            />
          )}

          {showDetail && selectedActivite && (
            <ActiviteDetailModal
              activite={selectedActivite}
              onClose={closeDetailModal}
              onAddSuivi={handleAddSuiviForActivite}
              isActiviteEnRetard={isActiviteEnRetard}
              getJoursRestants={getJoursRestants}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SuiviActivite;