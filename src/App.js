import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SpeciesPanel from "./SpeciesPanel";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import SubmitForm from "./SubmitForm";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const API_KEY = process.env.REACT_APP_EBIRD_API_KEY;
const LAT = 47.8209;
const LNG = -122.3151;

function App() {
  const [sightings, setSightings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [userSightings, setUserSightings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  useEffect(() => {
    console.log("API Key:", process.env.REACT_APP_EBIRD_API_KEY);
    fetch(
      `https://api.ebird.org/v2/data/obs/geo/recent?lat=${LAT}&lng=${LNG}&dist=25&maxResults=50`,
      { headers: { "X-eBirdApiToken": API_KEY } }
    )
      .then((res) => res.json())
      .then((data) => setSightings(data));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sightings"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserSightings(data);
    });
    return () => unsub();
  }, []);

  const allSightings = [...sightings, ...userSightings];

  const filtered = allSightings
    .filter((s) => s.comName.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.comName.localeCompare(b.comName);
      if (sortBy === "region") return a.comName.localeCompare(b.comName);
      if (sortBy == "date") return new Date(b.obsDt) - new Date(a.obsDt);
      return 0;
    })

  const handleSelect = (s) => {
    setSelected(s);
    if (s.lat && s.lng && mapRef.current) {
      mapRef.current.flyTo([s.lat, s.lng], 14, { duration: 1 });
      setTimeout(() => {
        const marker = markerRefs.current[s.obsId];
        if (marker) marker.openPopup();
      }, 1100);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "12px 20px", background: "#1a1a2e", color: "white", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "22px" }}>🦅</span>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 500 }}>PNW Wildlife Sightings</h1>
        <span style={{ marginLeft: "auto", fontSize: "13px", opacity: 0.6 }} >
          {sightings.length} sightings near Lynnwood, WA
        </span>
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginLeft: "16px", padding: "6px 14px",
            background: "#4caf50", color: "white",
            border: "none", borderRadius: "6px",
            fontSize: "13px", cursor: "pointer", fontWeight: 500,
          }}
        >
          + Report Sighting
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: "300px", display: "flex", flexDirection: "column", borderRight: "1px solid #e0e0e0", background: "#fafafa" }}>

          {/* Search */}
          <div style={{ padding: "12px", borderBottom: "1px solid #eee", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              placeholder="Search species..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: "6px",
                border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box"
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: "6px",
                border: "1px solid #ddd", fontSize: "13px", background: "white",
                boxSizing: "border-box", cursor: "pointer"
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="region">Sort by Region</option>
            </select>
            <div style={{ fontSize: "12px", color: "#aaa" }}>
              {filtered.length} sightings · <span style={{ color: "#4caf50" }}>● user</span> <span style={{ color: "#2196f3" }}>● eBird</span>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((s, i) => (
              <div
                key={i}
                onClick={() => handleSelect(s)}
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: selected?.obsId === s.obsId ? "#e8f4fd" : "white",
                  borderLeft: selected?.obsId === s.obsId ? "3px solid #2196f3" : "3px solid transparent",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: "14px", color: "#1a1a2e" }}>{s.comName}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.locName}</div>
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                  {s.obsDt} {s.howMany ? `· ${s.howMany} seen` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapContainer
            center={[LAT, LNG]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {filtered.map((s, i) =>
              s.lat && s.lng ? (
                <Marker
                  key={i}
                  position={[s.lat, s.lng]}
                  ref={(ref) => { if (ref) markerRefs.current[s.obsId] = ref; }}
                >
                  <Popup>
                    <strong>{s.comName}</strong>
                    <br />
                    {s.locName}
                    <br />
                    {s.obsDt}
                    <br />
                    Count: {s.howMany || "Not recorded"}
                  </Popup>
                </Marker>
              ) : null
            )}

            {userSightings.map((s, i) =>
              s.lat && s.lng ? (
                <Marker
                  key={`user-${i}`}
                  position={[s.lat, s.lng]}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="background:#4caf50;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                  })}
                >
                  <Popup>
                    <strong>👤 {s.comName}</strong>
                    <br />
                    {s.locName}
                    <br />
                    {s.obsDt}
                    <br />
                    Count: {s.howMany}
                    {s.notes && <><br />Note: {s.notes}</>}
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>

        {/* Species Panel — add here */}
        <SpeciesPanel species={selected} onClose={() => setSelected(null)} />

        {showForm && (
          <SubmitForm
            onClose={() => setShowForm(false)}
            onSubmitted={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
