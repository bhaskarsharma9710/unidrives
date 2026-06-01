import { useState, useEffect } from "react";
import API from "../services/api";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const inp  = "w-full px-3 py-2 border border-[#d4dcc8] rounded-lg text-sm bg-[#f5f7f2] outline-none focus:border-[#2db370] focus:bg-white transition-all";
const Stat = ({ val, label, icon }) => (
  <div className="bg-white border border-[#d4dcc8] rounded-xl px-5 py-4">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-extrabold text-[#1a7a4a]" style={{ fontFamily:"'Syne',sans-serif" }}>{val}</div>
    <div className="text-xs text-[#5a6352] mt-0.5">{label}</div>
  </div>
);

const statusCls = {
  confirmed:"bg-[#e6f5ed] text-[#1a7a4a]",
  completed:"bg-gray-100 text-gray-500",
  cancelled:"bg-red-100 text-red-500",
  pending:"bg-yellow-100 text-yellow-600",
  paid:"bg-blue-100 text-blue-600",
};

const EMPTY_VAN = { vanNumber:"", driverName:"", driverRating:"5.0", route:"Botanical Garden → Galgotias University", departureTime:"7:00 AM", fare:"49", totalSeats:"8" };

export default function AdminPage({ showToast }) {
  const [tab,      setTab]      = useState("vans");
  const [vans,     setVans]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [modal,    setModal]    = useState(null);   // null | "add" | "edit"
  const [form,     setForm]     = useState(EMPTY_VAN);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState("");

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchVans = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/vans");
      setVans(data.data);
    } catch {
      setVans([
        { _id:"v1", vanNumber:"GJ-1203", driverName:"Rajesh Singh", driverRating:4.9, route:"Botanical Garden → Galgotias University", totalSeats:8, availableSeats:5, departureTime:"7:00 AM", fare:49, status:"idle",     isActive:true },
        { _id:"v2", vanNumber:"GJ-4451", driverName:"Amar Verma",   driverRating:4.7, route:"Botanical Garden → Galgotias University", totalSeats:8, availableSeats:8, departureTime:"7:30 AM", fare:49, status:"en_route", isActive:true },
        { _id:"v3", vanNumber:"GJ-8872", driverName:"Priya Sharma",  driverRating:5.0, route:"Galgotias University → Botanical Garden", totalSeats:8, availableSeats:8, departureTime:"5:30 PM", fare:49, status:"idle",     isActive:true },
      ]);
    } finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/bookings");
      setBookings(data.data);
    } catch {
      setBookings([
        { _id:"b1", ticketId:"EV-ABC123", studentId:{ name:"Rahul Sharma", email:"rahul@galgotias.edu.in" }, vanId:{ vanNumber:"GJ-1203", route:"BG → GU" }, seatNumber:3, fare:49, bookingStatus:"confirmed", paymentStatus:"paid",    createdAt: new Date().toISOString() },
        { _id:"b2", ticketId:"EV-DEF456", studentId:{ name:"Priya Singh",  email:"priya@galgotias.edu.in"  }, vanId:{ vanNumber:"GJ-4451", route:"BG → GU" }, seatNumber:7, fare:49, bookingStatus:"completed", paymentStatus:"paid",    createdAt: new Date(Date.now()-86400000).toISOString() },
        { _id:"b3", ticketId:"EV-GHI789", studentId:{ name:"Amit Kumar",   email:"amit@galgotias.edu.in"   }, vanId:{ vanNumber:"GJ-8872", route:"GU → BG" }, seatNumber:2, fare:49, bookingStatus:"cancelled", paymentStatus:"refunded",createdAt: new Date(Date.now()-172800000).toISOString() },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVans(); fetchBookings(); }, []);

  // ── form helpers ──────────────────────────────────────────────────────────
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd  = ()     => { setForm(EMPTY_VAN); setEditId(null); setModal("add"); };
  const openEdit = (van)  => {
    setForm({ vanNumber: van.vanNumber, driverName: van.driverName, driverRating: String(van.driverRating),
              route: van.route, departureTime: van.departureTime, fare: String(van.fare), totalSeats: String(van.totalSeats) });
    setEditId(van._id);
    setModal("edit");
  };

  const saveVan = async () => {
    if (!form.vanNumber || !form.driverName || !form.route) return showToast("Fill all required fields", "error");
    setSaving(true);
    const payload = { ...form, driverRating: parseFloat(form.driverRating), fare: parseInt(form.fare), totalSeats: parseInt(form.totalSeats) };
    try {
      if (modal === "add") {
        const { data } = await API.post("/vans", { ...payload, availableSeats: payload.totalSeats });
        setVans(p => [data.data, ...p]);
        showToast("✅ Van added successfully!");
      } else {
        const { data } = await API.put(`/vans/${editId}`, payload);
        setVans(p => p.map(v => v._id === editId ? data.data : v));
        showToast("✅ Van updated!");
      }
      setModal(null);
    } catch (err) {
      // demo mode — update local state
      if (modal === "add") {
        const fake = { _id: "v"+Date.now(), ...payload, availableSeats: payload.totalSeats, bookedSeats:[], status:"idle", isActive:true };
        setVans(p => [fake, ...p]);
        showToast("✅ Van added! (Demo mode)");
      } else {
        setVans(p => p.map(v => v._id === editId ? { ...v, ...payload } : v));
        showToast("✅ Van updated! (Demo mode)");
      }
      setModal(null);
    } finally { setSaving(false); }
  };

  const toggleActive = async (van) => {
    try {
      await API.put(`/vans/${van._id}`, { isActive: !van.isActive });
    } catch {}
    setVans(p => p.map(v => v._id === van._id ? { ...v, isActive: !v.isActive } : v));
    showToast(van.isActive ? "Van deactivated" : "Van activated ✅");
  };

  const deleteVan = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/vans/${id}`);
    } catch {}
    setVans(p => p.filter(v => v._id !== id));
    showToast("Van removed");
    setDeleting(null);
  };

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalRevenue = bookings.filter(b => b.paymentStatus==="paid").reduce((a,b) => a + b.fare, 0);
  const activeVans   = vans.filter(v => v.status === "en_route").length;
  const filteredVans = vans.filter(v =>
    v.vanNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.driverName.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
    (b.studentId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.ticketId || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { idle:"bg-gray-100 text-gray-500", active:"bg-blue-100 text-blue-600", en_route:"bg-[#e6f5ed] text-[#1a7a4a]", completed:"bg-purple-100 text-purple-600" };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-[#d4dcc8] px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>Admin Dashboard</h2>
          <p className="text-sm text-[#5a6352] mt-1">Manage vans, rides, drivers and bookings</p>
        </div>
        <button onClick={openAdd}
          className="bg-[#1a7a4a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2db370] transition-colors flex items-center gap-2">
          + Add New Van
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-5 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat icon="🚐" val={vans.length}      label="Total Vans" />
          <Stat icon="🟢" val={activeVans}        label="Active / En Route" />
          <Stat icon="🎫" val={bookings.length}   label="Total Bookings" />
          <Stat icon="₹"  val={`${totalRevenue}`} label="Revenue Collected" />
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex gap-1 bg-[#f5f7f2] rounded-xl p-1">
            {["vans","bookings"].map(t => (
              <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?"bg-white text-[#1a1f16] shadow-sm":"text-[#5a6352]"}`}>
                {t === "vans" ? `🚐 Vans (${vans.length})` : `🎫 Bookings (${bookings.length})`}
              </button>
            ))}
          </div>
          <input placeholder={tab==="vans"?"Search van or driver…":"Search student or ticket…"}
            value={search} onChange={e => setSearch(e.target.value)}
            className={inp + " max-w-xs"} />
        </div>

        {/* ── VANS TAB ── */}
        {tab === "vans" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              [...Array(3)].map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#d4dcc8]" />)
            ) : filteredVans.length === 0 ? (
              <div className="text-center py-16 text-[#5a6352]">
                <div className="text-4xl mb-3">🚐</div>
                No vans found.<br/>
                <button onClick={openAdd} className="text-[#1a7a4a] font-semibold mt-2">Add your first van →</button>
              </div>
            ) : filteredVans.map(van => (
              <div key={van._id} className={`bg-white border rounded-2xl p-5 transition-all ${!van.isActive?"opacity-60 border-dashed border-[#d4dcc8]":"border-[#d4dcc8] hover:shadow-md"}`}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-[#e6f5ed] rounded-xl flex items-center justify-center text-3xl shrink-0">🚐</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base">Van {van.vanNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[van.status]||"bg-gray-100 text-gray-500"}`}>{van.status}</span>
                      {!van.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">Inactive</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5a6352]">
                      <span>👤 {van.driverName} ⭐{van.driverRating}</span>
                      <span>🛣 {van.route}</span>
                      <span>🕐 {van.departureTime}</span>
                      <span>💺 {van.availableSeats}/{van.totalSeats} free</span>
                      <span>💰 ₹{van.fare}/seat</span>
                    </div>
                    {/* Seat visual */}
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: van.totalSeats }, (_,i) => i+1).map(s => {
                        const taken = (van.bookedSeats||[]).includes(s);
                        return <div key={s} className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-medium ${taken?"bg-[#1a7a4a] text-white":"bg-[#e6f5ed] text-[#1a7a4a] border border-[#2db370]"}`}>{s}</div>;
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openEdit(van)}
                      className="px-4 py-1.5 bg-[#e6f5ed] text-[#1a7a4a] text-xs font-semibold rounded-lg hover:bg-[#2db370] hover:text-white transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => toggleActive(van)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${van.isActive?"bg-yellow-50 text-yellow-700 hover:bg-yellow-100":"bg-[#e6f5ed] text-[#1a7a4a] hover:bg-[#2db370] hover:text-white"}`}>
                      {van.isActive ? "⏸ Deactivate" : "▶ Activate"}
                    </button>
                    <button onClick={() => deleteVan(van._id)} disabled={deleting===van._id}
                      className="px-4 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                      {deleting===van._id ? "…" : "🗑 Remove"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <div className="bg-white border border-[#d4dcc8] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f7f2] border-b border-[#d4dcc8]">
                  {["Ticket","Student","Van / Seat","Route","Fare","Payment","Status","Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[#5a6352] font-semibold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_,i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-[#f5f7f2] rounded animate-pulse" /></td></tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#5a6352]">No bookings found</td></tr>
                ) : filteredBookings.map(b => (
                  <tr key={b._id} className="border-b border-[#d4dcc8] hover:bg-[#f5f7f2] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1a7a4a] font-bold">{b.ticketId||"—"}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.studentId?.name||"—"}</div>
                      <div className="text-xs text-[#5a6352]">{b.studentId?.email||""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.vanId?.vanNumber||"—"}</div>
                      <div className="text-xs text-[#5a6352]">Seat #{b.seatNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5a6352] max-w-[160px] truncate">{b.vanId?.route||"—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#1a7a4a]">₹{b.fare}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusCls[b.paymentStatus]||"bg-gray-100 text-gray-500"}`}>
                        {b.paymentStatus||"—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusCls[b.bookingStatus]||"bg-gray-100 text-gray-500"}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5a6352]">
                      {new Date(b.createdAt).toLocaleDateString("en-IN",{ day:"2-digit", month:"short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-5" style={{ fontFamily:"'Syne',sans-serif" }}>
              {modal === "add" ? "🚐 Add New Van" : "✏️ Edit Van"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Van Number *</label>
                <input placeholder="e.g. GJ-1203" className={inp} value={form.vanNumber} onChange={upd("vanNumber")} />
              </div>
              <div>
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Driver Name *</label>
                <input placeholder="e.g. Rajesh Singh" className={inp} value={form.driverName} onChange={upd("driverName")} />
              </div>
              <div>
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Driver Rating</label>
                <input type="number" min="1" max="5" step="0.1" placeholder="4.9" className={inp} value={form.driverRating} onChange={upd("driverRating")} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Route *</label>
                <select className={inp} value={form.route} onChange={upd("route")}>
                  <option>Botanical Garden → Galgotias University</option>
                  <option>Galgotias University → Botanical Garden</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Departure Time *</label>
                <select className={inp} value={form.departureTime} onChange={upd("departureTime")}>
                  {["6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Fare (₹)</label>
                <input type="number" placeholder="49" className={inp} value={form.fare} onChange={upd("fare")} />
              </div>
              <div>
                <label className="text-xs text-[#5a6352] font-medium mb-1 block">Total Seats</label>
                <select className={inp} value={form.totalSeats} onChange={upd("totalSeats")}>
                  {[6,7,8,9,10].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 bg-[#f5f7f2] rounded-xl p-3 text-xs text-[#5a6352] flex gap-4 flex-wrap">
              <span>🚐 {form.vanNumber||"—"}</span>
              <span>👤 {form.driverName||"—"}</span>
              <span>🕐 {form.departureTime}</span>
              <span>💺 {form.totalSeats} seats</span>
              <span>💰 ₹{form.fare}/seat</span>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-[#d4dcc8] rounded-xl text-sm font-medium hover:bg-[#f5f7f2] transition-colors">
                Cancel
              </button>
              <button onClick={saveVan} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a7a4a] text-white rounded-xl text-sm font-semibold hover:bg-[#2db370] transition-colors disabled:opacity-60">
                {saving ? "Saving…" : modal==="add" ? "Add Van" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
