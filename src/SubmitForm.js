import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function SubmitForm({ onClose, onSubmitted }) {
  const [form, setForm] = useState({
    comName: "",
    locName: "",
    howMany: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.comName || !form.locName) return;
    setLoading(true);

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const record = {
          comName: form.comName,
          locName: form.locName,
          howMany: form.howMany || "Not recorded",
          notes: form.notes,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          obsDt: new Date().toISOString().slice(0, 16).replace("T", " "),
          userSubmitted: true,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "sightings"), record);
        setLoading(false);
        setSuccess(true);
        onSubmitted();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      },
      // If user denies location, use Lynnwood as default
      async () => {
        const record = {
          comName: form.comName,
          locName: form.locName,
          howMany: form.howMany || "Not recorded",
          notes: form.notes,
          lat: 47.8209,
          lng: -122.3151,
          obsDt: new Date().toISOString().slice(0, 16).replace("T", " "),
          userSubmitted: true,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "sightings"), record);
        setLoading(false);
        setSuccess(true);
        onSubmitted();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px",
    boxSizing: "border-box",
    marginTop: "4px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 500,
    color: "#555",
    display: "block",
    marginTop: "12px",
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "white", borderRadius: "12px",
        padding: "24px", width: "340px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", color: "#1a1a2e" }}>🐾 Report a Sighting</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#aaa" }}>×</button>
        </div>

        <label style={labelStyle}>Species Name *</label>
        <input
          name="comName"
          placeholder="e.g. Bald Eagle, Black-tailed Deer"
          value={form.comName}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Location Name *</label>
        <input
          name="locName"
          placeholder="e.g. Lynnwood Park, My backyard"
          value={form.locName}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>How Many?</label>
        <input
          name="howMany"
          placeholder="e.g. 2"
          value={form.howMany}
          onChange={handleChange}
          style={inputStyle}
          type="number"
        />

        <label style={labelStyle}>Notes</label>
        <textarea
          name="notes"
          placeholder="Any extra details..."
          value={form.notes}
          onChange={handleChange}
          style={{ ...inputStyle, height: "70px", resize: "none" }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !form.comName || !form.locName}
          style={{
            marginTop: "18px", width: "100%", padding: "10px",
            background: loading ? "#aaa" : success ? "#4caf50" : "#1a1a2e",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "14px", cursor: "pointer", fontWeight: 500,
          }}
        >
          {loading ? "Submitting..." : success ? "✓ Submitted!" : "Submit Sighting"}
        </button>
      </div>
    </div>
  );
}

export default SubmitForm;