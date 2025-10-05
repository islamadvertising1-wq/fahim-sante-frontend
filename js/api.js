// Remplace TON_URL_RENDER par ton URL Render réelle
const API_BASE_URL = 'https://fahim-sante-backend.onrender.com/api';

const api = {
  // Obtenir les médecins avec filtres
  getDoctors: async (filters = {}) => {
    try {
      let url = `${API_BASE_URL}/doctors`;
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.city) params.append('city', filters.city);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur API getDoctors:', error);
      throw error;
    }
  },
  
  // Créer un rendez-vous
  createAppointment: async (appointmentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API createAppointment:', error);
      throw error;
    }
  },
  
  // Inscription
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API register:', error);
      throw error;
    }
  },
  
  // Connexion
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API login:', error);
      throw error;
    }
  }
};