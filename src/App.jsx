import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import Toast         from "./components/Toast";
import HomePage      from "./pages/HomePage";
import BookingPage   from "./pages/BookingPage";
import TrackingPage  from "./pages/TrackingPage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage      from "./pages/AuthPage";
import AdminPage     from "./pages/AdminPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import DriverPage    from "./pages/DriverPage";
import { FaTimes, FaChevronLeft, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdxWEftMD3T0ZYKzrCcOYJcuzBcAHDFKlfnNV13deXdzG7xAA/viewform?usp=dialog";

/* ── Global Coming Soon Modal (triggered from Navbar) ── */
function GlobalComingSoonModal({ trigger, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #111 0%, #1c1c1c 60%, #2a1708 100%)",
          border: "1px solid rgba(255,90,60,0.25)",
          boxShadow: "0 0 80px rgba(255,90,60,0.15), 0 40px 80px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #FF5A3C 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-30px] left-[-30px] w-24 h-24 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #FF5A3C 0%, transparent 70%)" }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <FaTimes className="text-sm" />
        </button>

        <div className="px-8 py-10 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: "linear-gradient(135deg, rgba(255,90,60,0.2) 0%, rgba(255,90,60,0.05) 100%)", border: "1px solid rgba(255,90,60,0.3)" }}>
            <IoCarSportSharp className="text-3xl text-[#FF5A3C]" />
          </div>

          <div className="inline-flex items-center gap-2 bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#FF5A3C] animate-pulse" />
            <span className="text-[#FF5A3C] text-xs font-bold uppercase tracking-widest">Coming Soon</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-3 leading-tight">
            {trigger === "booking" ? "Seat Booking" : "Live Tracking"}
            <br />
            <span className="text-[#FF5A3C]">Launching Soon!</span>
          </h2>

          <p className="text-white/50 text-sm leading-relaxed mb-2 max-w-xs mx-auto">
            {trigger === "booking"
              ? "Our smart seat booking system is currently under development. In the meantime, fill out our Google Form to reserve your seat!"
              : "Real-time GPS tracking is currently under development. Stay tuned \u2014 it's almost ready!"}
          </p>

          <p className="text-white/30 text-xs mb-7 max-w-xs mx-auto">
            {trigger === "booking"
              ? "We'll confirm your booking via WhatsApp/email once you submit the form."
              : "You'll be able to follow your ride live from pick-up to drop-off."}
          </p>

          <div className="space-y-3">
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-[#FF5A3C] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#ff6b4d] active:scale-95 transition-all"
              style={{ boxShadow: "0 8px 24px rgba(255,90,60,0.35)" }}
            >
              <FaShieldAlt className="text-xs" /> Fill the Google Form <FaArrowRight className="text-xs" />
            </a>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 hover:text-white active:scale-95 transition-all"
            >
              <FaChevronLeft className="text-xs" /> Go Back
            </button>
          </div>

          <p className="text-white/20 text-xs mt-5">Feature under active development \u2014 launching soon!</p>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [activePage,    setActivePage]    = useState("home");
  const [toast,         setToast]         = useState(null);
  const [trackingVanId, setTrackingVanId] = useState(null);
  const [globalModal,   setGlobalModal]   = useState(null); // null | "booking" | "tracking"

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navigate = (page, extra) => {
    if (page === "tracking" && extra?.vanId) setTrackingVanId(extra.vanId);
    setActivePage(page);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const pages = { home: HomePage, booking: BookingPage, tracking: TrackingPage,
    dashboard: DashboardPage, auth: AuthPage, admin: AdminPage,
    adminpanel: AdminPanelPage, driver: DriverPage };
  const Page = pages[activePage] || HomePage;
  const hideFooter = ["driver","adminpanel","admin"].includes(activePage);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans">
        {/* Global Coming Soon Modal (triggered from Navbar) */}
        {globalModal && (
          <GlobalComingSoonModal
            trigger={globalModal}
            onClose={() => setGlobalModal(null)}
          />
        )}
        <Navbar
          activePage={activePage}
          navigate={navigate}
          onComingSoon={(type) => setGlobalModal(type)}
        />
        <main className="flex-1">
          <Page navigate={navigate} showToast={showToast} trackingVanId={trackingVanId} />
        </main>
        {!hideFooter && <Footer navigate={navigate} />}
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </AuthProvider>
  );
}
