import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Logo = () => (
  <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:20, color:"#fff", letterSpacing:"-0.5px" }}>
    Unidrives<span style={{ color:"#FF5A3C", fontSize:26, lineHeight:1 }}>.</span>
  </span>
);

const socialLinks = [
  { Icon: FaInstagram, href: "https://www.instagram.com/heyunidrives?igsh=dXU1MXBydHoxMjJn", label: "Instagram" },
  { Icon: FaFacebook,  href: "https://www.facebook.com/unidrives",                            label: "Facebook" },
  { Icon: FaLinkedin,  href: "#",                                                              label: "LinkedIn" },
];

export default function Footer({ navigate }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#111] text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <Logo />
          <p className="mt-4 text-gray-400 text-sm leading-relaxed">
            Smart, safe, and affordable car transport for university students. Connecting campuses, one ride at a time.
          </p>
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF5A3C] flex items-center justify-center transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label:"Book a Ride",      page:"booking" },
              { label:"Live Tracking",    page:"tracking" },
              { label:"My Dashboard",     page:"dashboard" },
              { label:"Login / Register", page:"auth" },
            ].map(({ label, page }) => (
              <li key={page}>
                <button onClick={() => navigate(page)} className="text-gray-400 hover:text-[#FF5A3C] text-sm transition-colors">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-[#FF5A3C] shrink-0" />Greater Noida, Uttar Pradesh</li>
            <li className="flex items-center gap-2"><FaPhone className="text-[#FF5A3C] shrink-0" />+91 6396099606</li>
            <li className="flex items-center gap-2"><FaEnvelope className="text-[#FF5A3C] shrink-0" />support@unidrives.in</li>
          </ul>
         
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">© {year} Unidrives. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
