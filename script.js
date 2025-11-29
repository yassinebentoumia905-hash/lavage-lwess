// === VARIABLES GLOBALES ===
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
const produitsSection = document.getElementById("produitsSection");
const produitsList = document.getElementById("produitsList");
const adresseField = document.getElementById("adresseField");

let selectedSlot = null;
let totalPrice = 0;

// === PRIX DE BASE ===
const basePrices = { 
  'Lavage Normal': 30, 
  'Lavage Complet': 60, 
  'Fumée': 0, 
  'Lavage Moto': 0 
};

// === PRODUITS UTILISÉS ===
const produits = {
  "Lavage Normal": ["Shampooing carrosserie", "Nettoyant intérieur", "Microfibre douce"],
  "Lavage Complet": ["Shampooing complet", "Polish", "Cire", "Nettoyant tableau de bord", "Nettoyant vitres"],
  "Fumée": ["Film protecteur", "Matériel de pose", "Nettoyant vitres spécial"],
  "Lavage Moto": ["Shampooing moto", "Polish chrome", "Cire protectrice"]
};

// === NAVIGATION ===
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('href').substring(1);
    Object.values(sections).forEach(s => s.style.display = 'none');
    sections[target].style.display = 'block';
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// === LOADING ===
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("loading").style.display = "none";
      document.getElementById("mainContent").style.display = "block";
      sections.accueil.style.display = 'block';
    }, 600);
  }, 2000);
});

startBtn.addEventListener("click", () => showSection('services'));

function showSection(id) {
  Object.values(sections).forEach(s => s.style.display = 'none');
  sections[id].style.display = 'block';
  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector(`a[href="#${id}"]`)?.classList.add('active');
}

// === OPTIONS ===
function getMotoOptions() {
  return `
    <div class="radio-option">
      <input type="radio" name="motoType" id="vespa" value="Vespa" data-price="10">
      <div class="radio-custom"></div>
      <label for="vespa" class="radio-label">
        <span>Vespa</span>
        <span class="price-tag">10 DT</span>
      </label>
    </div>
    <div class="radio-option">
      <input type="radio" name="motoType" id="grandMoto" value="Grande Moto" data-price="15">
      <div class="radio-custom"></div>
      <label for="grandMoto" class="radio-label">
        <span>Grande Moto</span>
        <span class="price-tag">15 DT</span>
      </label>
    </div>
  `;
}

function getFumeeOptions() {
  return `
    <div class="radio-option">
      <input type="radio" name="fumeeType" id="fumee2p" value="2 Portes" data-price="50">
      <div class="radio-custom"></div>
      <label for="fumee2p" class="radio-label">
        <span>2 Portes</span>
        <span class="price-tag">50 DT</span>
      </label>
    </div>
    <div class="radio-option">
      <input type="radio" name="fumeeType" id="fumeeChtar" value="Chtar Tileni" data-price="150">
      <div class="radio-custom"></div>
      <label for="fumeeChtar" class="radio-label">
        <span>Chtar Tileni</span>
        <span class="price-tag">150 DT</span>
      </label>
    </div>
    <div class="radio-option">
      <input type="radio" name="fumeeType" id="fumeeComplet" value="Fumé Complet" data-price="170">
      <div class="radio-custom"></div>
      <label for="fumeeComplet" class="radio-label">
        <span>Fumé Complet</span>
        <span class="price-tag">170 DT</span>
      </label>
    </div>
  `;
}

// === UPDATE PRICE ===
function updatePrice() {
  const service = selectedType.textContent;
  totalPrice = basePrices[service] || 0;

  if (service === 'Lavage Moto') {
    const sel = document.querySelector('input[name="motoType"]:checked');
    totalPrice += sel ? parseInt(sel.dataset.price) : 0;
  } else if (service === 'Fumée') {
    const sel = document.querySelector('input[name="fumeeType"]:checked');
    totalPrice += sel ? parseInt(sel.dataset.price) : 0;
  }

  const wenty = document.getElementById('wenty');
  if (wenty && wenty.checked) totalPrice += 10;

  totalPriceDisplay.textContent = `Total: ${totalPrice} DT`;
}

// === SERVICE CLICK ===
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

    produitsSection.style.display = "block";
    produitsList.innerHTML = produits[type].map(p => `<li>${p}</li>`).join('');

    const optionsDiv = document.querySelector('.options');
    optionsDiv.innerHTML = '';

    if (type === 'Lavage Moto') {
      optionsDiv.innerHTML = getMotoOptions();
      adresseField.style.display = 'none';
    } else if (type === 'Fumée') {
      optionsDiv.innerHTML = `
        ${getFumeeOptions()}
        <div class="checkbox-group">
          <input type="checkbox" id="wenty" data-price="10">
          <label for="wenty">وانتي في بلاصتك، كرهبتك تتهز، تتغسل، وترجع لبلاصتك</label>
        </div>`;
    } else {
      optionsDiv.innerHTML = `
        <div class="checkbox-group">
          <input type="checkbox" id="wenty" data-price="10">
          <label for="wenty">وانتي في بلاصتك، كرهبتك تتهز، تتغسل، وترجع لبلاصتك</label>
        </div>`;
    }

    const wenty = document.getElementById('wenty');
    if (wenty) {
      wenty.addEventListener('change', e => {
        adresseField.style.display = e.target.checked ? 'block' : 'none';
        updatePrice();
      });
    }

    document.querySelectorAll('.radio-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const input = opt.querySelector('input[type="radio"]');
        if (input) {
          input.checked = true;
          updatePrice();
        }
      });
    });

    document.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener('change', updatePrice);
    });
  });
});

// === CLOSE SIDEBAR ===
closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));

// === DATE → SLOTS ===
datePicker.addEventListener("change", e => {
  const date = e.target.value;
  if (!date) return;
  fetch(`/api/slots/${date}`)
    .then(res => res.ok ? res.json() : [])
    .then(slots => {
      slotsContainer.innerHTML = slots.length
        ? slots.map(s => `<button class='slot-btn'>${s}</button>`).join('')
        : "<p style='color:#ccc;text-align:center;'>Aucun créneau</p>";
      document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedSlot = { date, heure: btn.textContent };
          document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });
    });
});

// === CONFIRM ===
confirmBtn.addEventListener("click", () => {
  const service = selectedType.textContent;
  const { date, heure } = selectedSlot || {};
  const client = {
    surname: document.getElementById('clientSurname').value.trim(),
    name: document.getElementById('clientName').value.trim(),
    phone: document.getElementById('clientPhone').value.trim(),
    address: document.getElementById('clientAddress').value.trim()
  };

  const options = [];
  if (service === 'Lavage Moto') {
    const sel = document.querySelector('input[name="motoType"]:checked');
    if (sel) options.push(sel.value);
  } else if (service === 'Fumée') {
    const sel = document.querySelector('input[name="fumeeType"]:checked');
    if (sel) options.push(sel.value);
  }
  if (document.getElementById('wenty')?.checked) {
    options.push("وانتي في بلاصتك");
  }

  if (!service || !date || !heure || !client.name || !client.surname || !client.phone) {
    alert("رجاءً عَبّي جميع الخانات");
    return;
  }

  fetch("/api/reserver", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, date, heure, options, client, total: totalPrice })
  })
  .then(res => res.ok ? res.text() : Promise.reject())
  .then(() => {
    // === Résumé visuel ===
    document.getElementById("modalService").textContent = service;
    document.getElementById("modalDate").textContent = date;
    document.getElementById("modalTime").textContent = heure;
    document.getElementById("modalClient").textContent = `${client.surname} ${client.name}`;
    document.getElementById("modalPhone").textContent = client.phone;
    document.getElementById("modalAddress").textContent = client.address || "—";
    document.getElementById("modalOptions").textContent = options.length ? options.join(", ") : "Aucune";
    document.getElementById("modalTotal").textContent = `${totalPrice} `;

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
    sidebar.classList.remove("open");
  })
  .catch(() => alert("❌ خطأ في إرسال البيانات"));
});

// === FERMER LE MODAL ===
closeModal.forEach(btn => btn.addEventListener("click", () => {
  modal.classList.remove("show");
  setTimeout(() => modal.style.display = "none", 300);
}));
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch(err => console.log("SW registration failed:", err));
}
