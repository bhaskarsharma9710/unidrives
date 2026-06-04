import { useAuth } from "../context/AuthContext";
import { FaBus, FaMapMarkerAlt, FaTachometerAlt, FaHome, FaCog, FaSignOutAlt, FaSignInAlt, FaBars, FaTimes } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";
import { useState } from "react";

const Logo = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center select-none">
    <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:22, color:"#111", letterSpacing:"-0.5px" }}>
      Unidrives<span style={{ color:"#FF5A3C", fontSize:28, lineHeight:1 }}>.</span>
    </span>
  </button>
);

export default function Navbar({ activePage, navigate, onComingSoon }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const studentLinks = [
    { key:"home",      label:"Home",       icon:<FaHome /> },
    { key:"booking",   label:"Book Ride",  icon:<IoCarSportSharp />, comingSoon:"booking" },
    { key:"tracking",  label:"Live Track", icon:<FaMapMarkerAlt />,  comingSoon:"tracking" },
    { key:"dashboard", label:"Dashboard",  icon:<FaTachometerAlt /> },
  ];
  const driverLinks = [
    { key:"home",   label:"Home",     icon:<FaHome /> },
    { key:"driver", label:"My Panel", icon:<FaBus /> },
  ];
  const adminLinks = [
    { key:"home",       label:"Home",       icon:<FaHome /> },
    { key:"adminpanel", label:"Admin Panel", icon:<FaCog /> },
    { key:"tracking",   label:"Live Track",  icon:<FaMapMarkerAlt />, comingSoon:"tracking" },
  ];
  const links = user?.role==="driver" ? driverLinks : user?.role==="admin" ? adminLinks : studentLinks;

  const go = (link) => {
    if (link.comingSoon) {
      if (onComingSoon) onComingSoon(link.comingSoon);
      setOpen(false);
      return;
    }
    navigate(link.key);
    setOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo onClick={() => navigate("home")} />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button key={l.key} onClick={() => go(l)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePage===l.key
                  ? "bg-[#111] text-white"
                  : "text-gray-500 hover:text-[#111] hover:bg-gray-100"
              }`}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                {user.name?.split(" ")[0]}
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              </span>
              <button onClick={() => { logout(); navigate("home"); }}
                className="flex items-center gap-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-medium">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("auth")}
              className="flex items-center gap-1.5 bg-[#FF5A3C] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#e84a2e] active:scale-95 transition-all shadow-sm shadow-[#FF5A3C]/30">
              <FaSignInAlt /> Login
            </button>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          {open ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-lg">
          {links.map(l => (
            <button key={l.key} onClick={() => go(l)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activePage===l.key ? "bg-[#111] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {l.icon} {l.label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2">
            {user ? (
              <button onClick={() => { logout(); navigate("home"); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <FaSignOutAlt /> Logout ({user.name?.split(" ")[0]})
              </button>
            ) : (
              <button onClick={() => navigate("auth")}
                className="w-full flex items-center justify-center gap-2 bg-[#FF5A3C] text-white px-4 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all">
                <FaSignInAlt /> Login / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
