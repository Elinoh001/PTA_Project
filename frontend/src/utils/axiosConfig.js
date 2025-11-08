import axios from 'axios';

// Configuration de base de l'instance axios
const instance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // Permet l'envoi des cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // Timeout de 60 secondes
});

// Intercepteur pour ajouter le token automatiquement
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajout des headers CORS si nécessaire
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    
    // Pour les requêtes blob (export Excel)
    if (config.url?.includes('export-excel')) {
      config.responseType = 'blob';
    }
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Gestion des erreurs réseau
    if (error.code === 'ERR_NETWORK') {
      console.error('Erreur réseau:', error);
      throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
    }

    // Gestion des erreurs 401 (Non autorisé)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          // Tentative de rafraîchissement du token
          const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken
          });

          if (response.data.access) {
            localStorage.setItem('access', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Erreur de rafraîchissement du token:', refreshError);
      }

      // Si le rafraîchissement échoue, déconnexion
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Gestion des erreurs CORS
    if (error.message.includes('CORS')) {
      console.error('Erreur CORS:', error);
      throw new Error(`
        Erreur CORS détectée. Vérifiez que:
        1. Le serveur Django est correctement configuré avec django-cors-headers
        2. L'URL ${instance.defaults.baseURL} est autorisée dans CORS_ALLOWED_ORIGINS
        3. Les headers et méthodes nécessaires sont autorisés
      `);
    }

    return Promise.reject(error);
  }
);

// Exportation de l'instance axios configurée
export default instance;