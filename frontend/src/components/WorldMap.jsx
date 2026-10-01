import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Global styles injected directly to customize Leaflet into a military cyber-radar aesthetic
const mapStyles = `
  .tactical-military-map {
    position: relative;
    width: 100%;
    height: 400px;
    background-color: #030804 !important;
  }
  .tactical-military-map .leaflet-container {
    background: #030804 !important;
    border: 1px solid #1e3a1f !important;
    border-radius: 4px;
    height: 100%;
    width: 100%;
  }
  .tactical-military-map .leaflet-tile-container img {
    filter: brightness(70%) contrast(120%) saturate(110%) !important;
  }
  .tactical-military-map .leaflet-bar {
    border: 1px solid #1e3a1f !important;
  }
  .tactical-military-map .leaflet-bar a {
    background-color: #051206 !important;
    color: #4ade80 !important;
    border-color: #1e3a1f !important;
  }
  .tactical-military-map .leaflet-bar a:hover {
    background-color: #143516 !important;
    color: #fff !important;
  }
  .tactical-military-map .leaflet-popup-content-wrapper {
    background-color: #051206 !important;
    color: #4ade80 !important;
    border: 1px solid #1e3a1f !important;
    border-radius: 4px !important;
    font-family: monospace, Courier, monospace !important;
    font-size: 10px !important;
  }
  .tactical-military-map .leaflet-popup-tip {
    background-color: #051206 !important;
    border: 1px solid #1e3a1f !important;
  }
  @keyframes pulse-radar {
    0% {
      transform: scale(0.3);
      opacity: 1;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
  .pulse-node-green {
    position: relative;
    width: 24px;
    height: 24px;
  }
  .pulse-node-green-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #4ade80;
    border-radius: 50%;
    top: 7px;
    left: 7px;
    border: 2px solid #000;
    box-shadow: 0 0 10px #4ade80;
  }
  .pulse-node-green-ring {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: rgba(74, 222, 128, 0.4);
    border-radius: 50%;
    animation: pulse-radar 2s infinite ease-out;
  }
  .pulse-node-red {
    position: relative;
    width: 24px;
    height: 24px;
  }
  .pulse-node-red-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #ef4444;
    border-radius: 50%;
    top: 7px;
    left: 7px;
    border: 2px solid #000;
    box-shadow: 0 0 10px #ef4444;
  }
  .pulse-node-red-ring {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: rgba(239, 68, 68, 0.5);
    border-radius: 50%;
    animation: pulse-radar 1.5s infinite ease-out;
  }
`;

const countryCoords = {
  "United States": [38.8951, -77.0364],
  "United Kingdom": [51.5074, -0.1278],
  "India": [28.6139, 77.2090],
  "Germany": [52.5200, 13.4050],
  "Japan": [35.6762, 139.6503],
  "France": [48.8566, 2.3522],
  "Australia": [-35.2809, 149.1300],
  "Canada": [45.4215, -75.6972],
  "Brazil": [-15.8267, -47.9218]
};

// Custom Leaflet HTML icons for premium dashboard visualization
const greenNodeIcon = L.divIcon({
  className: 'custom-military-marker',
  html: `<div class="pulse-node-green"><div class="pulse-node-green-ring"></div><div class="pulse-node-green-dot"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const redNodeIcon = L.divIcon({
  className: 'custom-military-marker-red',
  html: `<div class="pulse-node-red"><div class="pulse-node-red-ring"></div><div class="pulse-node-red-dot"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map controller to dynamically auto-pan depending on red-team threat injections
function MapController({ activeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (activeCoords) {
      map.setView(activeCoords, 3, { animate: true });
    } else {
      map.setView([45.0, -35.0], 2);
    }
  }, [activeCoords, map]);
  return null;
}

export default function WorldMap({ transmissions = [], activeAttack = null, senderCountry = "United States", receiverCountry = "United Kingdom" }) {
  const [attackCoords, setAttackCoords] = useState(null)

  const nodeACoords = countryCoords[senderCountry] || countryCoords["United States"]
  const nodeBCoords = countryCoords[receiverCountry] || countryCoords["United Kingdom"]

  // Coordinate parser to geolocate simulated threats
  const parseCoords = (coordStr) => {
    if (!coordStr) return null;
    try {
      const parts = coordStr.split(',');
      if (parts.length !== 2) return null;
      
      const latVal = parts[0].trim();
      const lngVal = parts[1].trim();
      
      const lat = parseFloat(latVal.replace(/[NSns]/g, '')) * (latVal.toUpperCase().includes('S') ? -1 : 1);
      const lng = parseFloat(lngVal.replace(/[EWew]/g, '')) * (lngVal.toUpperCase().includes('W') ? -1 : 1);
      
      if (isNaN(lat) || isNaN(lng)) return null;
      return [lat, lng];
    } catch (e) {
      console.error("Error parsing threat telemetry:", e);
      return null;
    }
  }

  useEffect(() => {
    if (activeAttack && activeAttack.coords) {
      const coords = parseCoords(activeAttack.coords);
      setAttackCoords(coords);
    } else {
      setAttackCoords(null);
    }
  }, [activeAttack])

  // Determine transmission line status colors
  const hasActiveTransmission = transmissions && transmissions.length > 0;
  const isDelivered = hasActiveTransmission && (
    transmissions[0].status === 'delivered' || 
    transmissions[0].status === 'SUCCESS' || 
    transmissions[0].status === 'DELIVERED'
  );
  
  const transmissionColor = isDelivered ? '#4ade80' : '#f87171';

  return (
    <div className="tactical-military-map crt-effect font-mono-military">
      <style>{mapStyles}</style>
      
      {/* HUD Dotted Overlay Grid & Cyber grid scanline */}
      <div className="absolute inset-0 military-grid pointer-events-none opacity-20 z-[1000]"></div>
      <div className="scanline z-[1001]"></div>

      <MapContainer 
        center={[45.0, -35.0]} 
        zoom={2} 
        scrollWheelZoom={false}
        attributionControl={false}
      >
        {/* Esri World Imagery Satellite Tiles */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />
        {/* Sleek Dark Labels Overlay for tactical country/city boundary visibility */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Dynamic Map panning */}
        <MapController activeCoords={attackCoords} />

        {/* Sender Node */}
        <Marker position={nodeACoords} icon={greenNodeIcon}>
          <Popup>
            <div className="font-bold text-army-brightGreen">NODE: {senderCountry.toUpperCase()}</div>
            <div className="text-[8px] text-gray-400 mt-1">STATUS: ONLINE // ENCRYPTED</div>
          </Popup>
        </Marker>

        {/* Receiver Node */}
        <Marker position={nodeBCoords} icon={greenNodeIcon}>
          <Popup>
            <div className="font-bold text-army-brightGreen">NODE: {receiverCountry.toUpperCase()}</div>
            <div className="text-[8px] text-gray-400 mt-1">STATUS: ONLINE // ENCRYPTED</div>
          </Popup>
        </Marker>

        {/* Dynamic Active Transmission Line */}
        {hasActiveTransmission ? (
          <Polyline 
            positions={[nodeACoords, nodeBCoords]} 
            pathOptions={{ 
              color: transmissionColor, 
              weight: 3, 
              dashArray: '6, 6',
              className: 'leaflet-transmission-line-active'
            }} 
          />
        ) : (
          <Polyline 
            positions={[nodeACoords, nodeBCoords]} 
            pathOptions={{ 
              color: '#c5a059', 
              weight: 1.5, 
              dashArray: '4, 4', 
              opacity: 0.3 
            }} 
          />
        )}

        {/* Dynamic Intruder Marker */}
        {attackCoords && (
          <>
            <Marker position={attackCoords} icon={redNodeIcon}>
              <Popup>
                <div className="font-bold text-red-500 uppercase">🚨 WARNING: ATTACK ORIGINATED</div>
                <div className="text-[8px] text-gray-400 mt-1">
                  VECTOR: {activeAttack?.attack_type || 'UNKNOWN'}<br/>
                  SOURCE IP: {activeAttack?.ip || 'N/A'}<br/>
                  COORDS: {activeAttack?.coords || 'N/A'}
                </div>
              </Popup>
            </Marker>
            
            {/* Draw Intrusion connection link to Sender */}
            <Polyline 
              positions={[attackCoords, nodeACoords]} 
              pathOptions={{ 
                color: '#ef4444', 
                weight: 2, 
                dashArray: '5, 5',
                opacity: 0.8 
              }} 
            />
          </>
        )}
      </MapContainer>

      {/* Control overlay labels */}
      <div className="absolute top-2 left-2 bg-black/80 px-2.5 py-1.5 rounded border border-army-border text-[9px] text-army-gold flex flex-col gap-0.5 z-[1002]">
        <div>TACTICAL SAT-MAP DISPLAY // OSM TILE LAYERED</div>
        <div className="text-gray-400">NODES: {senderCountry} &harr; {receiverCountry}</div>
      </div>

      <div className="absolute bottom-2 right-2 flex gap-4 text-[9px] bg-black/80 px-3 py-1.5 rounded border border-army-border z-[1002]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-army-brightGreen inline-block"></span>
          <span>SECURE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-army-gold inline-block"></span>
          <span>QKD PATH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
          <span>INTRUSION BLOCK</span>
        </div>
      </div>
    </div>
  )
}
