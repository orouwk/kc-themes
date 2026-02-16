// Location detection and map support for AgriMarket

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.href.includes("register")) {
    addLocationDetection();
  }
  initializeMapPreview();
});

function addLocationDetection() {
  const cityField = document.querySelector(
    'input[name="user.attributes.city"]',
  );
  if (!cityField) return;

  const detectBtn = document.createElement("button");
  detectBtn.type = "button";
  detectBtn.className = "btn btn-secondary";
  detectBtn.style.cssText =
    "margin-top: 0.5rem; padding: 0.5rem 1rem; background: #f0f0f0; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;";
  detectBtn.innerHTML = "📍 Detect My Location";

  detectBtn.addEventListener("click", detectLocation);
  cityField.parentElement.appendChild(detectBtn);
}

function detectLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = "⏳ Detecting...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      reverseGeocode(lat, lon)
        .then((location) => {
          fillLocationFields(location);
          btn.innerHTML = "✓ Location Detected";
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = "📍 Detect My Location";
          }, 2000);
        })
        .catch((error) => {
          console.error("Geocoding error:", error);
          btn.innerHTML = "❌ Detection Failed";
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = "📍 Detect My Location";
          }, 2000);
        });
    },
    function (error) {
      console.error("Geolocation error:", error);
      btn.innerHTML = "❌ Detection Failed";
      btn.disabled = false;
    },
  );
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      city:
        data.address.city || data.address.town || data.address.village || "",
      region: data.address.state || data.address.province || "",
      country: data.address.country || "",
      latitude: lat,
      longitude: lon,
    };
  } catch (error) {
    throw new Error("Failed to reverse geocode location");
  }
}

function fillLocationFields(location) {
  const cityField = document.querySelector(
    'input[name="user.attributes.city"]',
  );
  const regionField =
    document.querySelector('select[name="user.attributes.region"]') ||
    document.querySelector('input[name="user.attributes.region"]');
  const latField = document.querySelector(
    'input[name="user.attributes.latitude"]',
  );
  const lonField = document.querySelector(
    'input[name="user.attributes.longitude"]',
  );

  if (cityField && location.city) cityField.value = location.city;
  if (regionField && location.region) regionField.value = location.region;
  if (latField) latField.value = location.latitude;
  if (lonField) lonField.value = location.longitude;

  updateMapPreview(location.latitude, location.longitude);
}

function initializeMapPreview() {
  const mapContainer = document.querySelector(".map-preview");
  if (!mapContainer) return;
  mapContainer.innerHTML =
    '<p style="margin: 0;">📍 Your farm location will appear here</p>';
}

function updateMapPreview(lat, lon) {
  const mapContainer = document.querySelector(".map-preview");
  if (!mapContainer) return;

  mapContainer.innerHTML = `
        <iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}" 
            style="border-radius: 8px;">
        </iframe>
    `;
}
