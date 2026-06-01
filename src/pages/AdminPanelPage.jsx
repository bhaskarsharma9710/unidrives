import { useState, useEffect, useCallback } from "react";
import { vanAPI, bookingAPI, driverAPI, authAPI } from "../services/api";

const C = {
  green:"#FF5A3C", greenDk:"#FF5A3C", greenLt:"#fff3f0",
  bg:"#f9fafb", card:"#ffffff", border:"#e5e7eb", text:"#1e2619", muted:"#666",
};

const Badge = ({ status }) => {
  const map = {
    confirmed:{ bg:"#fff3f0", color:"#FF5A3C", label:"Confirmed" },
    completed: { bg:"#f0f0f0", color:"#555",    label:"Completed"  },
    cancelled: { bg:"#fde8e8", color:"#b91c1c", label:"Cancelled"  },
    pending:   { bg:"#fef9c3", color:"#854d0e", label:"Pending"    },
    paid:      { bg:"#dbeafe", color:"#1d4ed8", label:"Paid"       },
    failed:    { bg:"#fde8e8", color:"#b91c1c", label:"Failed"     },
    refunded:  { bg:"#f3e8ff", color:"#7c3aed", label:"Refunded"   },
    idle:      { bg:"#f0f0f0", color:"#555",    label:"Idle"       },
    active:    { bg:"#fff3f0", color:"#FF5A3C", label:"Active"     },
    en_route:  { bg:"#dbeafe", color:"#1d4ed8", label:"En Route"   },
    online:    { bg:"#fff3f0", color:"#FF5A3C", label:"Online"     },
    offline:   { bg:"#f0f0f0", color:"#555",    label:"Offline"    },
    verified:  { bg:"#fff3f0", color:"#FF5A3C", label:"Verified"   },
    unverified:{ bg:"#fef9c3", color:"#854d0e", label:"Unverified" },
  };
  const s = map[status] || map.pending;
  return <span style={{ background:s.bg, color:s.color, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{s.label}</span>;
};

const StatCard = ({ icon, value, label, accent }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
    <div style={{ width:46, height:46, borderRadius:12, background:accent||C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
    <div>
      <div style={{ fontSize:24, fontWeight:800, color:C.greenDk, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{label}</div>
    </div>
  </div>
);

const inp = { width:"100%", padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, background:C.bg, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const btn = (variant="primary") => ({
  border: variant==="primary" ? "none" : `1px solid ${variant==="danger"?"#fca5a5":C.border}`,
  background: variant==="primary" ? C.green : variant==="danger" ? "#fef2f2" : variant==="ghost" ? "none" : C.greenLt,
  color: variant==="primary" ? "#fff" : variant==="danger" ? "#b91c1c" : variant==="ghost" ? C.muted : C.greenDk,
  borderRadius:7, padding:"6px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
});

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:C.card, borderRadius:16, width:wide?640:460, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", padding:"24px 28px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:C.text }}>{title}</h2>
        <button onClick={onClose} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer", color:C.muted }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const TABS = [
  { id:"overview", label:"📊 Overview" },
  { id:"vans",     label:"🚐 Vans"     },
  { id:"drivers",  label:"👤 Drivers"  },
  { id:"bookings", label:"🎟️ Bookings" },
  { id:"users",    label:"👥 Users"    },
];

const EMPTY_VAN = { vanNumber:"", driverName:"", driverRating:"5.0", route:"Botanical Garden → Galgotias University", departureTime:"7:00 AM", fare:"49", totalSeats:"8" };
const EMPTY_DRIVER = { name:"", phone:"", licenseNumber:"", vehicleNumber:"" };
const EMPTY_ASSIGNMENT = { carNumber:"", route:"", pickupPoint:"", dropPoint:"", rideDate:"", rideTime:"", reportingMins:"15", passengerCount:"1", notes:"" };

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewTab({ vans, bookings, drivers, onRefresh }) {
  const totalRevenue = bookings.filter(b=>b.paymentStatus==="paid").reduce((s,b)=>s+b.fare,0);
  const activeVans   = vans.filter(v=>v.status==="en_route"||v.status==="active").length;
  const onlineDrivers= drivers.filter(d=>d.isOnline).length;
  const statusCount  = { confirmed:0, completed:0, cancelled:0, pending:0 };
  bookings.forEach(b=>{ if(statusCount[b.bookingStatus]!==undefined) statusCount[b.bookingStatus]++; });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={onRefresh} style={btn("ghost")}>🔄 Refresh</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        <StatCard icon="💰" value={`₹${totalRevenue.toLocaleString()}`} label="Total Revenue"  accent="#fef9c3" />
        <StatCard icon="🎟️" value={bookings.length}                      label="Total Bookings" accent="#dbeafe" />
        <StatCard icon="🚐" value={`${activeVans}/${vans.length}`}        label="Active Vans"    accent={C.greenLt} />
        <StatCard icon="👤" value={`${onlineDrivers}/${drivers.length}`}  label="Online Drivers" accent="#f3e8ff" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.text }}>Booking Breakdown</h3>
          {Object.entries(statusCount).map(([status,count])=>(
            <div key={status} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <Badge status={status} />
              <div style={{ flex:1, height:6, background:"#f0f0f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, width:bookings.length?`${(count/bookings.length)*100}%`:"0%", background:status==="confirmed"?C.green:status==="completed"?"#888":status==="cancelled"?"#ef4444":"#eab308", transition:"width 0.6s ease" }} />
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:C.muted, minWidth:24 }}>{count}</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.text }}>Van Fleet Status</h3>
          {vans.slice(0,6).map(van=>(
            <div key={van._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{van.vanNumber}</div>
                <div style={{ fontSize:11, color:C.muted }}>{van.driverName}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.muted }}>{(van.totalSeats||8)-van.availableSeats}/{van.totalSeats||8}</span>
                <Badge status={van.status} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20, gridColumn:"1/-1" }}>
          <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.text }}>Recent Bookings</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
              {["Ticket","Student","Van","Seat","Fare","Status","Payment","Date"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"6px 10px", color:C.muted, fontWeight:600, fontSize:11 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{bookings.slice(0,8).map(b=>(
              <tr key={b._id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:11, color:C.greenDk }}>{b.ticketId}</td>
                <td style={{ padding:"8px 10px" }}><div style={{ fontWeight:600 }}>{b.studentId?.name}</div><div style={{ fontSize:11, color:C.muted }}>{b.studentId?.email}</div></td>
                <td style={{ padding:"8px 10px", color:C.muted }}>{b.vanId?.vanNumber}</td>
                <td style={{ padding:"8px 10px" }}>#{b.seatNumber}</td>
                <td style={{ padding:"8px 10px", fontWeight:600 }}>₹{b.fare}</td>
                <td style={{ padding:"8px 10px" }}><Badge status={b.bookingStatus} /></td>
                <td style={{ padding:"8px 10px" }}><Badge status={b.paymentStatus} /></td>
                <td style={{ padding:"8px 10px", color:C.muted, fontSize:11 }}>{new Date(b.createdAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── VANS TAB ──────────────────────────────────────────────────────────────────
function VansTab({ vans, setVans, showToast }) {
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(EMPTY_VAN);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const upd = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const openAdd  = () => { setForm(EMPTY_VAN); setEditId(null); setModal("van"); };
  const openEdit = v  => { setForm({ vanNumber:v.vanNumber, driverName:v.driverName, driverRating:String(v.driverRating), route:v.route, departureTime:v.departureTime, fare:String(v.fare), totalSeats:String(v.totalSeats||8) }); setEditId(v._id); setModal("van"); };

  const save = async () => {
    if (!form.vanNumber||!form.driverName) return showToast("Fill required fields","error");
    setSaving(true);
    const payload = { ...form, driverRating:parseFloat(form.driverRating), fare:parseInt(form.fare), totalSeats:parseInt(form.totalSeats) };
    try {
      if (!editId) {
        const { data } = await vanAPI.create({ ...payload, availableSeats:payload.totalSeats });
        setVans(p=>[data.data,...p]);
      } else {
        const { data } = await vanAPI.update(editId, payload);
        setVans(p=>p.map(v=>v._id===editId?data.data:v));
      }
      showToast(editId?"Van updated!":"Van added!");
    } catch(e) {
      showToast(e.response?.data?.message||"Save failed","error");
    } finally { setSaving(false); setModal(null); }
  };

  const remove = async id => {
    if (!window.confirm("Delete this van?")) return;
    try { await vanAPI.remove(id); } catch(e) { showToast(e.response?.data?.message||"Delete failed","error"); return; }
    setVans(p=>p.filter(v=>v._id!==id));
    showToast("Van deleted");
  };

  const toggleActive = async van => {
    try {
      const { data } = await vanAPI.update(van._id, { isActive:!van.isActive });
      setVans(p=>p.map(v=>v._id===van._id?data.data:v));
      showToast(van.isActive?"Van deactivated":"Van activated");
    } catch { showToast("Update failed","error"); }
  };

  const changeStatus = async (van, status) => {
    try {
      const { data } = await vanAPI.update(van._id, { status });
      setVans(p=>p.map(v=>v._id===van._id?data.data:v));
      showToast("Status updated");
    } catch { showToast("Update failed","error"); }
  };

  const filtered = vans.filter(v =>
    v.vanNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <input style={{...inp,flex:1}} placeholder="Search by van number or driver..." value={search} onChange={e=>setSearch(e.target.value)} />
        <button onClick={openAdd} style={{ background:C.green, color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Add Van</button>
      </div>

      {filtered.length===0 && <div style={{ textAlign:"center", padding:40, color:C.muted }}>No vans found. Add one above.</div>}

      <div style={{ display:"grid", gap:10 }}>
        {filtered.map(van=>(
          <div key={van._id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, opacity:van.isActive?1:0.55 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🚐</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{van.vanNumber}</span>
                <Badge status={van.status} />
                {!van.isActive && <Badge status="offline" />}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                {van.driverName} · ⭐ {van.driverRating} · {van.route} · {van.departureTime}
              </div>
            </div>
            <div style={{ textAlign:"center", minWidth:60 }}>
              <div style={{ fontSize:18, fontWeight:800, color:C.greenDk }}>{van.availableSeats}<span style={{ fontSize:12, fontWeight:400, color:C.muted }}>/{van.totalSeats||8}</span></div>
              <div style={{ fontSize:10, color:C.muted }}>seats free</div>
            </div>
            <div style={{ textAlign:"center", minWidth:50 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>₹{van.fare}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <select value={van.status} onChange={e=>changeStatus(van,e.target.value)} style={{ ...btn("ghost"), padding:"5px 8px", border:`1px solid ${C.border}` }}>
                <option value="idle">Idle</option>
                <option value="active">Active</option>
                <option value="en_route">En Route</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={()=>toggleActive(van)} style={btn("ghost")}>{van.isActive?"Deactivate":"Activate"}</button>
              <button onClick={()=>openEdit(van)} style={btn("secondary")}>Edit</button>
              <button onClick={()=>remove(van._id)} style={btn("danger")}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal==="van" && (
        <Modal title={editId?"Edit Van":"Add New Van"} onClose={()=>setModal(null)}>
          {[["Van Number *","vanNumber","text","e.g. GJ-1234"],["Driver Name *","driverName","text","e.g. Rajesh Kumar"],["Driver Rating","driverRating","number","5.0"],["Departure Time","departureTime","text","7:00 AM"],["Fare (₹)","fare","number","49"],["Total Seats","totalSeats","number","8"]].map(([label,key,type,ph])=>(
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>{label}</label>
              <input type={type} style={inp} placeholder={ph} value={form[key]} onChange={upd(key)} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>Route *</label>
            <select style={inp} value={form.route} onChange={upd("route")}>
              <option>Botanical Garden → Galgotias University</option>
              <option>Galgotias University → Botanical Garden</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={save} disabled={saving} style={{ flex:1, background:C.green, color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:14, cursor:saving?"not-allowed":"pointer" }}>{saving?"Saving…":editId?"Update Van":"Add Van"}</button>
            <button onClick={()=>setModal(null)} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── DRIVERS TAB ───────────────────────────────────────────────────────────────
function DriversTab({ drivers, setDrivers, showToast }) {
  const [modal,        setModal]        = useState(false);   // "edit" | "assign" | false
  const [editId,       setEditId]       = useState(null);
  const [form,         setForm]         = useState(EMPTY_DRIVER);
  const [assignForm,   setAssignForm]   = useState(EMPTY_ASSIGNMENT);
  const [assignDriver, setAssignDriver] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const upd  = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const updA = k => e => setAssignForm(p=>({...p,[k]:e.target.value}));

  const openAdd    = () => { setForm(EMPTY_DRIVER); setEditId(null); setModal("edit"); };
  const openEdit   = d  => { setForm({ name:d.name, phone:d.phone, licenseNumber:d.licenseNumber, vehicleNumber:d.vehicleNumber }); setEditId(d._id); setModal("edit"); };
  const openAssign = d  => { setAssignForm(EMPTY_ASSIGNMENT); setAssignDriver(d); setModal("assign"); };

  const save = async () => {
    if (!form.name||!form.licenseNumber) return showToast("Fill required fields","error");
    setSaving(true);
    try {
      if (!editId) {
        const { data } = await driverAPI.create(form);
        setDrivers(p=>[data.data,...p]);
        showToast("Driver added!");
      } else {
        const { data } = await driverAPI.update(editId, form);
        setDrivers(p=>p.map(d=>d._id===editId?data.data:d));
        showToast("Driver updated!");
      }
      setModal(false); setForm(EMPTY_DRIVER); setEditId(null);
    } catch(e) { showToast(e.response?.data?.message||"Save failed","error"); }
    finally { setSaving(false); }
  };

  const saveAssignment = async () => {
    const { carNumber, route, pickupPoint, dropPoint, rideDate, rideTime } = assignForm;
    if (!carNumber||!pickupPoint||!dropPoint||!rideDate||!rideTime)
      return showToast("Fill all required fields","error");
    setSaving(true);
    try {
      await driverAPI.assignRide(assignDriver._id, {
        ...assignForm,
        reportingMins: Number(assignForm.reportingMins)||15,
        passengerCount: Number(assignForm.passengerCount)||1,
      });
      showToast(`✅ Ride assigned to ${assignDriver.name}! They will see it on their dashboard.`);
      setModal(false); setAssignDriver(null); setAssignForm(EMPTY_ASSIGNMENT);
    } catch(e) { showToast(e.response?.data?.message||"Assignment failed","error"); }
    finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm("Remove this driver?")) return;
    try { await driverAPI.remove(id); setDrivers(p=>p.filter(d=>d._id!==id)); showToast("Driver removed"); }
    catch(e) { showToast(e.response?.data?.message||"Delete failed","error"); }
  };

  const verify = async (id, val) => {
    try {
      const { data } = await driverAPI.verify(id, val);
      setDrivers(p=>p.map(d=>d._id===id?data.data:d));
      showToast(val?"Driver verified!":"Verification removed");
    } catch { showToast("Update failed","error"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={openAdd} style={{ background:C.green, color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Add Driver</button>
      </div>

      {drivers.length===0 && <div style={{ textAlign:"center", padding:40, color:C.muted }}>No drivers yet. Add one above.</div>}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {drivers.map(d=>(
          <div key={d._id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🧑‍✈️</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{d.name}</span>
                  <Badge status={d.isOnline?"online":"offline"} />
                  <Badge status={d.isVerified?"verified":"unverified"} />
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.phone}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12, marginBottom:12 }}>
              {[["License",d.licenseNumber||"—"],["Vehicle",d.vehicleNumber||"—"],["Rating",`⭐ ${d.rating}`],["Rides",d.totalRides]].map(([k,v])=>(
                <div key={k} style={{ background:C.bg, borderRadius:6, padding:"6px 10px" }}>
                  <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:600, color:C.text }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button onClick={()=>openAssign(d)} style={{ background:"#f59e0b", color:"#fff", border:"none", borderRadius:7, padding:"6px 12px", fontSize:12, cursor:"pointer", fontWeight:700, flex:1 }}>📋 Assign Ride</button>
              <button onClick={()=>verify(d._id,!d.isVerified)} style={{ ...btn(d.isVerified?"ghost":"secondary"), textAlign:"center" }}>{d.isVerified?"✓ Verified":"Verify"}</button>
              <button onClick={()=>openEdit(d)} style={btn("ghost")}>Edit</button>
              <button onClick={()=>remove(d._id)} style={btn("danger")}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Driver Modal */}
      {modal==="edit" && (
        <Modal title={editId?"Edit Driver":"Add New Driver"} onClose={()=>{ setModal(false); setEditId(null); }}>
          {[["Full Name *","name","text","e.g. Rajesh Kumar"],["Phone *","phone","text","10-digit mobile"],["License Number *","licenseNumber","text","DL-XXXX-XXXXXX"],["Vehicle Number *","vehicleNumber","text","e.g. GJ-1234"]].map(([label,key,type,ph])=>(
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>{label}</label>
              <input type={type} style={inp} placeholder={ph} value={form[key]} onChange={upd(key)} />
            </div>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={save} disabled={saving} style={{ flex:1, background:C.green, color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>{saving?"Saving…":editId?"Update Driver":"Add Driver"}</button>
            <button onClick={()=>{ setModal(false); setEditId(null); }} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Assign Ride Modal */}
      {modal==="assign" && assignDriver && (
        <Modal title={`Assign Ride → ${assignDriver.name}`} onClose={()=>{ setModal(false); setAssignDriver(null); }} wide>
          <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#92400e" }}>
            🔔 This assignment will appear as a notification on <strong>{assignDriver.name}'s</strong> driver dashboard immediately.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              ["Car/Van Number *","carNumber","text","e.g. UP-16-AB-1234"],
              ["Route *","route","text","e.g. Sector 62 → Galgotias"],
              ["Pickup Point *","pickupPoint","text","e.g. Sector 62 Metro Gate 2"],
              ["Drop Point *","dropPoint","text","e.g. Galgotias University Gate 1"],
              ["Ride Date *","rideDate","date",""],
              ["Ride Time *","rideTime","time",""],
              ["Reporting Time (min early)","reportingMins","number","15"],
              ["Passenger Count","passengerCount","number","1"],
            ].map(([label,key,type,ph])=>(
              <div key={key} style={{ marginBottom:4 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>{label}</label>
                <input type={type} style={inp} placeholder={ph} value={assignForm[key]} onChange={updA(key)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:12 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>Notes / Instructions</label>
            <textarea style={{ ...inp, height:64, resize:"vertical" }} placeholder="Any special instructions for the driver…" value={assignForm.notes} onChange={updA("notes")} />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={saveAssignment} disabled={saving} style={{ flex:1, background:"#f59e0b", color:"#fff", border:"none", borderRadius:8, padding:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>{saving?"Sending…":"📋 Assign Ride to Driver"}</button>
            <button onClick={()=>{ setModal(false); setAssignDriver(null); }} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:12, fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── BOOKINGS TAB ──────────────────────────────────────────────────────────────
function BookingsTab({ bookings, setBookings, showToast }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statusModal, setStatusModal] = useState(null);

  const filtered = bookings.filter(b => {
    const matchStatus = filter==="all" || b.bookingStatus===filter;
    const matchSearch = !search || b.ticketId?.toLowerCase().includes(search.toLowerCase()) || b.studentId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (bookingId, bookingStatus, paymentStatus) => {
    try {
      const { data } = await bookingAPI.updateStatus(bookingId, { bookingStatus, paymentStatus });
      setBookings(p=>p.map(b=>b._id===bookingId?data.data:b));
      showToast("Booking updated");
      setStatusModal(null);
    } catch(e) { showToast(e.response?.data?.message||"Update failed","error"); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input style={{...inp,flex:1,minWidth:200}} placeholder="Search ticket or student..." value={search} onChange={e=>setSearch(e.target.value)} />
        {["all","confirmed","pending","completed","cancelled"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ border:`1px solid ${filter===s?C.green:C.border}`, background:filter===s?C.greenLt:C.card, color:filter===s?C.greenDk:C.muted, borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.bg, borderBottom:`2px solid ${C.border}` }}>
              {["Ticket ID","Student","Van","Seat","Fare","Status","Payment","Date","Actions"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"10px 12px", color:C.muted, fontWeight:600, fontSize:11, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={9} style={{ textAlign:"center", padding:32, color:C.muted }}>No bookings found</td></tr>
            ) : filtered.map((b,i)=>(
              <tr key={b._id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.card:"#fafbf9" }}>
                <td style={{ padding:"10px 12px", fontFamily:"monospace", fontSize:11, color:C.greenDk, fontWeight:600 }}>{b.ticketId}</td>
                <td style={{ padding:"10px 12px" }}><div style={{ fontWeight:600 }}>{b.studentId?.name}</div><div style={{ fontSize:11, color:C.muted }}>{b.studentId?.email}</div></td>
                <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{b.vanId?.vanNumber}</td>
                <td style={{ padding:"10px 12px", fontWeight:600 }}>#{b.seatNumber}</td>
                <td style={{ padding:"10px 12px", fontWeight:700, color:C.greenDk }}>₹{b.fare}</td>
                <td style={{ padding:"10px 12px" }}><Badge status={b.bookingStatus} /></td>
                <td style={{ padding:"10px 12px" }}><Badge status={b.paymentStatus} /></td>
                <td style={{ padding:"10px 12px", color:C.muted, fontSize:11 }}>{new Date(b.createdAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</td>
                <td style={{ padding:"10px 12px" }}>
                  <button onClick={()=>setStatusModal(b)} style={btn("secondary")}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statusModal && (
        <Modal title={`Update Booking — ${statusModal.ticketId}`} onClose={()=>setStatusModal(null)}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>Student: <strong>{statusModal.studentId?.name}</strong> · Van: <strong>{statusModal.vanId?.vanNumber}</strong></div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>Booking Status</label>
            <select id="bs" defaultValue={statusModal.bookingStatus} style={inp}>
              {["confirmed","pending","completed","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>Payment Status</label>
            <select id="ps" defaultValue={statusModal.paymentStatus} style={inp}>
              {["pending","paid","failed","refunded"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{ const bs=document.getElementById("bs").value; const ps=document.getElementById("ps").value; updateStatus(statusModal._id,bs,ps); }} style={{ flex:1, background:C.green, color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, cursor:"pointer" }}>Update</button>
            <button onClick={()=>setStatusModal(null)} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:10, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────
function UsersTab({ users, setUsers, showToast }) {
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState(null);

  const roleColor = {
    student:{ bg:"#dbeafe", color:"#1d4ed8" },
    driver: { bg:C.greenLt, color:C.greenDk  },
    admin:  { bg:"#f3e8ff", color:"#7c3aed"  },
  };

  const updateRole = async (userId, role) => {
    try {
      const { data } = await authAPI.updateUserRole(userId, role);
      setUsers(p=>p.map(u=>u._id===userId?data.data:u));
      showToast("Role updated");
      setRoleModal(null);
    } catch(e) { showToast(e.response?.data?.message||"Update failed","error"); }
  };

  const deleteUser = async id => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await authAPI.deleteUser(id);
      setUsers(p=>p.filter(u=>u._id!==id));
      showToast("User deleted");
    } catch(e) { showToast(e.response?.data?.message||"Delete failed","error"); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <input style={inp} placeholder="Search users by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.bg, borderBottom:`2px solid ${C.border}` }}>
              {["User","Email","Phone","Role","Pickup Location","Joined","Actions"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", color:C.muted, fontWeight:600, fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", padding:32, color:C.muted }}>No users found</td></tr>}
            {filtered.map((u,i)=>{
              const rc = roleColor[u.role]||roleColor.student;
              return (
                <tr key={u._id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.card:"#fafbf9" }}>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:rc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:rc.color }}>{u.name?.charAt(0)}</div>
                      <span style={{ fontWeight:600, color:C.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"10px 14px", color:C.muted }}>{u.email}</td>
                  <td style={{ padding:"10px 14px", color:C.muted }}>{u.phone}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ ...rc, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{u.role}</span></td>
                  <td style={{ padding:"10px 14px", color:C.muted, fontSize:12 }}>{u.pickupLocation||"—"}</td>
                  <td style={{ padding:"10px 14px", color:C.muted, fontSize:11 }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setRoleModal(u)} style={btn("secondary")}>Change Role</button>
                      <button onClick={()=>deleteUser(u._id)} style={btn("danger")}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {roleModal && (
        <Modal title={`Change Role — ${roleModal.name}`} onClose={()=>setRoleModal(null)}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:4 }}>New Role</label>
            <select id="nr" defaultValue={roleModal.role} style={inp}>
              <option value="student">student</option>
              <option value="driver">driver</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>updateRole(roleModal._id, document.getElementById("nr").value)} style={{ flex:1, background:C.green, color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, cursor:"pointer" }}>Update Role</button>
            <button onClick={()=>setRoleModal(null)} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:10, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminPanelPage({ showToast, navigate }) {
  const [tab,      setTab]      = useState("overview");
  const [vans,     setVans]     = useState([]);
  const [drivers,  setDrivers]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [seeding,  setSeeding]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [v,b,d,u] = await Promise.allSettled([
        vanAPI.getAll(), bookingAPI.getAll(), driverAPI.getAll(), authAPI.getAllUsers(),
      ]);
      setVans(    v.status==="fulfilled" ? v.value.data.data : []);
      setBookings(b.status==="fulfilled" ? b.value.data.data : []);
      setDrivers( d.status==="fulfilled" ? d.value.data.data : []);
      setUsers(   u.status==="fulfilled" ? u.value.data.data : []);
      if (v.status==="rejected"&&b.status==="rejected") setError("Could not reach backend. Make sure the server is running on port 5000.");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); }, [load]);

  const seedAdmin = async () => {
    setSeeding(true);
    try {
      const { data } = await authAPI.seedAdmin();
      showToast("Seed done! Check console for details");
      console.log("Seed result:", data);
      load();
    } catch(e) { showToast(e.response?.data?.message||"Seed failed","error"); }
    finally { setSeeding(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>⚙️</span>
          <div>
            <div style={{ fontWeight:800, fontSize:18, color:C.text, fontFamily:"'Inter',sans-serif" }}>EcoVan Admin Panel</div>
            <div style={{ fontSize:11, color:C.muted }}>Fleet, Drivers, Bookings & User Management</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={seedAdmin} disabled={seeding} title="Create default admin & driver accounts" style={{ ...btn("ghost"), padding:"7px 14px", fontSize:12 }}>{seeding?"Seeding…":"🌱 Seed Admin/Driver"}</button>
          <button onClick={load} style={{ ...btn("ghost"), padding:"7px 14px", fontSize:12 }}>🔄 Refresh</button>
          <button onClick={()=>navigate("home")} style={{ border:`1px solid ${C.border}`, background:"none", borderRadius:8, padding:"7px 16px", fontSize:13, cursor:"pointer", color:C.muted }}>← Back</button>
        </div>
      </div>

      {error && (
        <div style={{ background:"#fde8e8", color:"#b91c1c", padding:"12px 32px", fontSize:13, borderBottom:`1px solid #fca5a5` }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding:"24px 32px" }}>
        <div style={{ display:"flex", gap:4, marginBottom:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:4, width:"fit-content" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"8px 18px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:tab===t.id?700:500, background:tab===t.id?C.green:"none", color:tab===t.id?"#fff":C.muted, fontSize:13, transition:"all 0.15s" }}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:C.muted }}>Loading dashboard…</div>
        ) : (
          <>
            {tab==="overview" && <OverviewTab vans={vans} bookings={bookings} drivers={drivers} onRefresh={load} />}
            {tab==="vans"     && <VansTab     vans={vans} setVans={setVans} showToast={showToast} />}
            {tab==="drivers"  && <DriversTab  drivers={drivers} setDrivers={setDrivers} showToast={showToast} />}
            {tab==="bookings" && <BookingsTab bookings={bookings} setBookings={setBookings} showToast={showToast} />}
            {tab==="users"    && <UsersTab    users={users} setUsers={setUsers} showToast={showToast} />}
          </>
        )}
      </div>
    </div>
  );
}
