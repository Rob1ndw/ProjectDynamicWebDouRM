const apiUrl = "https://bruxellesdata.opendatasoft.com/api/records/1.0/search/?dataset=fontaines-d-eau-potable-gerees-par-la-ville-de-bruxelles&rows=50";

// Kaart aanmaken
let map = L.map('map').setView([50.85, 4.35], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Favorieten ophalen
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Gegevens ophalen en tonen
async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    let locations = data.records.map(record => ({
      id: record.recordid,
      adresse_fr: record.fields.adresse_fr || "Onbekend",
      adres_nl: record.fields.adres_nl || "Onbekend",
      code_postal: record.fields.code_postal || "Onbekend",
      commune: record.fields.commune || "Onbekend",
      lat: record.fields.coordonnees_geographiques?.[0],
      lon: record.fields.coordonnees_geographiques?.[1]
    }));

    // Alleen met geldige coordinaten
    locations = locations.filter(loc => loc.lat !== undefined && loc.lon !== undefined);

    // Sorteren op gemeente
    locations.sort((a, b) => a.commune.localeCompare(b.commune));

    updateTable(locations);
    updateMap(locations);
  } catch (error) {
    console.error("Fout bij ophalen van API-data:", error);
  }
}

// Tabel updaten
function updateTable(data) {
  const tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");

    const isFavorite = favorites.includes(item.id);
    const starIcon = isFavorite ? "⭐" : "☆";

    row.innerHTML = `
      <td>${item.adresse_fr}</td>
      <td>${item.adres_nl}</td>
      <td>${item.code_postal}</td>
      <td>${item.commune}</td>
      <td>${item.lon}</td>
      <td>${item.lat}</td>
      <td class="favorite" data-id="${item.id}">${starIcon}</td>
    `;

    tableBody.appendChild(row);
  });

  document.querySelectorAll(".favorite").forEach(star => {
    star.addEventListener("click", toggleFavorite);
  });
}

// Markers op de kaart zetten
function updateMap(data) {
  // Verwijder bestaande markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Nieuwe markers plaatsen
  data.forEach(item => {
    L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.adresse_fr}</b><br>${item.adres_nl}<br>Postcode: ${item.code_postal}`);
  });
}

// Favoriet aan/uit zetten
function toggleFavorite(event) {
  const id = event.target.dataset.id;

  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  fetchData();
}

// Dropdown functionaliteit
document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.getElementById("filter-button");
  const dropdown = document.querySelector(".dropdown");

  filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });

  const dropdownMenu = document.querySelector(".dropdown-menu");
  dropdownMenu.addEventListener("click", (e) => e.stopPropagation());

  // Filter: Favorieten
  document.getElementById("filter-favorites").addEventListener("click", (e) => {
    e.preventDefault();
    const favoriteIds = JSON.parse(localStorage.getItem("favorites")) || [];

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        let favoritesOnly = data.records
          .filter(record => favoriteIds.includes(record.recordid))
          .map(record => ({
            id: record.recordid,
            adresse_fr: record.fields.adresse_fr || "Onbekend",
            adres_nl: record.fields.adres_nl || "Onbekend",
            code_postal: record.fields.code_postal || "Onbekend",
            commune: record.fields.commune || "Onbekend",
            lat: record.fields.coordonnees_geographiques?.[0],
            lon: record.fields.coordonnees_geographiques?.[1]
          }));

        updateTable(favoritesOnly);
        updateMap(favoritesOnly);
      });

    dropdown.classList.remove("show");
  });

  // Filter op gemeenten
  document.querySelectorAll(".filter-commune").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const city = link.dataset.city.toLowerCase();

      document.querySelectorAll("#dataTable tbody tr").forEach(row => {
        const rowCity = row.cells[3].textContent.trim().toLowerCase();
        row.style.display = (city === "alle" || rowCity === city) ? "" : "none";
      });

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          let locations = data.records.map(record => ({
            id: record.recordid,
            adresse_fr: record.fields.adresse_fr || "Onbekend",
            adres_nl: record.fields.adres_nl || "Onbekend",
            code_postal: record.fields.code_postal || "Onbekend",
            commune: record.fields.commune || "Onbekend",
            lat: record.fields.coordonnees_geographiques?.[0],
            lon: record.fields.coordonnees_geographiques?.[1]
          }));

          locations = locations.filter(loc => loc.lat !== undefined && loc.lon !== undefined);

          if (city !== "alle") {
            locations = locations.filter(loc => loc.commune.toLowerCase() === city);
          }

          updateMap(locations);
        });

      dropdown.classList.remove("show");
    });
  });
});

// Start
fetchData();