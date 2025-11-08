import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import Layout from "../components/Layout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [activites, setActivites] = useState([]);
  const [structures, setStructures] = useState([]);
  const [directions, setDirections] = useState([]);
  const [objectifsGeneraux, setObjectifsGeneraux] = useState([]);
  const [pcopEntries, setPcopEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all"); // all, month, quarter, year

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, activiteRes, structureRes, directionRes, objectifRes, pcopRes] = await Promise.all([
        axios.get("/api/services/"),
        axios.get("/api/activites/"),
        axios.get("/api/structures/"),
        axios.get("/api/directions/"),
        axios.get("/api/objectifs-generaux/"),
        axios.get("/api/pcop/"),
      ]);
      setServices(serviceRes.data);
      setActivites(activiteRes.data);
      setStructures(structureRes.data);
      setDirections(directionRes.data);
      setObjectifsGeneraux(objectifRes.data);
      setPcopEntries(pcopRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour obtenir le texte d'affichage sécurisé
  const getDisplayText = (obj, fallback = 'Non spécifié') => {
    if (!obj) return fallback;
    if (typeof obj === 'string') return obj;
    if (obj.titre && obj.numero) return `${obj.numero} - ${obj.titre}`;
    if (obj.titre) return obj.titre;
    if (obj.description) return obj.description;
    if (obj.nom) return obj.nom;
    if (obj.nom_service) return obj.nom_service;
    return fallback;
  };

  // Calcul des statistiques avancées
  const stats = {
    totalServices: services.length,
    totalActivites: activites.length,
    totalStructures: structures.length,
    totalDirections: directions.length,
    totalObjectifs: objectifsGeneraux.length,
    totalPcop: pcopEntries.length,
    
    activitesAvecBudget: activites.filter(a => a.montant > 0).length,
    activitesSansBudget: activites.filter(a => !a.montant || a.montant === 0).length,
    activitesEnCours: activites.filter(a => a.etat === 'En cours').length,
    activitesTerminees: activites.filter(a => a.etat === 'Terminé').length,
    activitesAvecPcop: activites.filter(a => a.pcop).length,
    
    budgetTotal: activites.reduce((acc, curr) => acc + (curr.montant || 0), 0),
    coutUnitaireMoyen: activites.filter(a => a.cout_unitaire > 0).length > 0 
      ? activites.filter(a => a.cout_unitaire > 0).reduce((acc, curr) => acc + (curr.cout_unitaire || 0), 0) / activites.filter(a => a.cout_unitaire > 0).length 
      : 0,
  };

  // Données pour le graphique des budgets par service
  const serviceLabels = services.map((s) => s.nom_service);
  const serviceMontants = serviceLabels.map((label) =>
    activites
      .filter((a) => a.service && getDisplayText(a.service) === label)
      .reduce((acc, curr) => acc + (curr.montant || 0), 0)
  );

  // Données pour le graphique en anneau (répartition des états)
  const etatData = {
    labels: ['En cours', 'Terminé', 'En attente', 'Annulé'],
    datasets: [
      {
        data: [
          activites.filter(a => a.etat === 'En cours').length,
          activites.filter(a => a.etat === 'Terminé').length,
          activites.filter(a => a.etat === 'En attente').length,
          activites.filter(a => a.etat === 'Annulé').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique des objectifs
  const objectifLabels = objectifsGeneraux.map((obj) => obj.numero);
  const objectifActivitesCount = objectifLabels.map((numero) =>
    activites.filter((a) => a.objectif_general && a.objectif_general.numero === numero).length
  );

  // Top 5 des services par budget
  const topServices = services
    .map(service => ({
      nom: service.nom_service,
      budget: activites
        .filter(a => a.service && getDisplayText(a.service) === service.nom_service)
        .reduce((acc, curr) => acc + (curr.montant || 0), 0),
      activitesCount: activites
        .filter(a => a.service && getDisplayText(a.service) === service.nom_service)
        .length
    }))
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 5);

  // Options des graphiques
  const getChartOptions = (isDarkMode, chartType = 'bar') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: chartType === 'doughnut' ? 'bottom' : 'top',
        labels: { 
          font: { size: 12, weight: "600" }, 
          color: isDarkMode ? "#f3f4f6" : "#1f2937",
          usePointStyle: chartType === 'doughnut',
        },
      },
      title: {
        display: true,
        text: chartType === 'doughnut' ? "Répartition par état" : "Répartition du budget par service",
        font: { size: 14, weight: "bold" },
        color: isDarkMode ? "#f3f4f6" : "#1f2937",
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#374151" : "#ffffff",
        titleColor: isDarkMode ? "#f3f4f6" : "#1f2937",
        bodyColor: isDarkMode ? "#f3f4f6" : "#1f2937",
        borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            if (chartType === 'doughnut') {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
            return `Budget: ${context.parsed.y?.toLocaleString() || context.parsed.toLocaleString()} Ar`;
          }
        }
      }
    },
    scales: chartType === 'doughnut' ? {} : {
      y: { 
        beginAtZero: true,
        ticks: { 
          color: isDarkMode ? "#d1d5db" : "#1f2937",
          callback: function(value) {
            return value.toLocaleString() + (chartType === 'bar' ? ' Ar' : '');
          }
        }, 
        grid: { 
          color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" 
        } 
      },
      x: { 
        ticks: { 
          color: isDarkMode ? "#d1d5db" : "#1f2937",
          maxRotation: 45,
        }, 
        grid: { 
          display: false 
        } 
      },
    },
  });

  const dataChart = {
    labels: serviceLabels,
    datasets: [
      {
        label: "Budget total par service (Ar)",
        data: serviceMontants,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(59, 130, 246, 0.9)",
      },
    ],
  };

  const objectifChartData = {
    labels: objectifLabels,
    datasets: [
      {
        label: "Nombre d'activités par objectif",
        data: objectifActivitesCount,
        backgroundColor: "rgba(139, 92, 246, 0.7)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(139, 92, 246, 0.9)",
      },
    ],
  };

  // Fonction handleExport (conservée de votre version originale)
  const handleExport = async () => {
    setExportLoading(true);
    setExportError(null);
    
    try {
      let token = localStorage.getItem('access_token');
      console.log('Token:', token)   
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const refreshRes = await axios.post("/api/token/refresh/", { refresh });
          localStorage.setItem("access", refreshRes.data.access);
          token = refreshRes.data.access;
        } catch (err) {
          console.warn("⚠️ Le token de rafraîchissement est expiré ou invalide.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setExportError("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }
      } else if (!token) {
        setExportError("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => (window.location.href = "/login"), 2000);
        return;
      }

      console.log("🚀 Début de l'export Excel...");

      const response = await axios.get("/api/export-excel/", {
        responseType: "blob",
        timeout: 60000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response || !response.data) {
        throw new Error("Réponse invalide du serveur");
      }

      if (response.data.size === 0) {
        throw new Error("Le fichier reçu est vide");
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pta_export.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Erreur export Excel:", error);
      let errorMessage = "Une erreur est survenue lors de l'export";
      if (error.code === "ERR_NETWORK") {
        errorMessage = "Erreur de connexion réseau. Vérifiez que le serveur Django est démarré.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expirée. Redirection...";
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
      setExportError(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6 w-full max-w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300 break-words">
              Tableau de bord PTA - Vue d'ensemble
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {stats.totalActivites} activités • {stats.totalServices} services • {stats.budgetTotal.toLocaleString()} Ar de budget total
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {exportError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm max-w-xs">
                {exportError}
              </div>
            )}
            
            <button
              onClick={handleExport}
              disabled={exportLoading || loading}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap flex items-center ${
                exportLoading || loading
                  ? "bg-blue-400 dark:bg-blue-600 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-400 hover:scale-105 text-white shadow-lg"
              }`}
            >
              {exportLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exportation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cards principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Activités Total",
              value: stats.totalActivites,
              icon: "📊",
              description: `${stats.activitesEnCours} en cours`,
              color: "from-blue-400 to-blue-600",
              trend: "+12%"
            },
            {
              title: "Budget Total",
              value: `${(stats.budgetTotal / 1000000).toFixed(1)}M Ar`,
              icon: "💰",
              description: `${stats.activitesAvecBudget} avec budget`,
              color: "from-green-400 to-emerald-500",
              trend: "+8%"
            },
            {
              title: "Services Actifs",
              value: stats.totalServices,
              icon: "🏢",
              description: `${stats.totalDirections} directions`,
              color: "from-purple-400 to-purple-600",
              trend: "+5%"
            },
            {
              title: "Taux d'achèvement",
              value: `${((stats.activitesTerminees / stats.totalActivites) * 100).toFixed(1)}%`,
              icon: "✅",
              description: `${stats.activitesTerminees} terminées`,
              color: "from-orange-400 to-amber-500",
              trend: "+3%"
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${item.color} shadow-lg text-white text-xl`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.title}</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Deuxième ligne de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Avec PCOP",
              value: stats.activitesAvecPcop,
              icon: "🎯",
              description: "Codes PCOP assignés",
              color: "from-indigo-400 to-indigo-600",
              percentage: `${((stats.activitesAvecPcop / stats.totalActivites) * 100).toFixed(1)}%`
            },
            {
              title: "Coût Moyen",
              value: `${(stats.coutUnitaireMoyen).toLocaleString()} Ar`,
              icon: "⚖️",
              description: "Coût unitaire moyen",
              color: "from-pink-400 to-pink-600",
              percentage: "Moyenne"
            },
            {
              title: "Objectifs",
              value: stats.totalObjectifs,
              icon: "🎯",
              description: "Objectifs généraux",
              color: "from-teal-400 to-teal-600",
              percentage: `${objectifActivitesCount.filter(count => count > 0).length} actifs`
            },
            {
              title: "Structures",
              value: stats.totalStructures,
              icon: "🏛️",
              description: "Structures organisationnelles",
              color: "from-cyan-400 to-cyan-600",
              percentage: `${stats.totalDirections} directions`
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${item.color} shadow-lg text-white text-xl`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.title}</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  {item.percentage}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique des budgets par service */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="h-80">
              <Bar 
                data={dataChart} 
                options={getChartOptions(document.documentElement.classList.contains('dark'))}
              />
            </div>
          </div>

          {/* Graphique en anneau des états */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="h-80">
              <Doughnut 
                data={etatData} 
                options={getChartOptions(document.documentElement.classList.contains('dark'), 'doughnut')}
              />
            </div>
          </div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique des activités par objectif */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="h-80">
              <Bar 
                data={objectifChartData} 
                options={getChartOptions(document.documentElement.classList.contains('dark'))}
              />
            </div>
          </div>

          {/* Top 5 des services */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 5 des Services par Budget</h3>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{service.nom}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.activitesCount} activités</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{service.budget.toLocaleString()} Ar</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((service.budget / stats.budgetTotal) * 100).toFixed(1)}% du total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau des activités récentes */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activités Récentes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.activitesAvecBudget} activités sur {stats.totalActivites} ont un budget défini
              </p>
            </div>
            <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
              {activites.length} activité(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {["Service", "Activité", "Objectif", "État", "Montant"].map((h) => (
                    <th key={h} className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activites.slice(0, 10).map((a, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {getDisplayText(a.service, "—")}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={a.activite}>
                      {a.activite}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {getDisplayText(a.objectif_general, "—")}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.etat === 'Terminé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        a.etat === 'En cours' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        a.etat === 'En attente' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {a.etat || 'En cours'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {a.montant ? `${a.montant.toLocaleString()} Ar` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activites.length > 10 && (
              <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
                Affichage des 10 premières activités sur {activites.length} au total
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;