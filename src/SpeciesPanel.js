import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function SpeciesPanel({ species, onClose }) {
  const [photo, setPhoto] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!species) return;
    setPhoto(null);
    setChartData([]);

    // Fetch photo from iNaturalist
    fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(species.comName)}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        const taxon = data.results?.[0];
        if (taxon?.default_photo?.medium_url) {
          setPhoto(taxon.default_photo.medium_url);
        }
      });

    // Build mock monthly frequency data from observation date
    // In a real app you'd call eBird's bar chart data endpoint
    const month = new Date(species.obsDt).getMonth();
    const data = MONTHS.map((m, i) => ({
      month: m,
      count: i === month ? (species.howMany || 1) : Math.floor(Math.random() * 3),
    }));
    setChartData(data);

  }, [species]);

  if (!species) return null;

  return (
    <div style={{
      width: "300px",
      borderLeft: "1px solid #e0e0e0",
      background: "white",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: "15px", color: "#1a1a2e" }}>{species.comName}</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{species.sciName}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#aaa" }}
        >×</button>
      </div>

      {/* Photo */}
      <div style={{ height: "180px", background: "#f0f0f0", overflow: "hidden" }}>
        {photo
          ? <img src={photo} alt={species.comName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "13px" }}>No photo available</div>
        }
      </div>

      {/* Details */}
      <div style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.8" }}>
          <div>📍 {species.locName}</div>
          <div>📅 {species.obsDt}</div>
          <div>🔢 Count: {species.howMany || "Not recorded"}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "#888", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Monthly Sightings
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2196f3" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* iNaturalist link */}
      <div style={{ padding: "0 14px 14px" }}>
        
        <a  href={`https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(species.comName)}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: "12px", color: "#2196f3" }}
        >
          View on iNaturalist →
        </a>
      </div>
    </div>
  );
}

export default SpeciesPanel;