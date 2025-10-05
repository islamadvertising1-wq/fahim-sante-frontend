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
  langBtns: document.querySelectorAll('.lang-btn'),
  loginBtn: document.getElementById('loginBtn')
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
  if (elements.bookingForm) {
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
  }
  
  // Changement de langue
  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });
  });
  
  // Bouton de connexion
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', openLoginModal);
  }
  
  // Formulaire de contact
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
}

// Charger les médecins
async function loadDoctors(filters = {}) {
  try {
    showLoading();
    const doctors = await api.getDoctors(filters);
    displayDoctors(doctors);
  } catch (error) {
    console.error('Erreur lors du chargement des médecins:', error);
    displayError('Impossible de charger les médecins.');
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
  if (elements.bookingForm) {
    elements.bookingForm.reset();
  }
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

// Ouvrir le modal de connexion/inscription
function openLoginModal() {
  // Créer un modal simple pour l'exemple
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <span class="close" style="float: right; font-size: 28px; cursor: pointer;">&times;</span>
      <h3>Connexion / Inscription</h3>
      <div style="margin: 20px 0;">
        <button onclick="showLoginForm()" style="margin-right: 10px;" id="loginTabBtn">Connexion</button>
        <button onclick="showRegisterForm()" id="registerTabBtn">Inscription</button>
      </div>
      <div id="loginFormDiv">
        <input type="email" id="loginEmail" placeholder="Email" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
        <input type="password" id="loginPassword" placeholder="Mot de passe" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
        <button onclick="handleLogin()" style="width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 4px; margin-top: 10px;">Se Connecter</button>
      </div>
      <div id="registerFormDiv" style="display: none;">
        <input type="text" id="registerName" placeholder="Nom complet" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
        <input type="email" id="registerEmail" placeholder="Email" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
        <input type="password" id="registerPassword" placeholder="Mot de passe" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
        <select id="registerRole" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
          <option value="">Je suis...</option>
          <option value="patient">Patient</option>
          <option value="doctor">Médecin</option>
        </select>
        <button onclick="handleRegister()" style="width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 4px; margin-top: 10px;">S'inscrire</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.querySelector('.close').onclick = () => document.body.removeChild(modal);
}

// Fonctions pour le modal d'authentification
function showLoginForm() {
  document.getElementById('loginFormDiv').style.display = 'block';
  document.getElementById('registerFormDiv').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('loginFormDiv').style.display = 'none';
  document.getElementById('registerFormDiv').style.display = 'block';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  try {
    const response = await api.login({ email, password });
    alert(response.message);
    document.body.removeChild(document.querySelector('.modal'));
    // Sauvegarder l'utilisateur dans localStorage (simplifié)
    localStorage.setItem('user', JSON.stringify(response.user));
  } catch (error) {
    alert('Erreur : ' + error.message);
  }
}

async function handleRegister() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;
  
  if (!name || !email || !password || !role) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  try {
    const response = await api.register({ name, email, password, role });
    alert(response.message);
    document.body.removeChild(document.querySelector('.modal'));
  } catch (error) {
    alert('Erreur : ' + error.message);
  }
}

// Initialiser l'input de date
function initializeDateInput() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    dateInput.min = today;
  }
}

// Afficher le loading
function showLoading() {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.style.display = 'flex';
  }
}

// Cacher le loading
function hideLoading() {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.style.display = 'none';
  }
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
}

// Gérer le formulaire de contact
function handleContactSubmit(e) {
  e.preventDefault();
  alert('Merci pour votre message ! Nous vous répondrons bientôt.');
  e.target.reset();
}