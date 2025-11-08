import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const Pcop = () => {
  const [pcopEntries, setPcopEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    cout_unitaire: '' // ✅ CHANGÉ: budget -> cout_unitaire
  });

  useEffect(() => {
    fetchPcopEntries();
  }, []);

  const fetchPcopEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pcop/');
      setPcopEntries(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, cout_unitaire: parseFloat(formData.cout_unitaire) || 0 }; // ✅ CHANGÉ
      if (editingEntry) {
        await axios.put(`/api/pcop/${editingEntry.id}/`, data);
      } else {
        await axios.post('/api/pcop/', data);
      }
      fetchPcopEntries();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      code: entry.code || '',
      libelle: entry.libelle || '',
      cout_unitaire: entry.cout_unitaire || '' // ✅ CHANGÉ
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code PCOP ?')) {
      try {
        await axios.delete(`/api/pcop/${id}/`);
        fetchPcopEntries();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleViewDetail = (entry) => {
    setSelectedEntry(entry);
    setShowDetail(true);
  };

  const resetForm = () => {
    setFormData({ code: '', libelle: '', cout_unitaire: '' }); // ✅ CHANGÉ
    setEditingEntry(null);
    setShowForm(false);
  };

  const filteredEntries = pcopEntries.filter(entry =>
    entry.code?.toLowerCase().includes(filter.toLowerCase()) ||
    entry.libelle?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalCoutUnitaire = filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry.cout_unitaire) || 0), 0); // ✅ CHANGÉ
  const avgCoutUnitaire = filteredEntries.length > 0 ? totalCoutUnitaire / filteredEntries.length : 0; // ✅ CHANGÉ

  const stats = {
    total: filteredEntries.length,
    avecCoutUnitaire: filteredEntries.filter(entry => parseFloat(entry.cout_unitaire) > 0).length, // ✅ CHANGÉ
    sansCoutUnitaire: filteredEntries.filter(entry => !parseFloat(entry.cout_unitaire) || parseFloat(entry.cout_unitaire) === 0).length // ✅ CHANGÉ
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-gray-100 dark:to-gray-300">
                    Codes PCOP
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Gestion des codes et coûts unitaires PCOP - {stats.total} code(s) enregistré(s)
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
              Nouveau Code
            </motion.button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/** Total Codes */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Codes</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                </div>
              </div>
            </div>
            {/** Coût Unitaire Total */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-200" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Coût Unitaire Total</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCoutUnitaire.toLocaleString()} Ar
                  </p>
                </div>
              </div>
            </div>
            {/** Moyenne */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                  <div className="h-6 w-6 text-yellow-600 dark:text-yellow-200">📈</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne Coût</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {avgCoutUnitaire.toLocaleString()} Ar
                  </p>
                </div>
              </div>
            </div>
            {/** Avec Coût Unitaire */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                  <div className="h-6 w-6 text-purple-600 dark:text-purple-200">💰</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avec Coût Unitaire</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avecCoutUnitaire}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Rechercher un code ou libellé PCOP..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                />
              </div>
              <button
                onClick={() => setFilter('')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Tableau des codes PCOP */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste des Codes PCOP ({filteredEntries.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Chargement des codes PCOP...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-12 text-center">
                <CurrencyDollarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  {filter ? 'Aucun code trouvé' : 'Aucun code PCOP enregistré'}
                </h4>
                <p className="text-gray-400 dark:text-gray-500 mb-4">
                  {filter ? 'Essayez avec d\'autres critères de recherche' : 'Commencez par créer votre premier code PCOP'}
                </p>
                {!filter && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Créer un code PCOP
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Libellé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Coût Unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEntries.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {entry.code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            {entry.libelle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {entry.cout_unitaire ? `${parseFloat(entry.cout_unitaire).toLocaleString()} Ar` : '0 Ar'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewDetail(entry)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(entry)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Formulaire Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={resetForm}
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {editingEntry ? 'Modifier le Code PCOP' : 'Nouveau Code PCOP'}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code PCOP *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Ex: 411.01.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Libellé *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.libelle}
                        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Description du code PCOP"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Coût Unitaire (Ar)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cout_unitaire}
                        onChange={(e) => setFormData({ ...formData, cout_unitaire: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        {editingEntry ? 'Modifier' : 'Créer'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal de détail */}
          <AnimatePresence>
            {showDetail && selectedEntry && (
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
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Détails du Code PCOP</h3>
                      <button
                        onClick={() => setShowDetail(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {selectedEntry.code?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedEntry.code}</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedEntry.libelle}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Coût Unitaire Alloué</h5>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {selectedEntry.cout_unitaire ? `${parseFloat(selectedEntry.cout_unitaire).toLocaleString()} Ar` : '0 Ar'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Statut</h5>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {selectedEntry.cout_unitaire > 0 ? 'Avec Coût Unitaire' : 'Sans Coût Unitaire'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        handleEdit(selectedEntry);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Pcop;