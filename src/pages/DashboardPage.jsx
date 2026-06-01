import { useState, useEffect, useRef } from "react";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import CancelModal from "../components/CancelModal";
import {
   FaCheckCircle, FaTimesCircle, FaClock, FaRupeeSign,
  FaLeaf, FaMapMarkerAlt, FaSync, FaPlus, FaChevronRight,
  FaTachometerAlt, FaTrophy, FaExclamationCircle, FaBell,
  FaCalendarAlt, FaUsers, FaStickyNote, FaIdCard
} from "react-icons/fa";
import { MdEventSeat, MdRoute, MdSchedule, MdLocationOn } from "react-icons/md";
import { IoCarSportSharp } from "react-icons/io5";
const statusCls = {
  confirmed: "bg-orange-50 text-[#111]",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-500",
  pending:   "bg-yellow-100 text-yellow-600",
};
const statusIcon = {
  confirmed: <FaCheckCircle className="inline mr-1" />,
  completed: <FaTrophy className="inline mr-1" />,
  cancelled: <FaTimesCircle className="inline mr-1" />,
  pending:   <FaClock className="inline mr-1" />,
};
const statusLabel = { confirmed:"Confirmed", completed:"Completed", cancelled:"Cancelled", pending:"Pending" };

// Shows admin-assigned ride details for a van
function RideAssignmentCard({ vanNumber }) {
  const [assignment, setAssignment] = useState(undefined); // undefined = loading
  const isMounted = useRef(true);

  const fetch = async () => {
    if (!vanNumber) return;
    try {
      const { data } = await bookingAPI.getVanAssignment(vanNumber);
      if (isMounted.current) setAssignment(data.data);
    } catch { if (isMounted.current) setAssignment(null); }
  };

  useEffect(() => {
    isMounted.current = true;
    fetch();
    return () => { isMounted.current = false; };
  }, [vanNumber]);

  // Expose refetch so parent can trigger on socket event
  RideAssignmentCard._refetch = fetch;

  if (assignment === undefined) return (
    <div className="mt-2 h-5 bg-white/10 animate-pulse rounded" />
  );
  if (!assignment) return null;

  return (
    <div className="mt-3 bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <FaBell className="text-[#FF5A3C] text-xs" />
        <span className="text-xs font-bold text-[#FF5A3C] uppercase tracking-wide">
          Admin Updated Ride Details
        </span>
        {assignment.status === "pending" && (
          <span className="ml-auto text-[10px] bg-[#FF5A3C] text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-white/90">
        <div className="flex items-center gap-1.5">
          <FaIdCard className="text-[#FF5A3C] shrink-0" />
          <span className="font-semibold">{assignment.carNumber}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MdSchedule className="text-[#FF5A3C] shrink-0" />
          <span>{assignment.rideTime} · {assignment.rideDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MdLocationOn className="text-[#FF5A3C] shrink-0" />
          <span className="truncate">{assignment.pickupPoint}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaMapMarkerAlt className="text-[#FF5A3C] shrink-0" />
          <span className="truncate">{assignment.dropPoint}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <MdRoute className="text-[#FF5A3C] shrink-0" />
          <span>{assignment.route}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <FaUsers className="text-[#FF5A3C] shrink-0" />
          <span>Report {assignment.reportingMins || 15} min early · {assignment.passengerCount} passenger{assignment.passengerCount > 1 ? "s" : ""}</span>
        </div>
        {assignment.notes && (
          <div className="flex items-start gap-1.5 col-span-2 mt-0.5">
            <FaStickyNote className="text-[#FF5A3C] shrink-0 mt-0.5" />
            <span className="italic opacity-80">{assignment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage({ navigate, showToast }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const assignmentRefs = useRef({});

  useEffect(() => {
    if (user?.role === "driver") navigate("driver");
    if (user?.role === "admin")  navigate("adminpanel");
  }, [user]);

  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  // Track which vanNumbers need assignment refresh
  const [assignmentTick, setAssignmentTick] = useState(0);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await bookingAPI.getMyBookings();
      setBookings(data.data || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, [user]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("ecovan_token");
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }, transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("van:updated",          () => loadBookings());
    socket.on("van:list_updated",     () => loadBookings());
    socket.on("booking:seat_update",  () => loadBookings());

    // ── KEY FIX: listen for admin ride assignment, refresh assignment cards ──
    socket.on("ride:assigned", ({ assignment }) => {
      // Bump tick so RideAssignmentCard components re-fetch
      setAssignmentTick(t => t + 1);
      showToast(`🔔 Ride details updated by admin for car ${assignment?.carNumber || ""}`, "success");
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  const cancelBooking = async (id) => {
    setCancelling(id);
    try {
      await bookingAPI.cancel(id);
      setBookings(prev => prev.map(b => b._id === id
        ? { ...b, bookingStatus:"cancelled", paymentStatus:"refunded" } : b));
      showToast("Booking cancelled — seat freed");
    } catch (err) {
      showToast(err.response?.data?.message || "Cancel failed", "error");
    } finally { setCancelling(null); setCancelTarget(null); }
  };

  const activeBookings    = bookings.filter(b => ["confirmed","pending"].includes(b.bookingStatus));
  const completedBookings = bookings.filter(b => b.bookingStatus === "completed");
  const cancelledBookings = bookings.filter(b => b.bookingStatus === "cancelled");

  const stats = {
    total: bookings.length,
    spent: bookings.filter(b => b.bookingStatus !== "cancelled").reduce((a,b) => a + b.fare, 0),
    done:  completedBookings.length,
    co2:   (completedBookings.length * 0.75).toFixed(1),
  };

  const days = ["M","T","W","T","F","S","S"];
  const weekData = [0,0,0,0,0,0,0];
  bookings.slice(0,7).forEach((b,i) => { if (b.bookingStatus !== "cancelled") weekData[i] = 1; });

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <FaExclamationCircle className="text-5xl text-[#111]" />
      <h2 className="text-xl font-bold">Login to view your dashboard</h2>
      <button onClick={() => navigate("auth")} className="bg-[#111] text-white px-6 py-2.5 rounded-lg">Login / Register</button>
    </div>
  );

  return (
    <div>
      <div className="bg-[#111] text-white px-4 sm:px-8 py-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTachometerAlt className="text-[#FF5A3C]" /> My Dashboard
        </h2>
        <p className="text-sm text-gray-400 mt-1">Welcome back, {user.name} 👋</p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 mt-5 pb-12">

        {/* Active bookings */}
        {activeBookings.length > 0 && (
          <div className="bg-[#111] text-white rounded-2xl p-4 mb-5">
            <div className="text-xs opacity-70 mb-3 font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <IoCarSportSharp className="text-[#FF5A3C]" />
              Active Booking{activeBookings.length > 1 ? "s" : ""}
            </div>
            {activeBookings.map(b => (
              <div key={b._id} className="py-3 border-b border-white/10 last:border-0">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <IoCarSportSharp className="text-[#FF5A3C]" />
                      Car {b.vanId?.vanNumber}
                      <MdEventSeat className="ml-1 text-[#FF5A3C]" />
                      Seat #{b.seatNumber}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5 flex items-center gap-1.5">
                      <FaClock className="text-xs" />{b.vanId?.departureTime}
                      <FaMapMarkerAlt className="ml-1 text-xs" />{b.pickup} → {b.destination}
                    </div>
                    {/* ── Admin-assigned ride details, auto-refreshes on socket event ── */}
                    {b.vanId?.vanNumber && (
                      <RideAssignmentCard
                        key={`${b.vanId.vanNumber}-${assignmentTick}`}
                        vanNumber={b.vanId.vanNumber}
                      />
                    )}
                  </div>
                  <button onClick={() => navigate("tracking", { vanId: b.vanId?._id })}
                    className="ml-3 bg-[#FF5A3C] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0">
                    <FaMapMarkerAlt /> Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeBookings.length === 0 && !loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <div className="font-semibold text-[#111]">No active bookings</div>
              <div className="text-sm text-gray-500 mt-0.5">Book a car for your next commute</div>
            </div>
            <button onClick={() => navigate("booking")} className="bg-[#111] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
              Book Now <FaChevronRight />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { icon:<IoCarSportSharp />,         val:stats.total,       label:"Total Rides",  note:"All time" },
            { icon:<FaRupeeSign />,   val:`₹${stats.spent}`, label:"Total Spent",  note:"₹49 per ride" },
            { icon:<FaCheckCircle />, val:`${stats.done}`,   label:"Completed",    note:"Successful trips" },
            { icon:<FaLeaf />,        val:`${stats.co2}kg`,  label:"CO₂ Saved",    note:"vs cab" },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-200 rounded-xl px-4 py-4">
              <div className="text-[#FF5A3C] text-lg mb-1">{m.icon}</div>
              <div className="text-2xl font-extrabold text-[#111]">{m.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              <div className="text-xs text-[#FF5A3C] mt-1">{m.note}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          {/* All bookings list */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">All Bookings</p>
              <button onClick={loadBookings} className="text-xs text-[#111] hover:underline flex items-center gap-1">
                <FaSync className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            {loading ? (
              [...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-50 rounded-lg mb-2 animate-pulse" />)
            ) : bookings.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-6">
                No bookings yet.<br/>
                <button onClick={() => navigate("booking")} className="text-[#111] font-semibold mt-1">Book your first ride →</button>
              </div>
            ) : bookings.map((b, i) => (
              <div key={b._id} className={`flex items-center gap-3 py-2.5 ${i < bookings.length-1 ? "border-b border-gray-200" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  b.bookingStatus==="completed" ? "bg-gray-100" :
                  b.bookingStatus==="cancelled" ? "bg-red-50" : "bg-orange-50"
                }`}>
                  {b.bookingStatus==="completed" ? <FaTrophy className="text-gray-400" /> :
                   b.bookingStatus==="cancelled" ? <FaTimesCircle className="text-red-400" /> :
                   <IoCarSportSharp className="text-[#111]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {b.pickup?.slice(0,15)}… → {b.destination?.slice(0,15)}…
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <IoCarSportSharp className="text-xs" /> Car {b.vanId?.vanNumber}
                    <MdEventSeat /> #{b.seatNumber}
                    <FaRupeeSign className="text-xs" />{b.fare}
                  </div>
                  {b.vanId?.departureTime && (
                    <div className="text-xs text-gray-500 opacity-70 flex items-center gap-1">
                      <FaClock className="text-xs" />{b.vanId.departureTime}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusCls[b.bookingStatus]}`}>
                    {statusIcon[b.bookingStatus]}{statusLabel[b.bookingStatus] || b.bookingStatus}
                  </span>
                  {b.bookingStatus === "confirmed" && (
                    <button onClick={() => setCancelTarget(b)} disabled={cancelling===b._id}
                      className="text-[10px] text-red-500 hover:underline disabled:opacity-50">
                      {cancelling===b._id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {/* Weekly chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-3">Recent Activity</p>
              <div className="flex items-end gap-1.5 h-14">
                {weekData.map((h,i) => (
                  <div key={i} className={`flex-1 rounded-t border-b-2 transition-all ${h?"bg-[#111] border-[#333]":"bg-orange-50 border-[#FF5A3C]"}`}
                    style={{ height: h ? "100%" : "20%" }} />
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">{days.map((d,i)=><div key={i} className="flex-1 text-center text-[10px] text-gray-500">{d}</div>)}</div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-3">Summary</p>
              {[
                { label:"Active",    val:activeBookings.length,    color:"text-[#111]",    icon:<IoCarSportSharp /> },
                { label:"Completed", val:completedBookings.length,  color:"text-gray-500",  icon:<FaTrophy /> },
                { label:"Cancelled", val:cancelledBookings.length,  color:"text-red-500",   icon:<FaTimesCircle /> },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0] last:border-0">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">{s.icon}{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-3">Quick Actions</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate("booking")}
                  className="w-full bg-[#111] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#FF5A3C] transition-colors flex items-center justify-center gap-2">
                  <FaPlus /> Book New Ride
                </button>
                <button onClick={() => navigate("tracking")}
                  className="w-full border border-gray-200 bg-gray-50 py-2.5 rounded-lg text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                  <FaMapMarkerAlt /> Track Current Ride
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CancelModal
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelBooking(cancelTarget._id)}
        loading={cancelling === cancelTarget?._id}
      />
    </div>
  );
}
