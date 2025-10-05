// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000/api';

// Fonctions d'API
const api = {
    // Obtenir tous les médecins
    getDoctors: async (filters = {}) => {
        try {
            let url = `${API_BASE_URL}/doctors`;
            
            // Ajouter les filtres à l'URL si nécessaire
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.specialty) params.append('specialty', filters.specialty);
            if (filters.city) params.append('city', filters.city);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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
    }
};