import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { vanAPI } from "../services/api";

export default function TrackingPage({ trackingVanId, showToast }) {
  const { user } = useAuth();
  const { getSocket, disconnect } = useSocket();
  const [eta,        setEta]    = useState(18);
  const [vanStatus,  setVanStatus]  = useState("en_route");
  const [location,   setLocation]   = useState({ lat: 28.5355, lng: 77.391 });
  const [vanInfo,    setVanInfo]    = useState(null);
  const [progress,   setProgress]   = useState(40);
  const etaRef = useRef(null);

  useEffect(() => {
    // Fetch van info
    if (trackingVanId && !trackingVanId.startsWith("mock")) {
      vanAPI.getOne(trackingVanId).then(({ data }) => setVanInfo(data.data)).catch(() => {});
    }

    // Socket connection
    if (user && trackingVanId) {
      try {
        const socket = getSocket();
        socket.emit("student:track_van", { vanId: trackingVanId });
        socket.on("van:location_update", ({ lat, lng }) => {
          setLocation({ lat, lng });
          setProgress(p => Math.min(p + 2, 95));
        });
        socket.on("van:status_update", ({ status }) => setVanStatus(status));
        socket.on("notification", ({ message, type }) => showToast(message, type || "info"));
        return () => {
          socket.emit("student:untrack_van", { vanId: trackingVanId });
          socket.off("van:location_update");
          socket.off("van:status_update");
          socket.off("notification");
        };
      } catch {}
    }

    // ETA countdown
    etaRef.current = setInterval(() => setEta(p => p > 1 ? p - 1 : p), 5000);
    return () => { clearInterval(etaRef.current); };
  }, [trackingVanId]);

  const timeline = [
    { label: "Picked up",            sub: "Botanical Garden · 8:04 AM", status: "done"    },
    { label: "En route",             sub: `Near Sector 62 · ${eta} min remaining`, status: vanStatus==="en_route"?"active":"done" },
    { label: "Arriving at University", sub: "Est. 8:22 AM",             status: vanStatus==="completed"?"done":"pending" },
  ];

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-5">
        <h2 className="text-2xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>Live Van Tracking</h2>
        <p className="text-sm text-gray-500 mt-1">
          {vanInfo ? `Van ${vanInfo.vanNumber} · ${vanInfo.driverName}` : "Tracking your van in real time"}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 mt-5 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Map */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-[350px] sm:min-h-[480px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5e1] via-[#d4edda] to-[#c8e6d8]" />
          <div className="absolute inset-0">
            <div className="absolute w-2 h-full bg-white/60 left-1/2 -translate-x-1/2" />
            <div className="absolute h-2 w-full bg-white/60 top-1/2 -translate-y-1/2" />
            {/* Grid pattern */}
            {[25,50,75].map(p => (
              <div key={p}>
                <div className="absolute h-px w-full bg-white/30" style={{ top:`${p}%` }} />
                <div className="absolute w-px h-full bg-white/30" style={{ left:`${p}%` }} />
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between z-10">
            <div className="bg-white/95 rounded-lg px-3 py-2 text-xs shadow-md">
              📍 Sector 62, Noida<br/>
              <span className="text-[#FF5A3C] font-bold">●</span> <span className="text-gray-500">Van in motion</span>
            </div>
            <div className="bg-white/95 rounded-lg px-3 py-2 text-xs shadow-md text-right">
              🛰 GPS {user && trackingVanId ? "Live" : "Demo"}<br/>
              <span className="text-gray-500">Updated now</span>
            </div>
          </div>

          {/* Van icon */}
          <div className="absolute text-4xl z-10 transition-all duration-1000"
            style={{ top:"42%", left:`${30+progress*0.3}%`, transform:"translate(-50%,-50%)", filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
            🚐
          </div>

          {/* Route bar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 z-10">
            <div className="bg-white/95 rounded-lg px-3 py-2 text-xs shrink-0 shadow">🚉 <strong>Botanical Garden</strong></div>
            <div className="flex-1 h-2 bg-[#FF5A3C]/20 rounded-full relative">
              <div className="absolute h-full bg-[#111] rounded-full transition-all duration-1000" style={{ width:`${progress}%` }} />
            </div>
            <div className="bg-white/95 rounded-lg px-3 py-2 text-xs shrink-0 shadow">🏫 <strong>Galgotias Univ.</strong></div>
          </div>
        </div>

        {/* Panel */}
        <div className="flex flex-col gap-3">
          {/* Driver */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-3">Driver Details</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center font-bold text-[#111] shrink-0">
                {(vanInfo?.driverName || "RS").split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <div>
                <div className="font-semibold text-sm">{vanInfo?.driverName || "Rajesh Singh"}</div>
                <div className="text-xs text-gray-500">Van {vanInfo?.vanNumber || "GJ-1203"} · ⭐ {vanInfo?.driverRating || 4.9}</div>
                <span className="inline-flex items-center gap-1 bg-orange-50 text-[#111] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">✓ Verified</span>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-2">ETA</p>
            <div className="text-4xl font-extrabold text-[#111]" style={{ fontFamily:"'Syne',sans-serif" }}>{eta} min</div>
            <div className="text-xs text-gray-500 mt-1">Arriving around 8:22 AM</div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[["Distance","7.2 km"],["Passengers",`${vanInfo ? 8-vanInfo.availableSeats : 5} / 8`]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-gray-500 mb-0.5">{l}</div>
                  <div className="font-semibold text-sm">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-3">Trip Progress</p>
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3 py-2.5 relative">
                {i < timeline.length-1 && <div className="absolute left-[13px] top-7 w-0.5 h-full bg-[#d4dcc8]" />}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 font-bold ${item.status==="done"?"bg-[#111] text-white":item.status==="active"?"bg-orange-50 border-2 border-[#FF5A3C] text-[#111]":"bg-gray-100 border-2 border-gray-200 text-gray-300"}`}>
                  {item.status==="done"?"✓":item.status==="active"?"🚐":"●"}
                </div>
                <div className="pt-0.5">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-red-100 text-red-600 py-3 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors" style={{ fontFamily:"'Syne',sans-serif" }}>
            🆘 SOS Emergency
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 6px))}}`}</style>
    </div>
  );
}
