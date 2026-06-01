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

export default function App() {
  const [activePage,    setActivePage]    = useState("home");
  const [toast,         setToast]         = useState(null);
  const [trackingVanId, setTrackingVanId] = useState(null);

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
        <Navbar activePage={activePage} navigate={navigate} />
        <main className="flex-1">
          <Page navigate={navigate} showToast={showToast} trackingVanId={trackingVanId} />
        </main>
        {!hideFooter && <Footer navigate={navigate} />}
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </AuthProvider>
  );
}
