// src/pages/Services.jsx
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
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const Services = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStructures, setExpandedStructures] = useState({});
  const [expandedDirections, setExpandedDirections] = useState({});
  const [expandedServices, setExpandedServices] = useState({});
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [showDirectionForm, setShowDirectionForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showDivisionForm, setShowDivisionForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [editingDirection, setEditingDirection] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingDivision, setEditingDivision] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // États pour les formulaires
  const [structureFormData, setStructureFormData] = useState({ 
    numero: '', 
    nom: '', 
    description: '' 
  });
  const [directionFormData, setDirectionFormData] = useState({ 
    numero: '', 
    nom: '', 
    description: '' 
  });
  const [serviceFormData, setServiceFormData] = useState({ 
    numero: '', 
    nom_service: '', 
    description: '' 
  });
  const [divisionFormData, setDivisionFormData] = useState({ 
    numero: '', 
    nom: '', 
    description: '' 
  });

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/structures/');
      setStructures(response.data);
      
      // Développer la première structure par défaut
      if (response.data.length > 0) {
        setExpandedStructures({ [response.data[0].id]: true });
      }
    } catch (error) {
      console.error('Erreur chargement structure:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'expansion
  const toggleStructure = (structureId) => {
    setExpandedStructures(prev => ({ ...prev, [structureId]: !prev[structureId] }));
  };

  const toggleDirection = (directionId) => {
    setExpandedDirections(prev => ({ ...prev, [directionId]: !prev[directionId] }));
  };

  const toggleService = (serviceId) => {
    setExpandedServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  // CRUD pour Structures
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      if (editingStructure) {
        await axios.put(`/api/structures/${editingStructure.id}/`, structureFormData);
        setSuccessMessage('Structure modifiée avec succès !');
      } else {
        await axios.post('/api/structures/', structureFormData);
        setSuccessMessage('Structure créée avec succès !');
      }
      fetchStructure();
      resetStructureForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création structure:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // CRUD pour Directions
  const handleCreateDirection = async (e) => {
    e.preventDefault();
    try {
      if (editingDirection) {
        await axios.put(`/api/directions/${editingDirection.id}/`, {
          ...directionFormData,
          structure: selectedStructure.id
        });
        setSuccessMessage('Direction modifiée avec succès !');
      } else {
        await axios.post('/api/directions/', {
          ...directionFormData,
          structure: selectedStructure.id
        });
        setSuccessMessage('Direction créée avec succès !');
      }
      fetchStructure();
      resetDirectionForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création direction:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`/api/services/${editingService.id}/`, {
          ...serviceFormData,
          direction: selectedDirection.id
        });
        setSuccessMessage('Service modifié avec succès !');
      } else {
        await axios.post('/api/services/', {
          ...serviceFormData,
          direction: selectedDirection.id
        });
        setSuccessMessage('Service créé avec succès !');
      }
      fetchStructure();
      resetServiceForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création service:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    try {
      if (editingDivision) {
        await axios.put(`/api/divisions/${editingDivision.id}/`, {
          ...divisionFormData,
          service: selectedService.id
        });
        setSuccessMessage('Division modifiée avec succès !');
      } else {
        await axios.post('/api/divisions/', {
          ...divisionFormData,
          service: selectedService.id
        });
        setSuccessMessage('Division créée avec succès !');
      }
      fetchStructure();
      resetDivisionForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création division:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Édition
  const handleEditStructure = (structure) => {
    setEditingStructure(structure);
    setStructureFormData({
      numero: structure.numero,
      nom: structure.nom,
      description: structure.description || ''
    });
    setShowStructureForm(true);
  };

  const handleEditDirection = (direction, structure) => {
    setEditingDirection(direction);
    setSelectedStructure(structure);
    setDirectionFormData({
      numero: direction.numero,
      nom: direction.nom,
      description: direction.description || ''
    });
    setShowDirectionForm(true);
  };

  const handleEditService = (service, direction) => {
    setEditingService(service);
    setSelectedDirection(direction);
    setServiceFormData({
      numero: service.numero,
      nom_service: service.nom_service,
      description: service.description || ''
    });
    setShowServiceForm(true);
  };

  const handleEditDivision = (division, service) => {
    setEditingDivision(division);
    setSelectedService(service);
    setDivisionFormData({
      numero: division.numero,
      nom: division.nom,
      description: division.description || ''
    });
    setShowDivisionForm(true);
  };

  // Suppression
  const handleDeleteStructure = async (structureId) => {
    if (window.confirm('Supprimer cette structure et tous ses éléments associés ?')) {
      try {
        await axios.delete(`/api/structures/${structureId}/`);
        setSuccessMessage('Structure supprimée avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression structure:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteDirection = async (directionId) => {
    if (window.confirm('Supprimer cette direction et tous ses services ?')) {
      try {
        await axios.delete(`/api/directions/${directionId}/`);
        setSuccessMessage('Direction supprimée avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression direction:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Supprimer ce service et toutes ses divisions ?')) {
      try {
        await axios.delete(`/api/services/${serviceId}/`);
        setSuccessMessage('Service supprimé avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression service:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteDivision = async (divisionId) => {
    if (window.confirm('Supprimer cette division ?')) {
      try {
        await axios.delete(`/api/divisions/${divisionId}/`);
        setSuccessMessage('Division supprimée avec succès !');
        fetchStructure();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression division:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Reset des formulaires
  const resetStructureForm = () => {
    setStructureFormData({ numero: '', nom: '', description: '' });
    setEditingStructure(null);
    setShowStructureForm(false);
  };

  const resetDirectionForm = () => {
    setDirectionFormData({ numero: '', nom: '', description: '' });
    setEditingDirection(null);
    setSelectedStructure(null);
    setShowDirectionForm(false);
  };

  const resetServiceForm = () => {
    setServiceFormData({ numero: '', nom_service: '', description: '' });
    setEditingService(null);
    setSelectedDirection(null);
    setShowServiceForm(false);
  };

  const resetDivisionForm = () => {
    setDivisionFormData({ numero: '', nom: '', description: '' });
    setEditingDivision(null);
    setSelectedService(null);
    setShowDivisionForm(false);
  };

  // Statistiques
  const stats = {
    totalStructures: structures.length,
    totalDirections: structures.reduce((sum, structure) => sum + (structure.directions?.length || 0), 0),
    totalServices: structures.reduce((sum, structure) => 
      sum + (structure.directions?.reduce((dirSum, direction) => 
        dirSum + (direction.services?.length || 0), 0) || 0), 0
    ),
    totalDivisions: structures.reduce((sum, structure) => 
      sum + (structure.directions?.reduce((dirSum, direction) => 
        dirSum + (direction.services?.reduce((serviceSum, service) => 
          serviceSum + (service.divisions?.length || 0), 0) || 0), 0) || 0), 0
    )
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement de la structure organisationnelle...</p>
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
                  <BuildingLibraryIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                    Structure Organisationnelle
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Hiérarchie Structure / Direction / Service / Division
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => setShowStructureForm(true)}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvelle Structure
            </motion.button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              title="Structures"
              value={stats.totalStructures}
              color="blue"
            />
            <StatCard 
              icon={<BuildingOfficeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />}
              title="Directions"
              value={stats.totalDirections}
              color="green"
            />
            <StatCard 
              icon={<DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              title="Services"
              value={stats.totalServices}
              color="purple"
            />
            <StatCard 
              icon={<div className="h-6 w-6 text-orange-600 dark:text-orange-400">🏢</div>}
              title="Divisions"
              value={stats.totalDivisions}
              color="orange"
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
            {structures.map((structure) => (
              <motion.div
                key={structure.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Structure */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 transition-all duration-200"
                  onClick={() => toggleStructure(structure.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {structure.numero}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{structure.nom}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{structure.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{structure.directions?.length || 0} direction(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStructure(structure);
                          setShowDirectionForm(true);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Ajouter une direction"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStructure(structure);
                        }}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Modifier la structure"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStructure(structure.id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Supprimer la structure"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                      {expandedStructures[structure.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Directions */}
                <AnimatePresence>
                  {expandedStructures[structure.id] && structure.directions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 dark:bg-gray-700/50"
                    >
                      {structure.directions.map((direction) => (
                        <div key={direction.id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          {/* Direction */}
                          <div 
                            className="p-6 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleDirection(direction.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 ml-8">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {direction.numero}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{direction.nom}</h4>
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{direction.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{direction.services?.length || 0} service(s)</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDirection(direction);
                                    setShowServiceForm(true);
                                  }}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  title="Ajouter un service"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditDirection(direction, structure);
                                  }}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  title="Modifier la direction"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDirection(direction.id);
                                  }}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  title="Supprimer la direction"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </motion.button>
                                {expandedDirections[direction.id] ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Services */}
                          <AnimatePresence>
                            {expandedDirections[direction.id] && direction.services && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-100 dark:bg-gray-600/30"
                              >
                                {direction.services.map((service) => (
                                  <div key={service.id} className="border-b border-gray-300 dark:border-gray-500 last:border-b-0">
                                    {/* Service */}
                                    <div 
                                      className="p-6 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                      onClick={() => toggleService(service.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 ml-16">
                                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                            {service.numero}
                                          </div>
                                          <div>
                                            <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200">{service.nom_service}</h5>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{service.description}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                              <span>{service.divisions?.length || 0} division(s)</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedService(service);
                                              setShowDivisionForm(true);
                                            }}
                                            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                            title="Ajouter une division"
                                          >
                                            <PlusIcon className="h-4 w-4" />
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditService(service, direction);
                                            }}
                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            title="Modifier le service"
                                          >
                                            <PencilIcon className="h-4 w-4" />
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteService(service.id);
                                            }}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            title="Supprimer le service"
                                          >
                                            <TrashIcon className="h-4 w-4" />
                                          </motion.button>
                                          {expandedServices[service.id] ? (
                                            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                          ) : (
                                            <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Divisions */}
                                    <AnimatePresence>
                                      {expandedServices[service.id] && service.divisions && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="bg-gray-200 dark:bg-gray-500/30"
                                        >
                                          {service.divisions.map((division) => (
                                            <div key={division.id} className="p-4 border-b border-gray-300 dark:border-gray-500 last:border-b-0">
                                              <div className="flex items-center justify-between ml-24">
                                                <div className="flex items-center space-x-3">
                                                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                                    {division.numero}
                                                  </div>
                                                  <div>
                                                    <h6 className="text-gray-800 dark:text-gray-200 font-medium">{division.nom}</h6>
                                                    <p className="text-gray-600 dark:text-gray-300 text-xs">{division.description}</p>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEditDivision(division, service)}
                                                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    title="Modifier la division"
                                                  >
                                                    <PencilIcon className="h-3 w-3" />
                                                  </motion.button>
                                                  <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDeleteDivision(division.id)}
                                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    title="Supprimer la division"
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
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Messages si vide */}
          {structures.length === 0 && !loading && (
            <div className="text-center py-12">
              <BuildingLibraryIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Aucune structure définie
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                Commencez par créer votre première structure
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStructureForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Créer une structure
              </motion.button>
            </div>
          )}

          {/* Formulaire Structure */}
          <AnimatePresence>
            {showStructureForm && (
              <FormModal
                title={editingStructure ? 'Modifier Structure' : 'Nouvelle Structure'}
                onClose={resetStructureForm}
                onSubmit={handleCreateStructure}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (STR1, STR2, etc.)"
                    value={structureFormData.numero}
                    onChange={(e) => setStructureFormData({ ...structureFormData, numero: e.target.value })}
                    placeholder="STR1"
                    required
                  />
                  <FormInput
                    label="Nom de la structure"
                    value={structureFormData.nom}
                    onChange={(e) => setStructureFormData({ ...structureFormData, nom: e.target.value })}
                    placeholder="Structure Principale"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={structureFormData.description}
                    onChange={(e) => setStructureFormData({ ...structureFormData, description: e.target.value })}
                    placeholder="Description de la structure et son rôle"
                    rows={4}
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>

          {/* Formulaire Direction */}
          <AnimatePresence>
            {showDirectionForm && selectedStructure && (
              <FormModal
                title={editingDirection ? 'Modifier Direction' : `Nouvelle Direction - ${selectedStructure.numero}`}
                onClose={resetDirectionForm}
                onSubmit={handleCreateDirection}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (D1, D2, D3)"
                    value={directionFormData.numero}
                    onChange={(e) => setDirectionFormData({ ...directionFormData, numero: e.target.value })}
                    placeholder="D1"
                    required
                  />
                  <FormInput
                    label="Nom de la direction"
                    value={directionFormData.nom}
                    onChange={(e) => setDirectionFormData({ ...directionFormData, nom: e.target.value })}
                    placeholder="Direction Générale"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={directionFormData.description}
                    onChange={(e) => setDirectionFormData({ ...directionFormData, description: e.target.value })}
                    placeholder="Description de la direction et ses responsabilités"
                    rows={4}
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>

          {/* Formulaire Service */}
          <AnimatePresence>
            {showServiceForm && selectedDirection && (
              <FormModal
                title={editingService ? 'Modifier Service' : `Nouveau Service - ${selectedDirection.numero}`}
                onClose={resetServiceForm}
                onSubmit={handleCreateService}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (S1.1, S1.2, etc.)"
                    value={serviceFormData.numero}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, numero: e.target.value })}
                    placeholder="S1.1"
                    required
                  />
                  <FormInput
                    label="Nom du service"
                    value={serviceFormData.nom_service}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, nom_service: e.target.value })}
                    placeholder="Service Informatique"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    placeholder="Description du service et ses missions"
                    rows={4}
                  />
                </div>
              </FormModal>
            )}
          </AnimatePresence>

          {/* Formulaire Division */}
          <AnimatePresence>
            {showDivisionForm && selectedService && (
              <FormModal
                title={editingDivision ? 'Modifier Division' : `Nouvelle Division - ${selectedService.numero}`}
                onClose={resetDivisionForm}
                onSubmit={handleCreateDivision}
              >
                <div className="space-y-4">
                  <FormInput
                    label="Numéro (DV1.1.1, DV1.1.2, etc.)"
                    value={divisionFormData.numero}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, numero: e.target.value })}
                    placeholder="DV1.1.1"
                    required
                  />
                  <FormInput
                    label="Nom de la division"
                    value={divisionFormData.nom}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, nom: e.target.value })}
                    placeholder="Division Réseaux"
                    required
                  />
                  <FormTextarea
                    label="Description"
                    value={divisionFormData.description}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, description: e.target.value })}
                    placeholder="Description de la division et ses activités"
                    rows={4}
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

// Composants réutilisables (inchangés)
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
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
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

export default Services;