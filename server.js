const express = require('express');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));

const file = path.join(__dirname, 'reservations.json');

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, "[]", 'utf-8');
  console.log("reservations.json créé automatiquement");
}

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// 🔹 Générer les slots disponibles (de 09:00 à 19:00 toutes les 1h)
const generateSlots = () => {
  const slots = [];
  for (let h = 9; h <= 19; h++) {
    const hour = h.toString().padStart(2, "0");
    slots.push(`${hour}:00`);
  }
  return slots;
};


// 🟢 GET slots disponibles
app.get('/api/slots/:date', async (req, res) => {
  try {
    const date = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).send("Date invalide");
    const data = JSON.parse(await readFile(file, 'utf-8'));
    const reserved = data.filter(r => r.date === date).map(r => r.heure);
    const all = generateSlots();
    const available = all.filter(s => !reserved.includes(s));
    res.json(available);
  } catch (err) {
    console.error("Erreur slots:", err);
    res.status(500).send("Erreur");
  }
});

// 🟢 POST réservation
app.post('/api/reserver', async (req, res) => {
  const { service, date, heure, options = [], client, total } = req.body;
  if (!service || !date || !heure || !client?.name || !client?.surname || !client?.phone) {
    return res.status(400).send("Données manquantes");
  }
  try {
    const data = JSON.parse(await readFile(file, 'utf-8'));
    if (data.find(r => r.date === date && r.heure === heure)) {
      return res.status(400).send("Créneau déjà réservé");
    }
    const newRes = { service, date, heure, options, client, total, confirmé: false, timestamp: new Date().toISOString() };
    data.push(newRes);
    await writeFile(file, JSON.stringify(data, null, 2));
    console.log("Réservation ajoutée:", newRes);
    res.send(`Réservation confirmée pour ${client.surname} ${client.name} !`);
  } catch (err) {
    console.error("Erreur réservation:", err);
    res.status(500).send("Erreur");
  }
});

// 🟢 GET toutes les réservations + stats
app.get('/api/reservations', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(file, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.filter(r => r.date === today && r.confirmé);
    const month = today.slice(0, 7);
    const monthData = data.filter(r => r.date.startsWith(month) && r.confirmé);

    const todayCount = todayData.length;
    const todayRevenue = todayData.reduce((sum, r) => sum + (r.total || 0), 0);
    const monthCount = monthData.length;
    const monthRevenue = monthData.reduce((sum, r) => sum + (r.total || 0), 0);

    res.json({
      list: data,
      stats: {
        today: { count: todayCount, revenue: todayRevenue },
        month: { count: monthCount, revenue: monthRevenue }
      },
      chart: {
        services: data.reduce((acc, r) => {
          acc[r.service] = (acc[r.service] || 0) + 1;
          return acc;
        }, {}),
        revenueByDay: data.reduce((acc, r) => {
          acc[r.date] = (acc[r.date] || 0) + (r.total || 0);
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error("Erreur API Admin:", err);
    res.status(500).send("Erreur serveur");
  }
});

// 🟢 POST confirmer lavage
app.post('/api/confirm/:date/:heure', async (req, res) => {
  try {
    const { date, heure } = req.params;
    let data = JSON.parse(await readFile(file, 'utf-8'));

    const idx = data.findIndex(r => r.date === date && r.heure === heure);
    if (idx === -1) return res.status(404).send("Réservation introuvable");

    data[idx].confirmé = true;
    await writeFile(file, JSON.stringify(data, null, 2));

    res.send("Réservation confirmée");
  } catch (err) {
    console.error("Erreur confirmation:", err);
    res.status(500).send("Erreur serveur");
  }
});

// 🟢 DELETE réservation
app.delete('/api/delete/:date/:heure', async (req, res) => {
  try {
    const { date, heure } = req.params;
    let data = JSON.parse(await readFile(file, 'utf-8'));
    data = data.filter(r => !(r.date === date && r.heure === heure));
    await writeFile(file, JSON.stringify(data, null, 2));
    res.send("Supprimée");
  } catch (err) {
    console.error("Erreur delete:", err);
    res.status(500).send("Erreur");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
