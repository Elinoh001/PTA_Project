import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const CadreLogique = () => {
  const [objectifsGeneraux, setObjectifsGeneraux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOG, setExpandedOG] = useState({});
  const [expandedOS, setExpandedOS] = useState({});
  const [showOGForm, setShowOGForm] = useState(false);
  const [showOSForm, setShowOSForm] = useState(false);
  const [showRAForm, setShowRAForm] = useState(false);
  const [editingOG, setEditingOG] = useState(null);
  const [editingOS, setEditingOS] = useState(null);
  const [editingRA, setEditingRA] = useState(null);
  const [selectedOG, setSelectedOG] = useState(null);
  const [selectedOS, setSelectedOS] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // États pour les formulaires
  const [ogFormData, setOgFormData] = useState({ numero: '', titre: '', description: '' });
  const [osFormData, setOsFormData] = useState({ numero: '', titre: '', description: '' });
  const [raFormData, setRaFormData] = useState({ numero: '', description: '' });

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/objectifs-generaux/');
      setObjectifsGeneraux(response.data);
      
      // Développer le premier OG par défaut
      if (response.data.length > 0) {
        setExpandedOG({ [response.data[0].id]: true });
      }
    } catch (error) {
      console.error('Erreur chargement structure:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'expansion
  const toggleOG = (ogId) => {
    setExpandedOG(prev => ({ ...prev, [ogId]: !prev[ogId] }));
  };

  const toggleOS = (osId) => {
    setExpandedOS(prev => ({ ...prev, [osId]: !prev[osId] }));
  };

  // CRUD pour Objectifs Généraux
  const handleCreateOG = async (e) => {
    e.preventDefault();
    try {
      if (editingOG) {
        await axios.put(`/api/objectifs-generaux/${editingOG.id}/`, ogFormData);
        setSuccessMessage('Objectif général modifié avec succès !');
      } else {
        await axios.post('/api/objectifs-generaux/', ogFormData);
        setSuccessMessage('Objectif général créé avec succès !');
      }
      fetchStructure();
      resetOGForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création OG:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCreateOS = async (e) => {
    e.preventDefault();
    try {
      if (editingOS) {
        await axios.put(`/api/objectifs-specifiques/${editingOS.id}/`, {
          ...osFormData,
          objectif_general: selectedOG.id
        });
        setSuccessMessage('Objectif spécifique modifié avec succès !');
      } else {
        await axios.post('/api/objectifs-specifiques/', {
          ...osFormData,
          objectif_general: selectedOG.id
        });
        setSuccessMessage('Objectif spécifique créé avec succès !');
      }
      fetchStructure();
      resetOSForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création OS:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCreateRA = async (e) => {
    e.preventDefault();
    try {
      if (editingRA) {
        await axios.put(`/api/resultats-attendus/${editingRA.id}/`, {
          ...raFormData,
          objectif_specifique: selectedOS.id
        });
        setSuccessMessage('Résultat attendu modifié avec succès !');
      } else {
        await axios.post('/api/resultats-attendus/', {
          ...raFormData,
          objectif_specifique: selectedOS.id
        });
        setSuccessMessage('Résultat attendu créé avec succès !');
      }
      fetchStructure();
      resetRAForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création RA:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Édition
  const handleEditOG = (og) => {
    setEditingOG(og);
    setOgFormData({
      numero: og.numero,
      titre: og.titre,
      description: og.description || ''
    });
    setShowOGForm(true);
  };

  const handleEditOS = (os, og) => {
    setEditingOS(os);
    setSelectedOG(og);
    setOsFormData({
      numero: os.numero,
      titre: os.titre,
      description: os.description || ''
    });
    setShowOSForm(true);
  };

  const handleEditRA = (ra, os) => {
    setEditingRA(ra);
    setSelectedOS(os);
    setRaFormData({
      numero: ra.numero,
      description: ra.description
    });
    setShowRAForm(true);
  };

  // Suppression
  const handleDeleteOG = async (ogId) => {
    if (window.confirm('Supprimer cet objectif général et tous ses éléments associés ?')) {
      try {
        await axios.delete(`/api/objectifs-generaux/${ogId}/`);
        setSuccessMessage('Objectif général supprimé avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression OG:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteOS = async (osId) => {
    if (window.confirm('Supprimer cet objectif spécifique et tous ses résultats ?')) {
      try {
        await axios.delete(`/api/objectifs-specifiques/${osId}/`);
        setSuccessMessage('Objectif spécifique supprimé avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression OS:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteRA = async (raId) => {
    if (window.confirm('Supprimer ce résultat attendu ?')) {
      try {
        await axios.delete(`/api/resultats-attendus/${raId}/`);
        setSuccessMessage('Résultat attendu supprimé avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression RA:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Reset des formulaires
  const resetOGForm = () => {
    setOgFormData({ numero: '', titre: '', description: '' });
    setEditingOG(null);
    setShowOGForm(false);
  };

  const resetOSForm = () => {
    setOsFormData({ numero: '', titre: '', description: '' });
    setEditingOS(null);
    setSelectedOG(null);
    setShowOSForm(false);
  };

  const resetRAForm = () => {
    setRaFormData({ numero: '', description: '' });
    setEditingRA(null);
    setSelectedOS(null);
    setShowRAForm(false);
  };

  // Statistiques
  const stats = {
    totalOG: objectifsGeneraux.length,
    totalOS: objectifsGeneraux.reduce((sum, og) => sum + (og.objectifs_specifiques?.length || 0), 0),
    totalRA: objectifsGeneraux.reduce((sum, og) => 
      sum + (og.objectifs_specifiques?.reduce((osSum, os) => 
        osSum + (os.resultats_attendus?.length || 0), 0) || 0), 0
    )
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement de la structure logique...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <DocumentChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                    Structure Logique
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Hiérarchie des objectifs et résultats attendus
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => setShowOGForm(true)}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvel OG
            </motion.button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              icon={<DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              title="Objectifs Généraux"
              value={stats.totalOG}
              color="blue"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-green-600 dark:text-green-400">🎯</div>}
              title="Objectifs Spécifiques"
              value={stats.totalOS}
              color="green"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-purple-600 dark:text-purple-400">📊</div>}
              title="Résultats Attendus"
              value={stats.totalRA}
              color="purple"
            />
          </div>

          {/* Message de succès */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Structure Hiérarchique */}
          <div className="space-y-4">
            {objectifsGeneraux.map((og) => (
              <motion.div
                key={og.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Objectif Général */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 transition-all duration-200"
                  onClick={() => toggleOG(og.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {og.numero}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{og.titre}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{og.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{og.nb_objectifs_specifiques || 0} objectif(s) spécifique(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOG(og);
                          setShowOSForm(true);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Ajouter un OS"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOG(og);
                        }}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Modifier l'OG"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOG(og.id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Supprimer l'OG"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                      {expandedOG[og.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Objectifs Spécifiques */}
                <AnimatePresence>
                  {expandedOG[og.id] && og.objectifs_specifiques && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 dark:bg-gray-700/50"
                    >
                      {og.objectifs_specifiques.map((os) => (
                        <div key={os.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          {/* Objectif Spécifique */}
                          <div 
                            className="p-6 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleOS(os.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 ml-8">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {os.numero}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{os.titre}</h4>
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{os.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{os.nb_resultats || 0} résultat(s) attendu(s)</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOS(os);
                                    setShowRAForm(true);
                                  }}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  title="Ajouter un RA"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOS(os, og);
                                  }}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  title="Modifier l'OS"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOS(os.id);
                                  }}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  title="Supprimer l'OS"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </motion.button>
                                {expandedOS[os.id] ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Résultats Attendus */}
                          <AnimatePresence>
                            {expandedOS[os.id] && os.resultats_attendus && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-100 dark:bg-gray-600/30"
                              >
                                {os.resultats_attendus.map((ra) => (
                                  <div key={ra.id} className="p-4 border-b border-gray-300 dark:border-gray-500 last:border-b-0">
                                    <div className="flex items-center justify-between ml-16">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                          {ra.numero}
                                        </div>
                                        <div>
                                          <p className="text-gray-800 dark:text-gray-200 font-medium">{ra.description}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleEditRA(ra, os)}
                                          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                          title="Modifier le RA"
                                        >
                                          <PencilIcon className="h-3 w-3" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleDeleteRA(ra.id)}
                                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                          title="Supprimer le RA"
                                        >
                                          <TrashIcon className="h-3 w-3" />
                                        </motion.button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Messages si vide */}
          {objectifsGeneraux.length === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentChartBarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Aucun objectif général défini
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                Commencez par créer votre premier objectif général
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOGForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Créer un objectif général
              </motion.button>
            </div>
          )}

          {/* Formulaire Objectif Général */}
          <AnimatePresence>
            {showOGForm && (
              <FormModal
                title={editingOG ? 'Modifier Objectif Général' : 'Nouvel Objectif Général'}
                onClose={resetOGForm}
                onSubmit={handleCreateOG}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (OG1, OG2, OG3)"
                    value={ogFormData.numero}
                    onChange={(e) => setOgFormData({ ...ogFormData, numero: e.target.value })}
                    placeholder="OG1"
                    required
                  />
                  <FormInput
                    label="Titre"
                    value={ogFormData.titre}
                    onChange={(e) => setOgFormData({ ...ogFormData, titre: e.target.value })}
                    placeholder="Titre de l'objectif général"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={ogFormData.description}
                    onChange={(e) => setOgFormData({ ...ogFormData, description: e.target.value })}
                    placeholder="Description détaillée de l'objectif général"
                    rows={4}
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>

          {/* Formulaire Objectif Spécifique */}
          <AnimatePresence>
            {showOSForm && selectedOG && (
              <FormModal
                title={editingOS ? 'Modifier Objectif Spécifique' : `Nouvel Objectif Spécifique - ${selectedOG.numero}`}
                onClose={resetOSForm}
                onSubmit={handleCreateOS}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (OS1.1, OS1.2, etc.)"
                    value={osFormData.numero}
                    onChange={(e) => setOsFormData({ ...osFormData, numero: e.target.value })}
                    placeholder="OS1.1"
                    required
                  />
                  <FormInput
                    label="Titre"
                    value={osFormData.titre}
                    onChange={(e) => setOsFormData({ ...osFormData, titre: e.target.value })}
                    placeholder="Titre de l'objectif spécifique"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={osFormData.description}
                    onChange={(e) => setOsFormData({ ...osFormData, description: e.target.value })}
                    placeholder="Description détaillée de l'objectif spécifique"
                    rows={4}
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>

          {/* Formulaire Résultat Attendu */}
          <AnimatePresence>
            {showRAForm && selectedOS && (
              <FormModal
                title={editingRA ? 'Modifier Résultat Attendu' : `Nouveau Résultat Attendu - ${selectedOS.numero}`}
                onClose={resetRAForm}
                onSubmit={handleCreateRA}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (RA1.1.1, RA1.1.2, etc.)"
                    value={raFormData.numero}
                    onChange={(e) => setRaFormData({ ...raFormData, numero: e.target.value })}
                    placeholder="RA1.1.1"
                    required
                  />
                  <FormTextarea
                    label="Description du résultat"
                    value={raFormData.description}
                    onChange={(e) => setRaFormData({ ...raFormData, description: e.target.value })}
                    placeholder="Description détaillée du résultat attendu"
                    rows={4}
                    required
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

// Composants réutilisables
const FormModal = ({ title, children, onClose, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6">
        {children}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {title.includes('Modifier') ? 'Modifier' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  </motion.div>
);

const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <input
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
      {...props}
    />
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <textarea
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
      {...props}
    />
  </div>
);

const StatCard = ({ icon, title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 ${colorClasses[color]} rounded-xl`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default CadreLogique;