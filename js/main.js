// État de l'application
let currentDoctor = null;

// Éléments du DOM
const elements = {
    searchInput: document.getElementById('search'),
    specialtySelect: document.getElementById('specialty'),
    citySelect: document.getElementById('city'),
    searchBtn: document.getElementById('searchBtn'),
    doctorsGrid: document.getElementById('doctorsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    bookingModal: document.getElementById('bookingModal'),
    closeModal: document.getElementById('closeModal'),
    bookingForm: document.getElementById('bookingForm'),
    doctorNameModal: document.getElementById('doctorNameModal'),
    langBtns: document.querySelectorAll('.lang-btn')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Charger tous les médecins au démarrage
    await loadDoctors();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
    
    // Initialiser les dates
    initializeDateInput();
});

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Recherche
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Modal
    elements.closeModal.addEventListener('click', closeBookingModal);
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Changement de langue
    elements.langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
}

// Charger les médecins
async function loadDoctors(filters = {}) {
    try {
        showLoading();
        const doctors = await api.getDoctors(filters);
        displayDoctors(doctors);
    } catch (error) {
        console.error('Erreur lors du chargement des médecins:', error);
        displayError('Impossible de charger les médecins. Vérifiez que le serveur est démarré.');
    } finally {
        hideLoading();
    }
}

// Afficher les médecins
function displayDoctors(doctors) {
    if (doctors.length === 0) {
        elements.doctorsGrid.innerHTML = `
            <div class="empty-state">
                <i data-feather="search"></i>
                <h3>Aucun médecin trouvé</h3>
                <p>Essayez de modifier vos critères de recherche.</p>
            </div>
        `;
        elements.resultsCount.textContent = 'Aucun médecin trouvé';
        feather.replace();
        return;
    }
    
    elements.doctorsGrid.innerHTML = '';
    doctors.forEach(doctor => {
        const doctorCard = createDoctorCard(doctor);
        elements.doctorsGrid.appendChild(doctorCard);
    });
    
    elements.resultsCount.textContent = `${doctors.length} médecin${doctors.length > 1 ? 's' : ''} trouvé${doctors.length > 1 ? 's' : ''}`;
}

// Créer une carte de médecin
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
        <div class="doctor-info">
            <h3 class="doctor-name">${doctor.name}</h3>
            <p class="doctor-specialty">${doctor.specialty}</p>
            <div class="doctor-details">
                <p><i data-feather="map-pin"></i> ${doctor.city}</p>
                <p><i data-feather="home"></i> ${doctor.address}</p>
            </div>
            <div class="doctor-rating">
                <i data-feather="star"></i>
                <span>${doctor.rating || '4.5'}</span>
                <span>(${doctor.reviews_count || '0'} avis)</span>
            </div>
            <button class="book-btn" data-doctor-id="${doctor.id}">
                Réserver un rendez-vous
            </button>
        </div>
    `;
    
    // Ajouter l'écouteur d'événement pour la réservation
    const bookBtn = card.querySelector('.book-btn');
    bookBtn.addEventListener('click', () => openBookingModal(doctor));
    
    feather.replace(card);
    return card;
}

// Gérer la recherche
function handleSearch() {
    const filters = {
        search: elements.searchInput.value.trim(),
        specialty: elements.specialtySelect.value,
        city: elements.citySelect.value
    };
    
    loadDoctors(filters);
}

// Ouvrir le modal de réservation
function openBookingModal(doctor) {
    currentDoctor = doctor;
    elements.doctorNameModal.textContent = doctor.name;
    elements.bookingModal.style.display = 'flex';
}

// Fermer le modal de réservation
function closeBookingModal() {
    elements.bookingModal.style.display = 'none';
    elements.bookingForm.reset();
}

// Gérer la soumission du formulaire de réservation
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.bookingForm);
    const appointmentData = {
        doctor_id: currentDoctor.id,
        patient_name: formData.get('patientName'),
        patient_phone: formData.get('patientPhone'),
        appointment_date: formData.get('appointmentDate'),
        appointment_time: formData.get('appointmentTime')
    };
    
    // Validation basique
    if (!appointmentData.patient_name || !appointmentData.patient_phone || 
        !appointmentData.appointment_date || !appointmentData.appointment_time) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    try {
        await api.createAppointment(appointmentData);
        alert('Rendez-vous confirmé avec succès !');
        closeBookingModal();
    } catch (error) {
        alert('Erreur lors de la réservation : ' + error.message);
    }
}

// Initialiser l'input de date
function initializeDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

// Afficher le loading
function showLoading() {
    elements.loadingSpinner.style.display = 'flex';
}

// Cacher le loading
function hideLoading() {
    elements.loadingSpinner.style.display = 'none';
}

// Afficher une erreur
function displayError(message) {
    elements.doctorsGrid.innerHTML = `
        <div class="empty-state">
            <i data-feather="alert-triangle"></i>
            <h3>Erreur</h3>
            <p>${message}</p>
        </div>
    `;
    feather.replace();
}

// Changer la langue
function setLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Ici tu pourrais ajouter la logique pour changer le contenu
    // Pour l'instant, on garde en français
    console.log('Langue changée à:', lang);
}
// Ajoute cette fonction après la fonction setLanguage existante
function setLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Gérer la direction du texte
    const htmlTag = document.getElementById('htmlTag');
    if (lang === 'ar') {
        htmlTag.dir = 'rtl';
        htmlTag.lang = 'ar';
        document.body.classList.add('rtl');
    } else {
        htmlTag.dir = 'ltr';
        htmlTag.lang = 'fr';
        document.body.classList.remove('rtl');
    }
    
    // Recharger les médecins avec la langue appropriée
    // (tu devras adapter ton backend pour supporter l'arabe)
    console.log('Langue changée à:', lang);
}
// Ajoute ceci dans la fonction setupEventListeners()
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
}

// Fonction pour gérer le formulaire de contact
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('contactName'),
        email: formData.get('contactEmail'),
        phone: formData.get('contactPhone'),
        message: formData.get('contactMessage')
    };
    
    // Pour l'instant, on affiche dans la console
    // Plus tard, tu enverras vers ton backend
    console.log('Message de contact:', contactData);
    alert('Merci pour votre message ! Nous vous répondrons bientôt.');
    contactForm.reset();
}