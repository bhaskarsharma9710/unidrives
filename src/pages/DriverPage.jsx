import { useState, useEffect, useRef, useCallback } from "react";
import { driverAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const C = {
  green:"#FF5A3C", greenDk:"#FF5A3C", greenLt:"#fff3f0",
  bg:"#f9fafb", card:"#ffffff", border:"#e5e7eb", text:"#1e2619", muted:"#666",
  red:"#ef4444", redLt:"#fef2f2", amber:"#f59e0b", amberLt:"#fffbeb",
  blue:"#3b82f6", blueLt:"#eff6ff",
};

// ── Helper: compute reporting time string ─────────────────────────────────────
function getReportingTime(rideTime, reportingMins) {
  try {
    const [time, period] = rideTime.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const totalMins = hours * 60 + minutes - (reportingMins || 15);
    const h = Math.floor(((totalMins % 1440) + 1440) % 1440 / 60);
    const m = ((totalMins % 60) + 60) % 60;
    const p = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${p}`;
  } catch {
    return `${reportingMins || 15} min before ${rideTime}`;
  }
}

// ── RideAssignment Notification Card ─────────────────────────────────────────
function RideAssignmentCard({ assignment, onAcknowledge, acknowledging }) {
  const reportAt = getReportingTime(assignment.rideTime, assignment.reportingMins);
  const isNew = assignment.status === "pending";

  return (
    <div style={{
      background: isNew ? "#fffbeb" : C.card,
      border: `2px solid ${isNew ? C.amber : C.border}`,
      borderRadius: 16, padding: 20, marginBottom: 14,
      boxShadow: isNew ? "0 4px 20px rgba(245,158,11,0.15)" : "none",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{isNew ? "🔔" : "✅"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
            {isNew ? "New Ride Assignment" : "Ride Assignment"}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            Assigned {new Date(assignment.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </div>
        </div>
        <span style={{
          background: isNew ? C.amberLt : C.greenLt,
          color: isNew ? "#92400e" : C.greenDk,
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        }}>
          {isNew ? "⏳ Pending" : "✓ Acknowledged"}
        </span>
      </div>

      {/* Key Alert — when to leave */}
      <div style={{
        background: isNew ? "#fef3c7" : C.greenLt,
        border: `1px solid ${isNew ? "#fcd34d" : "#86efac"}`,
        borderRadius: 10, padding: "12px 14px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>⏰</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: isNew ? "#92400e" : C.greenDk, marginBottom: 2 }}>
            REPORT BY (arrive {assignment.reportingMins || 15} min early)
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: isNew ? "#78350f" : C.greenDk }}>
            {reportAt} · {assignment.rideDate}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          ["🚐 Car Number",    assignment.carNumber],
          ["🕐 Ride Time",     assignment.rideTime],
          ["📅 Date",          assignment.rideDate],
          ["👥 Passengers",    assignment.passengerCount],
        ].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{k}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{v || "—"}</div>
          </div>
        ))}
      </div>

      {/* Route */}
      <div style={{ background: C.bg, borderRadius: 10, padding: "10px 14px", marginBottom: assignment.notes ? 10 : 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${C.green}`, background: C.card }} />
            <div style={{ width: 2, height: 18, background: C.border }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.greenDk }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.muted }}>PICKUP</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{assignment.pickupPoint}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.muted }}>DROP-OFF</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{assignment.dropPoint}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "right" }}>
            <div style={{ fontWeight: 600, color: C.text }}>{assignment.route}</div>
            <div>Route</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {assignment.notes && (
        <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#1e40af" }}>
          📝 <strong>Note:</strong> {assignment.notes}
        </div>
      )}

      {/* Acknowledge button */}
      {isNew && (
        <button
          onClick={() => onAcknowledge(assignment._id)}
          disabled={acknowledging}
          style={{
            width: "100%", padding: 12, background: acknowledging ? "#aaa" : C.amber,
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: acknowledging ? "not-allowed" : "pointer",
          }}
        >
          {acknowledging ? "Acknowledging…" : "✓ Acknowledge Ride Assignment"}
        </button>
      )}
    </div>
  );
}

// ── RideRequest Card (Uber-style) ─────────────────────────────────────────────
function RideRequestCard({ req, onAccept, onDecline }) {
  const [timeLeft,  setTimeLeft]  = useState(req.timeout || 15);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) { onDecline(req.id, "timeout"); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const progress = (timeLeft / (req.timeout || 15)) * 100;
  const urgency  = timeLeft <= 5;

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept(req);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:2000, padding:"0 0 20px" }}>
      <div style={{ background:C.card, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ height:5, background:"#f0f0f0", borderRadius:"24px 24px 0 0", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:urgency?C.red:C.green, transition:"width 1s linear, background 0.3s" }} />
        </div>
        <div style={{ padding:"20px 24px 8px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:2 }}>New Ride Request</div>
              <div style={{ fontWeight:800, fontSize:20, color:C.text }}>{req.studentName}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:28, fontWeight:900, color:urgency?C.red:C.greenDk, transition:"color 0.3s" }}>{timeLeft}s</div>
              <div style={{ fontSize:10, color:C.muted }}>to respond</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👤</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.muted }}>📞 {req.studentPhone}</span>
                {req.studentRating && <span style={{ background:"#fef9c3", color:"#854d0e", padding:"1px 8px", borderRadius:10, fontSize:11, fontWeight:600 }}>⭐ {req.studentRating}</span>}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ background:C.greenLt, color:C.greenDk, padding:"2px 10px", borderRadius:10, fontSize:11, fontWeight:600 }}>Seat #{req.seatNumber}</span>
                <span style={{ background:"#f0f0f0", color:C.muted, padding:"2px 10px", borderRadius:10, fontSize:11, fontWeight:600 }}>{req.bookingId}</span>
              </div>
            </div>
          </div>
          <div style={{ background:C.bg, borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, paddingTop:2 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", border:`2.5px solid ${C.green}`, background:C.card }} />
                <div style={{ width:2, height:24, background:C.border }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:C.greenDk }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:1 }}>PICKUP</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{req.pickup}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:1 }}>DROP-OFF</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{req.destination}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:24, fontWeight:900, color:C.greenDk }}>₹{req.fare}</div>
                <div style={{ fontSize:10, color:C.muted }}>fare</div>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, paddingBottom:8 }}>
            <button onClick={()=>onDecline(req.id,"declined")} style={{ padding:14, border:`2px solid ${C.red}`, background:C.redLt, borderRadius:14, fontSize:16, fontWeight:700, color:C.red, cursor:"pointer" }}>✕ Decline</button>
            <button onClick={handleAccept} disabled={accepting} style={{ padding:14, border:"none", background:accepting?"#aaa":C.green, borderRadius:14, fontSize:16, fontWeight:700, color:"#fff", cursor:accepting?"not-allowed":"pointer" }}>{accepting?"…":"✓ Accept"}</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

// ── Active Trip Card ──────────────────────────────────────────────────────────
function ActiveTripCard({ trip, onStart, onComplete, starting, completing }) {
  return (
    <div style={{ background:C.card, border:`2px solid ${C.green}`, borderRadius:16, padding:20, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <span style={{ fontSize:18 }}>🟢</span>
        <span style={{ fontWeight:700, fontSize:15, color:C.greenDk }}>Active Trip</span>
        <span style={{ background:C.greenLt, color:C.greenDk, padding:"2px 10px", borderRadius:10, fontSize:11, fontWeight:600, marginLeft:"auto" }}>
          {trip.van?.status==="en_route"?"En Route":"Boarding"}
        </span>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:8 }}>PASSENGERS ({trip.students?.length||0})</div>
        {(trip.students||[]).length===0 && <div style={{ color:C.muted, fontSize:13 }}>No passengers yet</div>}
        {(trip.students||[]).map((s,i)=>(
          <div key={s._id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<trip.students.length-1?`1px solid ${C.border}`:"none" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>👤</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.studentId?.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>📞 {s.studentId?.phone} · 📍 {s.studentId?.pickupLocation}</div>
            </div>
            <span style={{ background:C.greenLt, color:C.greenDk, padding:"2px 8px", borderRadius:8, fontSize:11, fontWeight:600 }}>Seat {s.seatNumber}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:trip.van?.status==="en_route"?"1fr":"1fr 1fr", gap:10 }}>
        {trip.van?.status!=="en_route" && (
          <button onClick={onStart} disabled={starting} style={{ padding:12, background:starting?"#aaa":C.green, color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:starting?"not-allowed":"pointer" }}>{starting?"Starting…":"🚀 Start Trip"}</button>
        )}
        <button onClick={onComplete} disabled={completing} style={{ padding:12, background:completing?"#aaa":C.greenDk, color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:completing?"not-allowed":"pointer" }}>{completing?"Completing…":"✅ Complete Trip"}</button>
      </div>
    </div>
  );
}

// ── MAIN DRIVER PAGE ──────────────────────────────────────────────────────────
export default function DriverPage({ navigate, showToast }) {
  const { user } = useAuth();
  const [isOnline,       setIsOnline]       = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [activeTrip,     setActiveTrip]     = useState(null);
  const [van,            setVan]            = useState(null);
  const [driverInfo,     setDriverInfo]     = useState(null);
  const [stats,          setStats]          = useState({ todayRides:0, todayEarnings:0 });
  const [assignments,    setAssignments]    = useState([]);
  const [acknowledging,  setAcknowledging]  = useState(null);
  const [newAssignAlert, setNewAssignAlert] = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [toggling,       setToggling]       = useState(false);
  const [starting,       setStarting]       = useState(false);
  const [completing,     setCompleting]     = useState(false);
  const [error,          setError]          = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await driverAPI.getMyProfile();
      setDriverInfo(data.data.driver);
      setVan(data.data.van);
      setIsOnline(data.data.driver?.isOnline||false);
    } catch(e) {
      setError(e.response?.data?.message || "Driver profile not found. Ask admin to create a driver profile for you.");
    }
  }, []);

  const loadTrip = useCallback(async () => {
    try {
      const { data } = await driverAPI.getTripDetails();
      setActiveTrip(data.data);
      setVan(data.data.van);
    } catch {
      setActiveTrip(null);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await driverAPI.getMyStats();
      setStats({ todayRides: data.data.todayRides, todayEarnings: data.data.todayEarnings });
      if (data.data.driver) setDriverInfo(data.data.driver);
    } catch {}
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const { data } = await driverAPI.getMyAssignments();
      const prev = assignments;
      setAssignments(data.data || []);
      // Check for new pending ones not in previous list
      const prevIds = new Set(prev.map(a => a._id));
      const hasNew = (data.data || []).some(a => a.status === "pending" && !prevIds.has(a._id));
      if (hasNew && prev.length > 0) {
        setNewAssignAlert(true);
        showToast("🔔 New ride assignment from admin!", "success");
        setTimeout(() => setNewAssignAlert(false), 5000);
      }
    } catch {}
  }, [assignments]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadProfile();
      await loadTrip();
      await loadStats();
      await loadAssignments();
      setLoading(false);
    };
    init();
  }, []);

  // Poll assignments every 15s
  useEffect(() => {
    const interval = setInterval(loadAssignments, 15000);
    return () => clearInterval(interval);
  }, [loadAssignments]);

  // Poll for new bookings every 10s when online
  useEffect(() => {
    if (!isOnline || !van) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await driverAPI.getTripDetails();
        if (data.data?.students?.length > 0) {
          const pending = data.data.students.filter(s => s.bookingStatus === "pending");
          if (pending.length > 0 && !currentRequest) {
            const p = pending[0];
            setCurrentRequest({
              id: p._id,
              bookingId: p._id,
              studentName: p.studentId?.name || "Student",
              studentPhone: p.studentId?.phone || "—",
              studentRating: 4.8,
              pickup: p.pickup || p.studentId?.pickupLocation || "—",
              destination: p.destination || "—",
              seatNumber: p.seatNumber,
              fare: p.fare,
              timeout: 15,
            });
          }
          setActiveTrip(data.data);
          setVan(data.data.van);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [isOnline, van, currentRequest]);

  const toggleOnline = async () => {
    setToggling(true);
    try {
      const { data } = await driverAPI.toggleOnline();
      setIsOnline(data.data.isOnline);
      setDriverInfo(data.data);
      showToast(data.data.isOnline ? "You are now online — accepting rides" : "You went offline");
    } catch(e) {
      showToast(e.response?.data?.message || "Toggle failed","error");
    } finally { setToggling(false); }
  };

  const handleAcknowledge = async (assignmentId) => {
    setAcknowledging(assignmentId);
    try {
      const { data } = await driverAPI.acknowledgeAssignment(assignmentId);
      setAssignments(prev => prev.map(a => a._id === assignmentId ? data.data : a));
      showToast("✅ Ride assignment acknowledged!");
    } catch(e) {
      showToast(e.response?.data?.message || "Failed to acknowledge","error");
    } finally { setAcknowledging(null); }
  };

  const handleAccept = async (req) => {
    try {
      await driverAPI.acceptRide(req.bookingId);
      showToast(`✅ Accepted ride from ${req.studentName}!`);
      setCurrentRequest(null);
      await loadTrip();
      await loadStats();
    } catch(e) {
      showToast(e.response?.data?.message || "Could not accept ride","error");
      setCurrentRequest(null);
    }
  };

  const handleDecline = async (id, reason) => {
    const req = currentRequest;
    setCurrentRequest(null);
    if (reason==="timeout") { showToast("Request timed out","error"); return; }
    if (req?.bookingId && !req.bookingId.startsWith("b-")) {
      try { await driverAPI.declineRide(req.bookingId); } catch {}
    }
    showToast("Ride declined");
  };

  const startTrip = async () => {
    if (!van?._id) return;
    setStarting(true);
    try {
      await driverAPI.startTrip(van._id);
      setActiveTrip(p=>({ ...p, van:{ ...p.van, status:"en_route" } }));
      setVan(p=>({ ...p, status:"en_route" }));
      showToast("🚀 Trip started! Safe driving!");
    } catch(e) { showToast(e.response?.data?.message||"Failed to start trip","error"); }
    finally { setStarting(false); }
  };

  const completeTrip = async () => {
    if (!van?._id) return;
    setCompleting(true);
    try {
      await driverAPI.completeTrip(van._id);
      setActiveTrip(null);
      setVan(p=>({ ...p, status:"idle", availableSeats:8, bookedSeats:[] }));
      showToast("✅ Trip completed! Great job!");
      await loadStats();
    } catch(e) { showToast(e.response?.data?.message||"Failed to complete trip","error"); }
    finally { setCompleting(false); }
  };

  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const pastAssignments    = assignments.filter(a => a.status !== "pending");

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", color:C.muted }}>
      Loading driver panel…
    </div>
  );

  if (error) return (
    <div style={{ maxWidth:480, margin:"60px auto", padding:20, textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🚐</div>
      <h2 style={{ color:C.text, marginBottom:8 }}>Driver Profile Not Found</h2>
      <p style={{ color:C.muted, marginBottom:20 }}>{error}</p>
      <div style={{ background:"#fef9c3", border:"1px solid #fbbf24", borderRadius:10, padding:16, fontSize:13, color:"#854d0e", textAlign:"left", marginBottom:20 }}>
        <strong>To fix this:</strong><br/>
        1. Ask your admin to go to Admin Panel → Drivers → Add Driver<br/>
        2. Or login to admin panel and click "🌱 Seed Admin/Driver" button<br/>
        3. Make sure you're logged in as a user with role "driver"
      </div>
      <button onClick={()=>navigate("home")} style={{ background:C.green, color:"#fff", border:"none", borderRadius:10, padding:"12px 24px", fontWeight:700, cursor:"pointer" }}>← Back to Home</button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',sans-serif" }}>
      {/* top bar */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🚐</span>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:C.text, fontFamily:"'Inter',sans-serif" }}>EcoVan Driver</div>
            <div style={{ fontSize:10, color:C.muted }}>{driverInfo?.name || user?.name} · {van?.vanNumber || "No van assigned"}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {pendingAssignments.length > 0 && (
            <div style={{ background:C.amber, color:"#fff", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>
              {pendingAssignments.length}
            </div>
          )}
          <button onClick={()=>navigate("home")} style={{ border:`1px solid ${C.border}`, background:"none", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", color:C.muted }}>← Back</button>
        </div>
      </div>

      <div style={{ padding:"20px", maxWidth:520, margin:"0 auto" }}>

        {/* ── PENDING RIDE ASSIGNMENTS (highest priority) ── */}
        {pendingAssignments.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🔔</span> RIDE ASSIGNMENTS FROM ADMIN ({pendingAssignments.length} pending)
            </div>
            {pendingAssignments.map(a => (
              <RideAssignmentCard
                key={a._id}
                assignment={a}
                onAcknowledge={handleAcknowledge}
                acknowledging={acknowledging === a._id}
              />
            ))}
          </div>
        )}

        {/* online toggle */}
        <div style={{ background:isOnline?C.greenDk:C.card, border:`2px solid ${isOnline?C.green:C.border}`, borderRadius:20, padding:"20px 24px", marginBottom:20, textAlign:"center", cursor:toggling?"not-allowed":"pointer", transition:"all 0.3s", boxShadow:isOnline?"0 4px 20px rgba(45,179,112,0.3)":"none", opacity:toggling?0.7:1 }} onClick={toggling?undefined:toggleOnline}>
          <div style={{ fontSize:40, marginBottom:6 }}>{toggling?"⏳":isOnline?"🟢":"⚫"}</div>
          <div style={{ fontWeight:800, fontSize:20, color:isOnline?"#fff":C.text }}>{toggling?"Updating…":isOnline?"You're Online":"You're Offline"}</div>
          <div style={{ fontSize:12, color:isOnline?"rgba(255,255,255,0.7)":C.muted, marginTop:4 }}>{isOnline?"Tap to go offline · Receiving ride requests":"Tap to start accepting rides"}</div>
        </div>

        {/* stats */}
        {(isOnline || stats.todayRides > 0) && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { icon:"🎟️", value:stats.todayRides,           label:"Rides Today"    },
              { icon:"💰", value:`₹${stats.todayEarnings}`,  label:"Earnings Today" },
              { icon:"⭐", value:driverInfo?.rating||"5.0",   label:"Your Rating"    },
            ].map(s=>(
              <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:12, textAlign:"center" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontWeight:800, fontSize:18, color:C.greenDk }}>{s.value}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* active trip */}
        {activeTrip && <ActiveTripCard trip={activeTrip} onStart={startTrip} onComplete={completeTrip} starting={starting} completing={completing} />}

        {/* van info */}
        {van && !activeTrip && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.muted, marginBottom:10 }}>YOUR VAN</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12 }}>
              {[["Car Number",van.vanNumber],["Route",van.route],["Seats Free",`${van.availableSeats}/${van.totalSeats||8}`],["Status",van.status]].map(([k,v])=>(
                <div key={k} style={{ background:C.bg, borderRadius:6, padding:"6px 10px" }}>
                  <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:600, color:C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* waiting state — only shown when online with no active trip AND no pending assignments */}
        {isOnline && !activeTrip && pendingAssignments.length === 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📡</div>
            <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:6 }}>Ready for Ride Assignments</div>
            <div style={{ fontSize:13, color:C.muted }}>Admin will assign rides directly to your dashboard.</div>
            <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <div style={{ display:"flex", gap:3 }}>
                {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
              <span style={{ fontSize:12, color:C.muted }}>Checking for new assignments every 15s…</span>
            </div>
          </div>
        )}

        {/* offline state */}
        {!isOnline && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>😴</div>
            <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:6 }}>You're Currently Offline</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Go online to start accepting student ride requests.</div>
            <button onClick={toggleOnline} disabled={toggling} style={{ background:C.green, color:"#fff", border:"none", borderRadius:12, padding:"14px 32px", fontWeight:700, fontSize:15, cursor:toggling?"not-allowed":"pointer" }}>{toggling?"Please wait…":"Go Online"}</button>
          </div>
        )}

        {/* Past assignments */}
        {pastAssignments.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>PAST ASSIGNMENTS</div>
            {pastAssignments.slice(0, 5).map(a => (
              <RideAssignmentCard
                key={a._id}
                assignment={a}
                onAcknowledge={handleAcknowledge}
                acknowledging={acknowledging === a._id}
              />
            ))}
          </div>
        )}

        {/* tips */}
        <div style={{ marginTop:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>QUICK TIPS</div>
          {[["⏰","Acknowledge ride assignments promptly so admin knows you got them"],["🗓️","Check your reporting time — arrive 15 min before the scheduled ride"],["⭐","Maintaining 4.5+ rating gets you priority requests"],["💸","Payments are processed automatically via Razorpay"]].map(([icon,tip])=>(
            <div key={tip} style={{ display:"flex", gap:8, marginBottom:8, fontSize:12, color:C.muted }}><span>{icon}</span><span>{tip}</span></div>
          ))}
        </div>
      </div>

      {/* incoming request overlay */}
      {currentRequest && isOnline && (
        <RideRequestCard req={currentRequest} onAccept={handleAccept} onDecline={handleDecline} />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}
