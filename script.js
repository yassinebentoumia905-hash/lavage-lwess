// script.js – Navigation fluide + Moto + Wenty fi blastek SEUL
const sections = {
  accueil: document.getElementById('accueil'),
  services: document.getElementById('services'),
  contact: document.getElementById('contact')
};
const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.getElementById("sidebar");
const selectedType = document.getElementById("selectedType");
const closeBtn = document.getElementById("closeSidebar");
const startBtn = document.getElementById("startBtn");
const datePicker = document.getElementById("datePicker");
const slotsContainer = document.getElementById("slots");
const confirmBtn = document.getElementById("confirm");
const totalPriceDisplay = document.getElementById("totalPrice");
const modal = document.getElementById("confirmModal");
const closeModal = document.querySelectorAll(".close-modal, #closeModalBtn");

let selectedSlot = null;
let totalPrice = 0;

const basePrices = { 
  'Lavage Normal': 30, 
  'Lavage Complet': 100, 
  'Fumée': 150,
  'Lavage Moto': 10 
};

// Navigation fluide
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('href').substring(1);
    
    // Masquer toutes les sections
    Object.values(sections).forEach(s => s.style.display = 'none');
    
    // Afficher la cible
    sections[target].style.display = 'block';
    
    // Mettre à jour active
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Loading
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("loading").style.display = "none";
      document.getElementById("mainContent").style.display = "block";
      sections.accueil.style.display = 'block';
    }, 600);
  }, 2200);
});

// Réserver
startBtn.addEventListener("click", () => {
  showSection('services');
});

// Afficher une section
function showSection(id) {
  Object.values(sections).forEach(s => s.style.display = 'none');
  sections[id].style.display = 'block';
  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector(`a[href="#${id}"]`).classList.add('active');
}

// Service click
document.querySelectorAll(".service-card.clickable").forEach(card => {
  card.addEventListener("click", () => {
    const type = card.getAttribute("data-type");
    selectedType.textContent = type;
    sidebar.classList.add("open");
    selectedSlot = null;
    slotsContainer.innerHTML = "";
    datePicker.value = "";
    totalPrice = basePrices[type] || 0;
    updatePrice();

    const optionsDiv = document.querySelector('.options');
    
    // SEULEMENT "WENTY FI BLASTEK" POUR TOUS LES SERVICES
    const html = `
      <div class="checkbox-group">
        <input type="checkbox" data-price="25" id="wenty">
        <label for="wenty">Wenty fi blastek (+25DT)</label>
      </div>
    `;
    
    optionsDiv.innerHTML = html;
    
    // Écouter les changements de checkbox
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', updatePrice);
    });
  });
});

function updatePrice() {
  const service = selectedType.textContent;
  totalPrice = basePrices[service] || 0;
  
  // Ajouter le prix de "Wenty fi blastek" si coché
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
    totalPrice += parseInt(cb.dataset.price || 0);
  });
  
  totalPriceDisplay.textContent = `Total: ${totalPrice} DT`;
}

// Date → slots
datePicker.addEventListener("change", e => {
  const date = e.target.value;
  if (!date) return;
  const [y, m, d] = date.split('-');
  const formatted = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  fetch(`/api/slots/${formatted}`)
    .then(res => res.ok ? res.json() : [])
    .then(slots => {
      slotsContainer.innerHTML = "";
      if (slots.length === 0) {
        slotsContainer.innerHTML = "<p style='color:#ccc;'>Aucun créneau</p>";
        return;
      }
      slots.forEach(time => {
        const btn = document.createElement("button");
        btn.textContent = time;
        btn.className = "slot-btn";
        btn.onclick = () => {
          selectedSlot = { date: formatted, heure: time };
          document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        };
        slotsContainer.appendChild(btn);
      });
    })
    .catch(() => {
      slotsContainer.innerHTML = "<p style='color:#f88;'>Erreur chargement</p>";
    });
});

// Confirmation
confirmBtn.addEventListener("click", () => {
  const service = selectedType.textContent;
  const { date, heure } = selectedSlot || {};
  const client = {
    surname: document.getElementById('clientSurname').value.trim(),
    name: document.getElementById('clientName').value.trim(),
    phone: document.getElementById('clientPhone').value.trim()
  };
  
  // Récupérer l'option "Wenty fi blastek"
  const wentyChecked = document.querySelector('input[type="checkbox"]:checked');
  const options = wentyChecked ? ["Wenty fi blastek"] : [];

  if (!service || !date || !heure || !client.name || !client.surname || !client.phone) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  fetch("/api/reserver", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, date, heure, options, client, total: totalPrice })
  })
  .then(res => res.ok ? res.text() : "Erreur")
  .then(msg => {
    // Mettre à jour le modal
    document.getElementById('modalService').textContent = service;
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalTime').textContent = heure;
    document.getElementById('modalClient').textContent = `${client.surname} ${client.name}`;
    document.getElementById('modalPhone').textContent = client.phone;
    document.getElementById('modalOptions').textContent = options.length ? options.join(', ') : 'Aucune';
    document.getElementById('modalTotal').textContent = totalPrice;

    // Afficher le modal
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add('show'), 10);
    sidebar.classList.remove("open");
    
    // Réinitialiser
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('clientSurname').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    datePicker.value = '';
    slotsContainer.innerHTML = '';
    selectedSlot = null;
  })
  .catch(() => alert("Erreur d'envoi"));
});

// Fermer modals
closeModal.forEach(btn => btn.addEventListener("click", () => {
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = "none", 300);
}));

closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));