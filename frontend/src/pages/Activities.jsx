import React, { useState, useEffect } from 'react';
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

const Activities = () => {
  const [activites, setActivites] = useState([]);
  const [structures, setStructures] = useState([]);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [objectifsGeneraux, setObjectifsGeneraux] = useState([]);
  const [objectifsSpecifiques, setObjectifsSpecifiques] = useState([]);
  const [resultatsAttendus, setResultatsAttendus] = useState([]);
  const [pcopEntries, setPcopEntries] = useState([]);
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivite, setEditingActivite] = useState(null);
  const [selectedActivite, setSelectedActivite] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedObjectifGeneral, setSelectedObjectifGeneral] = useState('');
  const [selectedEtat, setSelectedEtat] = useState('');
  const [showRetardOnly, setShowRetardOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    objectif_general: '',
    objectif_specifique: '',
    resultat_attendu: '',
    structure: '',
    direction: '',
    service: '',
    division: '',
    activite: '',
    sous_activite: '',
    produits: '',
    cibles: '',
    sources_financement: '',
    pcop: '',
    cout_unitaire: '',
    quantite: '',
    montant: '',
    observation: '',
    etat: 'En cours',
    date_debut: '',
    date_fin: ''
  });

  const [suiviForm, setSuiviForm] = useState({
    activite: '',
    date_suivi: new Date().toISOString().split('T')[0],
    observation: '',
    avancement: 0
  });

  const [showSuiviForm, setShowSuiviForm] = useState(false);
  const [selectedActiviteForSuivi, setSelectedActiviteForSuivi] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        activitesRes, 
        structuresRes,
        directionsRes, 
        servicesRes, 
        divisionsRes,
        objectifsGenerauxRes, 
        objectifsSpecifiquesRes, 
        resultatsAttendusRes, 
        pcopRes,
        suivisRes
      ] = await Promise.all([
        axios.get('/api/activites/'),
        axios.get('/api/structures/'),
        axios.get('/api/directions/'),
        axios.get('/api/services/'),
        axios.get('/api/divisions/'),
        axios.get('/api/objectifs-generaux/'),
        axios.get('/api/objectifs-specifiques/'),
        axios.get('/api/resultats-attendus/'),
        axios.get('/api/pcop/'),
        axios.get('/api/suivis/')
      ]);
      setActivites(activitesRes.data);
      setStructures(structuresRes.data);
      setDirections(directionsRes.data);
      setServices(servicesRes.data);
      setDivisions(divisionsRes.data);
      setObjectifsGeneraux(objectifsGenerauxRes.data);
      setObjectifsSpecifiques(objectifsSpecifiquesRes.data);
      setResultatsAttendus(resultatsAttendusRes.data);
      setPcopEntries(pcopRes.data);
      setSuivis(suivisRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour auto-remplir le coût unitaire lorsqu'un PCOP est sélectionné
  const handlePcopChange = (pcopId) => {
    setFormData(prev => {
      const selectedPcop = pcopEntries.find(p => p.id.toString() === pcopId);
      
      if (selectedPcop && selectedPcop.cout_unitaire) {
        return {
          ...prev,
          pcop: pcopId,
          cout_unitaire: selectedPcop.cout_unitaire
        };
      }
      
      return {
        ...prev,
        pcop: pcopId
      };
    });
  };

  // Filtrer les directions par structure
  const filteredDirections = formData.structure 
    ? directions.filter(direction => direction.structure?.toString() === formData.structure)
    : [];

  // Filtrer les services par direction
  const filteredServices = formData.direction 
    ? services.filter(service => service.direction?.toString() === formData.direction)
    : [];

  // Filtrer les divisions par service
  const filteredDivisions = formData.service 
    ? divisions.filter(division => division.service?.toString() === formData.service)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        structure: formData.structure || null,
        direction: formData.direction || null,
        service: formData.service || null,
        division: formData.division || null,
        objectif_general: formData.objectif_general || null,
        objectif_specifique: formData.objectif_specifique || null,
        resultat_attendu: formData.resultat_attendu || null,
        pcop: formData.pcop || null,
        cout_unitaire: formData.cout_unitaire ? parseFloat(formData.cout_unitaire) : null,
        quantite: formData.quantite ? parseFloat(formData.quantite) : null,
        montant: formData.montant ? parseFloat(formData.montant) : null,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null
      };

      if (editingActivite) {
        await axios.put(`/api/activites/${editingActivite.id}/`, data);
        setSuccessMessage('Activité modifiée avec succès !');
      } else {
        await axios.post('/api/activites/', data);
        setSuccessMessage('Activité créée avec succès !');
      }
      
      fetchData();
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (activite) => {
    setEditingActivite(activite);
    setFormData({
      objectif_general: activite.objectif_general?.id || '',
      objectif_specifique: activite.objectif_specifique?.id || '',
      resultat_attendu: activite.resultat_attendu?.id || '',
      structure: activite.structure?.id || '',
      direction: activite.direction?.id || '',
      service: activite.service?.id || '',
      division: activite.division?.id || '',
      activite: activite.activite || '',
      sous_activite: activite.sous_activite || '',
      produits: activite.produits || '',
      cibles: activite.cibles || '',
      sources_financement: activite.sources_financement || '',
      pcop: activite.pcop?.id || '',
      cout_unitaire: activite.cout_unitaire || '',
      quantite: activite.quantite || '',
      montant: activite.montant || '',
      observation: activite.observation || '',
      etat: activite.etat || 'En cours',
      date_debut: activite.date_debut || '',
      date_fin: activite.date_fin || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      try {
        await axios.delete(`/api/activites/${id}/`);
        setSuccessMessage('Activité supprimée avec succès !');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleViewDetail = (activite) => {
    setSelectedActivite(activite);
    setShowDetail(true);
  };

  const handleAddSuivi = (activite) => {
    setSelectedActiviteForSuivi(activite);
    setSuiviForm({
      activite: activite.id,
      date_suivi: new Date().toISOString().split('T')[0],
      observation: '',
      avancement: activite.avancement || 0
    });
    setShowSuiviForm(true);
  };

  const handleSuiviSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/suivis/', suiviForm);
      setSuccessMessage('Suivi ajouté avec succès !');
      fetchData();
      setShowSuiviForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du suivi:', error);
      alert('Erreur lors de l\'ajout du suivi');
    }
  };

  const resetForm = () => {
    setFormData({
      objectif_general: '',
      objectif_specifique: '',
      resultat_attendu: '',
      structure: '',
      direction: '',
      service: '',
      division: '',
      activite: '',
      sous_activite: '',
      produits: '',
      cibles: '',
      sources_financement: '',
      pcop: '',
      cout_unitaire: '',
      quantite: '',
      montant: '',
      observation: '',
      etat: 'En cours',
      date_debut: '',
      date_fin: ''
    });
    setEditingActivite(null);
    setShowForm(false);
  };

  // Calcul automatique du montant
  const calculateMontant = () => {
    const cout = parseFloat(formData.cout_unitaire) || 0;
    const qte = parseFloat(formData.quantite) || 0;
    return cout * qte;
  };

  // Mise à jour automatique du montant
  useEffect(() => {
    if (formData.cout_unitaire || formData.quantite) {
      const nouveauMontant = calculateMontant();
      setFormData(prev => ({
        ...prev,
        montant: nouveauMontant || ''
      }));
    }
  }, [formData.cout_unitaire, formData.quantite]);

  // Fonction pour vérifier si une activité est en retard
  const isActiviteEnRetard = (activite) => {
    if (!activite.date_fin || activite.etat === 'Terminé') return false;
    const aujourdhui = new Date();
    const dateFin = new Date(activite.date_fin);
    return aujourdhui > dateFin;
  };

  // Fonction pour calculer les jours restants
  const getJoursRestants = (activite) => {
    if (!activite.date_fin) return null;
    const aujourdhui = new Date();
    const dateFin = new Date(activite.date_fin);
    const diffTime = dateFin - aujourdhui;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filtrage dynamique amélioré
  const filteredActivites = activites.filter(activite => {
    const matchesSearch = 
      activite.activite?.toLowerCase().includes(filter.toLowerCase()) ||
      activite.service_nom?.toLowerCase().includes(filter.toLowerCase()) ||
      activite.objectif_general?.toLowerCase().includes(filter.toLowerCase());

    const matchesService = !selectedService || activite.service?.id?.toString() === selectedService;
    const matchesObjectifGeneral = !selectedObjectifGeneral || activite.objectif_general?.id?.toString() === selectedObjectifGeneral;
    const matchesEtat = !selectedEtat || activite.etat === selectedEtat;
    const matchesRetard = !showRetardOnly || isActiviteEnRetard(activite);

    return matchesSearch && matchesService && matchesObjectifGeneral && matchesEtat && matchesRetard;
  });

  // Calcul des totaux
  const totalMontant = filteredActivites.reduce((sum, activite) => 
    sum + (parseFloat(activite.montant) || 0), 0
  );

  const activitesEnRetard = activites.filter(isActiviteEnRetard).length;

  const stats = {
    total: filteredActivites.length,
    enCours: filteredActivites.filter(a => a.etat === 'En cours').length,
    termine: filteredActivites.filter(a => a.etat === 'Terminé').length,
    avecPcop: filteredActivites.filter(a => a.pcop).length,
    enRetard: activitesEnRetard
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement des activités...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🧭 Header amélioré */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-gray-100 dark:to-gray-300">
                    Gestion des Activités
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {stats.total} activité(s) - Total: {totalMontant.toLocaleString()} Ar
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => setShowForm(true)}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvelle Activité
            </motion.button>
          </div>

          {/* 📊 Statistiques améliorées */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <StatCard 
              icon={<DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              title="Total Activités"
              value={stats.total}
              color="blue"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-yellow-600 dark:text-yellow-400">⏳</div>}
              title="En Cours"
              value={stats.enCours}
              color="yellow"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-green-600 dark:text-green-400">✅</div>}
              title="Terminées"
              value={stats.termine}
              color="green"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-purple-600 dark:text-purple-400">🎯</div>}
              title="Avec PCOP"
              value={stats.avecPcop}
              color="purple"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-indigo-600 dark:text-indigo-400">💰</div>}
              title="Budget Total"
              value={`${totalMontant.toLocaleString()} Ar`}
              color="indigo"
            />
            <StatCard 
              icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />}
              title="En Retard"
              value={stats.enRetard}
              color="red"
            />
          </div>

          {/* 🔍 Filtres améliorés */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtres et Recherche Avancée</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative md:col-span-2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Rechercher une activité, service ou objectif..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                />
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
              >
                <option value="">Tous les services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nom_service}
                  </option>
                ))}
              </select>
              <select
                value={selectedObjectifGeneral}
                onChange={(e) => setSelectedObjectifGeneral(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
              >
                <option value="">Tous les objectifs</option>
                {objectifsGeneraux.map((objectif) => (
                  <option key={objectif.id} value={objectif.id}>
                    {objectif.numero} - {objectif.titre?.substring(0, 50)}...
                  </option>
                ))}
              </select>
              <select
                value={selectedEtat}
                onChange={(e) => setSelectedEtat(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
              >
                <option value="">Tous les états</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulé</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilter('');
                    setSelectedService('');
                    setSelectedObjectifGeneral('');
                    setSelectedEtat('');
                    setShowRetardOnly(false);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowRetardOnly(!showRetardOnly)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    showRetardOnly 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300'
                  }`}
                >
                  Retard
                </button>
              </div>
            </div>
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

          {/* ✨ Formulaire modal amélioré */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={(e) => e.target === e.currentTarget && resetForm()}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {editingActivite ? 'Modifier l\'Activité' : 'Nouvelle Activité'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Structure Hiérarchique des Objectifs */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Structure Hiérarchique des Objectifs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            Objectif Général
                          </label>
                          <select
                            value={formData.objectif_general}
                            onChange={(e) => {
                              setFormData({ 
                                ...formData, 
                                objectif_general: e.target.value,
                                objectif_specifique: '',
                                resultat_attendu: ''
                              });
                            }}
                            className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          >
                            <option value="">Sélectionner un objectif général</option>
                            {objectifsGeneraux.map((obj) => (
                              <option key={obj.id} value={obj.id}>
                                {obj.numero} - {obj.titre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            Objectif Spécifique
                          </label>
                          <select
                            value={formData.objectif_specifique}
                            onChange={(e) => {
                              setFormData({ 
                                ...formData, 
                                objectif_specifique: e.target.value,
                                resultat_attendu: ''
                              });
                            }}
                            className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            disabled={!formData.objectif_general}
                          >
                            <option value="">Sélectionner un objectif spécifique</option>
                            {objectifsSpecifiques
                              .filter(obj => obj.objectif_general?.toString() === formData.objectif_general)
                              .map((obj) => (
                                <option key={obj.id} value={obj.id}>
                                  {obj.numero} - {obj.titre}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            Résultat Attendu
                          </label>
                          <select
                            value={formData.resultat_attendu}
                            onChange={(e) => setFormData({ ...formData, resultat_attendu: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            disabled={!formData.objectif_specifique}
                          >
                            <option value="">Sélectionner un résultat attendu</option>
                            {resultatsAttendus
                              .filter(ra => ra.objectif_specifique?.toString() === formData.objectif_specifique)
                              .map((ra) => (
                                <option key={ra.id} value={ra.id}>
                                  {ra.numero} - {ra.description.substring(0, 80)}...
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Structure Organisationnelle Complète */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">Structure Organisationnelle</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            Structure
                          </label>
                          <select
                            value={formData.structure}
                            onChange={(e) => {
                              setFormData({ 
                                ...formData, 
                                structure: e.target.value,
                                direction: '',
                                service: '',
                                division: ''
                              });
                            }}
                            className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          >
                            <option value="">Sélectionner une structure</option>
                            {structures.map((structure) => (
                              <option key={structure.id} value={structure.id}>
                                {structure.numero} - {structure.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            Direction
                          </label>
                          <select
                            value={formData.direction}
                            onChange={(e) => {
                              setFormData({ 
                                ...formData, 
                                direction: e.target.value,
                                service: '',
                                division: ''
                              });
                            }}
                            className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            disabled={!formData.structure}
                          >
                            <option value="">Sélectionner une direction</option>
                            {filteredDirections.map((direction) => (
                              <option key={direction.id} value={direction.id}>
                                {direction.numero} - {direction.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            Service
                          </label>
                          <select
                            value={formData.service}
                            onChange={(e) => {
                              setFormData({ 
                                ...formData, 
                                service: e.target.value,
                                division: ''
                              });
                            }}
                            className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            disabled={!formData.direction}
                          >
                            <option value="">Sélectionner un service</option>
                            {filteredServices.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.numero} - {service.nom_service}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            Division
                          </label>
                          <select
                            value={formData.division}
                            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            disabled={!formData.service}
                          >
                            <option value="">Sélectionner une division</option>
                            {filteredDivisions.map((division) => (
                              <option key={division.id} value={division.id}>
                                {division.numero} - {division.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dates de début et fin */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">Planning de l'Activité</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                            Date de Début
                          </label>
                          <input
                            type="date"
                            value={formData.date_debut}
                            onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                            Date de Fin Prévue
                          </label>
                          <input
                            type="date"
                            value={formData.date_fin}
                            onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          />
                        </div>
                      </div>
                      {formData.date_debut && formData.date_fin && (
                        <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            <CalendarIcon className="h-4 w-4 inline mr-1" />
                            Durée prévue: {Math.ceil((new Date(formData.date_fin) - new Date(formData.date_debut)) / (1000 * 60 * 60 * 24))} jours
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Colonne 1 */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Activité *
                          </label>
                          <textarea
                            required
                            value={formData.activite}
                            onChange={(e) => setFormData({ ...formData, activite: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none transition-all duration-300"
                            placeholder="Description détaillée de l'activité..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Sous-activité
                          </label>
                          <textarea
                            value={formData.sous_activite}
                            onChange={(e) => setFormData({ ...formData, sous_activite: e.target.value })}
                            rows="2"
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none transition-all duration-300"
                            placeholder="Sous-activités détaillées..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Produits *
                          </label>
                          <textarea
                            required
                            value={formData.produits}
                            onChange={(e) => setFormData({ ...formData, produits: e.target.value })}
                            rows="2"
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none transition-all duration-300"
                            placeholder="Produits ou livrables attendus..."
                          />
                        </div>
                      </div>

                      {/* Colonne 2 */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            État
                          </label>
                          <select
                            value={formData.etat}
                            onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          >
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                            <option value="En attente">En attente</option>
                            <option value="Annulé">Annulé</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Coût Unitaire (Ar)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.cout_unitaire}
                              onChange={(e) => setFormData({ ...formData, cout_unitaire: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Quantité
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.quantite}
                              onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Montant Total (Ar)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.montant}
                            onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 bg-gray-50 dark:bg-gray-600 transition-all duration-300"
                            placeholder="Calculé automatiquement"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Calculé automatiquement à partir du coût unitaire et de la quantité
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cibles
                          </label>
                          <input
                            type="text"
                            value={formData.cibles}
                            onChange={(e) => setFormData({ ...formData, cibles: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                            placeholder="Bénéficiaires ou cibles de l'activité..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Champs additionnels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Sources de Financement
                        </label>
                        <input
                          type="text"
                          value={formData.sources_financement}
                          onChange={(e) => setFormData({ ...formData, sources_financement: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                          placeholder="Sources de financement..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Code PCOP
                        </label>
                        <select
                          value={formData.pcop}
                          onChange={(e) => handlePcopChange(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                        >
                          <option value="">Sélectionner un code PCOP</option>
                          {pcopEntries.map((pcop) => (
                            <option key={pcop.id} value={pcop.id}>
                              {pcop.code} - {pcop.libelle} {pcop.cout_unitaire ? `(${parseFloat(pcop.cout_unitaire).toLocaleString()} Ar)` : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Choisissez parmi les codes PCOP existants
                        </p>
                        
                        {/* Afficher les informations du PCOP sélectionné */}
                        {formData.pcop && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-2">
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                              Informations PCOP sélectionné:
                            </h4>
                            {(() => {
                              const selectedPcop = pcopEntries.find(p => p.id.toString() === formData.pcop);
                              return selectedPcop ? (
                                <div className="text-sm text-blue-700 dark:text-blue-400">
                                  <p><strong>Code:</strong> {selectedPcop.code}</p>
                                  <p><strong>Libellé:</strong> {selectedPcop.libelle}</p>
                                  {selectedPcop.cout_unitaire && (
                                    <p><strong>Coût Unitaire:</strong> {parseFloat(selectedPcop.cout_unitaire).toLocaleString()} Ar</p>
                                  )}
                                  {selectedPcop.cout_unitaire && (
                                    <p className="text-green-600 dark:text-green-400 font-semibold">
                                      ✓ Coût unitaire auto-rempli
                                    </p>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Observation
                      </label>
                      <textarea
                        value={formData.observation}
                        onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none transition-all duration-300"
                        placeholder="Observations supplémentaires..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300"
                      >
                        {editingActivite ? 'Modifier l\'Activité' : 'Créer l\'Activité'}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetForm}
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-300"
                      >
                        Annuler
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal d'ajout de suivi */}
          <AnimatePresence>
            {showSuiviForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSuiviForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Ajouter un Suivi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedActiviteForSuivi?.activite}
                    </p>
                  </div>
                  <form onSubmit={handleSuiviSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date du Suivi
                      </label>
                      <input
                        type="date"
                        value={suiviForm.date_suivi}
                        onChange={(e) => setSuiviForm({ ...suiviForm, date_suivi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Avancement (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={suiviForm.avancement}
                        onChange={(e) => setSuiviForm({ ...suiviForm, avancement: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {suiviForm.avancement}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Observation
                      </label>
                      <textarea
                        value={suiviForm.observation}
                        onChange={(e) => setSuiviForm({ ...suiviForm, observation: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                        placeholder="Observations sur l'avancement..."
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSuiviForm(false)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 📋 Liste des activités améliorée */}
          <div className="backdrop-blur-2xl bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/40 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200/70 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-blue-900/20">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Liste des Activités <span className="text-blue-600 dark:text-blue-400">({filteredActivites.length})</span>
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Montant total: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalMontant.toLocaleString()} Ar</span>
                </div>
              </div>
            </div>
            
            {filteredActivites.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  {filter || selectedService || selectedObjectifGeneral ? 'Aucune activité trouvée' : 'Aucune activité enregistrée'}
                </h4>
                <p className="text-gray-400 dark:text-gray-500 mb-4">
                  {filter || selectedService || selectedObjectifGeneral ? 'Essayez avec d\'autres critères de recherche' : 'Commencez par créer votre première activité'}
                </p>
                {!filter && !selectedService && !selectedObjectifGeneral && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Créer une activité
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Activité
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Planning
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Objectif Général
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Code PCOP
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        État
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 dark:bg-gray-800/60 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredActivites.map((activite) => {
                      const estEnRetard = isActiviteEnRetard(activite);
                      const joursRestants = getJoursRestants(activite);
                      const suivisActivite = suivis.filter(s => s.activite === activite.id);
                      const dernierSuivi = suivisActivite[suivisActivite.length - 1];

                      return (
                        <motion.tr
                          key={activite.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition group ${
                            estEnRetard ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                  {activite.activite}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                  {activite.sous_activite}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {activite.date_debut && activite.date_fin ? (
                                <div>
                                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    {new Date(activite.date_debut).toLocaleDateString()} - {new Date(activite.date_fin).toLocaleDateString()}
                                  </div>
                                  {joursRestants !== null && (
                                    <div className={`flex items-center mt-1 text-xs font-semibold ${
                                      estEnRetard 
                                        ? 'text-red-600 dark:text-red-400'
                                        : joursRestants <= 7 
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                      {estEnRetard ? `En retard (${Math.abs(joursRestants)}j)` : `${joursRestants} jours restants`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-sm">Non planifié</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                              {activite.objectif_general_titre?.substring(0, 60)}...
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {activite.pcop_code ? (
                                <div>
                                  <div className="font-semibold text-blue-600 dark:text-blue-400">{activite.pcop_code}</div>
                                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                                    {activite.pcop_libelle?.substring(0, 50)}...
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic">Non assigné</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {activite.service_nom || 'Non assigné'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {parseFloat(activite.montant || 0).toLocaleString()} Ar
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                activite.etat === 'Terminé' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : activite.etat === 'En cours'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : activite.etat === 'En attente'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {activite.etat}
                              </span>
                              {dernierSuivi && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Avancement: {dernierSuivi.avancement}%
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleViewDetail(activite)}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAddSuivi(activite)}
                                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                                title="Ajouter un suivi"
                              >
                                <ChartBarIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(activite)}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(activite.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détail amélioré */}
      <AnimatePresence>
        {showDetail && selectedActivite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Détails de l'Activité</h3>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* En-tête avec statut de retard */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedActivite.activite}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedActivite.service_nom || 'Non assigné'}</p>
                    {isActiviteEnRetard(selectedActivite) && (
                      <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">Activité en retard !</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations de planning */}
                {(selectedActivite.date_debut || selectedActivite.date_fin) && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3">Planning</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Date de début:</span>
                        <p className="text-purple-600 dark:text-purple-300 mt-1">
                          {selectedActivite.date_debut ? new Date(selectedActivite.date_debut).toLocaleDateString() : 'Non spécifiée'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Date de fin prévue:</span>
                        <p className="text-purple-600 dark:text-purple-300 mt-1">
                          {selectedActivite.date_fin ? new Date(selectedActivite.date_fin).toLocaleDateString() : 'Non spécifiée'}
                        </p>
                      </div>
                      {getJoursRestants(selectedActivite) !== null && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-purple-700 dark:text-purple-400">Statut:</span>
                          <p className={`mt-1 font-semibold ${
                            isActiviteEnRetard(selectedActivite)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isActiviteEnRetard(selectedActivite)
                              ? `En retard (${Math.abs(getJoursRestants(selectedActivite))} jours)`
                              : `${getJoursRestants(selectedActivite)} jours restants`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations PCOP */}
                {selectedActivite.pcop_code && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">Code PCOP Associé</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Code:</span>
                        <p className="text-green-600 dark:text-green-300 mt-1 font-semibold">{selectedActivite.pcop_code}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Libellé:</span>
                        <p className="text-green-600 dark:text-green-300 mt-1">{selectedActivite.pcop_libelle}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Structure" value={selectedActivite.structure_nom} />
                  <DetailItem label="Direction" value={selectedActivite.direction_nom} />
                  <DetailItem label="Division" value={selectedActivite.division_nom} />
                  <DetailItem label="Sous-activité" value={selectedActivite.sous_activite} />
                  <DetailItem label="Produits" value={selectedActivite.produits} />
                  <DetailItem label="Cibles" value={selectedActivite.cibles} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Coût Unitaire</h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedActivite.cout_unitaire ? `${parseFloat(selectedActivite.cout_unitaire).toLocaleString()} Ar` : '0 Ar'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Quantité</h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedActivite.quantite || '0'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Montant Total</h4>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedActivite.montant ? `${parseFloat(selectedActivite.montant).toLocaleString()} Ar` : '0 Ar'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Sources de Financement" value={selectedActivite.sources_financement} />
                  <DetailItem label="Observation" value={selectedActivite.observation} />
                </div>

                {/* Historique des suivis */}
                {suivis.filter(s => s.activite === selectedActivite.id).length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Historique des Suivis</h4>
                    <div className="space-y-3">
                      {suivis
                        .filter(s => s.activite === selectedActivite.id)
                        .sort((a, b) => new Date(b.date_suivi) - new Date(a.date_suivi))
                        .slice(0, 3)
                        .map((suivi, index) => (
                          <div key={suivi.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {new Date(suivi.date_suivi).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {suivi.observation || 'Aucune observation'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              suivi.avancement >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              suivi.avancement >= 50 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              suivi.avancement >= 25 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {suivi.avancement}%
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    handleEdit(selectedActivite);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleAddSuivi(selectedActivite)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ajouter Suivi
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

// Composants auxiliaires
const StatCard = ({ icon, title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
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

const DetailItem = ({ label, value }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{label}</h4>
    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[60px]">
      {value || <span className="text-gray-400 dark:text-gray-500 italic">Non spécifié</span>}
    </p>
  </div>
);

export default Activities;