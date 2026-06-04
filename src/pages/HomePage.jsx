import { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaShieldAlt, FaLeaf, FaBolt, FaMapMarkerAlt, FaStar, FaExclamationTriangle, FaTimes, FaChevronLeft } from "react-icons/fa";
import { MdEventSeat, MdPayment, MdSecurity } from "react-icons/md";
import { IoCarSportSharp } from "react-icons/io5";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdxWEftMD3T0ZYKzrCcOYJcuzBcAHDFKlfnNV13deXdzG7xAA/viewform?usp=dialog";

const features = [
  { Icon: MdEventSeat,    title:"Limited Seating",  desc:"Only 8 students per car. No overcrowding, guaranteed comfort on every ride." },
  { Icon: FaMapMarkerAlt, title:"Live Tracking",    desc:"Real-time GPS so you always know exactly where your car is." },
  { Icon: MdPayment,      title:"Affordable",       desc:"Share rides, split costs. Starting at just ₹90 per trip." },
  { Icon: FaShieldAlt,    title:"Safe Rides",       desc:"Verified drivers, SOS button, and full ride history for your safety." },
  { Icon: FaBolt,         title:"Instant Booking",  desc:"Book a seat in seconds. Get your confirmation instantly on your phone." },
  { Icon: FaLeaf,         title:"Eco-Friendly",     desc:"Shared rides mean fewer vehicles, lower emissions, greener campus." },
];

const testimonials = [
  { name:"Priya S.", role:"B.Tech, CSE", text:"Unidrives saved me so much time and money. The live tracking is incredibly reassuring for my parents too.", rating:5 },
  { name:"Arjun K.", role:"MBA Student", text:"Super easy to book, always on time. Best commute solution around campus by far.", rating:5 },
  { name:"Sneha R.", role:"B.Tech, ECE", text:"Love that I always get a guaranteed seat. Never been stranded since I started using Unidrives.", rating:5 },
];

const accidentNews = [
  {
    img: "/accident1.png",
    source: "Times of India · May 2019",
    headline: "10 Students Injured as Overloaded Van Overturns on Yamuna Expressway",
    tag: "Overcrowding Risk",
    tagColor: "#dc2626",
  },
  {
    img: "/accident2.png",
    source: "ABP Live · Jun 2025",
    headline: "Van With Galgotias University Students Crashes on Yamuna Expressway — 5 Injured",
    tag: "Vehicle Failure",
    tagColor: "#ea580c",
  },
];

/* ── Coming Soon Modal ── */
function ComingSoonModal({ trigger, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
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
              : "Real-time GPS tracking is currently under development. Stay tuned — it's almost ready!"}
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
              className="w-full flex items-center justify-center gap-2.5 bg-[#FF5A3C] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#ff6b4d] active:scale-95 transition-all shadow-lg shadow-orange-900/30"
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

          <p className="text-white/20 text-xs mt-5">Feature under active development — launching soon!</p>
        </div>
      </div>
    </div>
  );
}

/* ── Safety Awareness Section ── */
function SafetySection({ onBookNow }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #1a0a05 50%, #0d0d0d 100%)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #FF5A3C 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)" }}
        >
          <div className="inline-flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 rounded-full px-5 py-2 mb-5">
            <FaExclamationTriangle className="text-red-400 text-xs animate-pulse" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Road Safety Alert</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Overcrowded Vans Kill.<br />
            <span className="text-[#FF5A3C]">Choose Safe Travel.</span>
          </h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            These aren't statistics — they're real accidents on the same roads you travel every day.
            Unidrives limits every car to just 8 passengers so you're never a number, always a priority.
          </p>
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {accidentNews.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden cursor-default transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(36px)",
                transitionDelay: `${i * 150 + 200}ms`,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Hover glow border */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,90,60,0.4), 0 0 30px rgba(255,90,60,0.05)" }} />

              {/* Image */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={item.img}
                  alt={item.headline}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: "brightness(0.75) saturate(0.85)" }}
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />

                {/* Tag badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: item.tagColor, boxShadow: `0 2px 12px ${item.tagColor}60` }}>
                    <FaExclamationTriangle className="text-[9px]" />
                    {item.tag}
                  </span>
                </div>

                {/* Source */}
                <div className="absolute bottom-3 right-3">
                  <span className="text-white/50 text-[10px] font-medium bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                    {item.source}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-white/85 text-sm font-semibold leading-snug group-hover:text-white transition-colors">
                  {item.headline}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#FF5A3C]" />
                  <p className="text-white/35 text-xs">Yamuna Expressway · Greater Noida</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-3 gap-4 mb-10 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "500ms",
          }}
        >
          {[
            { val: "47%", label: "of road fatalities involve overloaded vehicles", icon: "⚠️" },
            { val: "8",   label: "max passengers per Unidrives car — always", icon: "🛡️" },
            { val: "0",   label: "accidents since Unidrives launched", icon: "✅" },
          ].map(({ val, label, icon }, i) => (
            <div key={i} className="text-center rounded-2xl px-4 py-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-2xl font-black text-[#FF5A3C] leading-none mb-1">{val}</div>
              <div className="text-white/35 text-[10px] leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "650ms",
          }}
        >
          <p className="text-white/40 text-xs mb-5 uppercase tracking-wider font-semibold">
            Don't risk it — ride safe with Unidrives
          </p>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#FF5A3C] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-[#ff6b4d] active:scale-95 transition-all"
            style={{ boxShadow: "0 8px 32px rgba(255,90,60,0.35)" }}
          >
            <FaShieldAlt /> Book a Safe Ride Now <FaArrowRight className="text-xs" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Main Export ── */
export default function HomePage({ navigate }) {
  const [modal, setModal] = useState(null); // null | "booking" | "tracking"

  const openBooking  = () => setModal("booking");
  const openTracking = () => setModal("tracking");
  const closeModal   = () => setModal(null);

  return (
    <div>
      {/* Coming Soon Modal */}
      {modal && <ComingSoonModal trigger={modal} onClose={closeModal} />}

      {/* Coming Soon Banner */}
      <div className="bg-[#FF5A3C] text-white text-center py-2.5 px-4 text-sm font-semibold tracking-wide">
        🚀 Coming Soon — We're launching soon! Register your interest below.
      </div>

      {/* Hero */}
      <section className="bg-[#111] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"32px 32px" }} />
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-[#FF5A3C]/15 text-[#FF5A3C] border border-[#FF5A3C]/25 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              <FaLeaf /> Student Transport · Greater Noida
            </span>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.04] tracking-tight mb-5">
              Your Campus.<br />
              <span className="text-[#FF5A3C]">Your Ride.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              Affordable, safe, organized car transport between Botanical Garden Metro and Galgotias University. Book your seat in seconds.
            </p>
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <button
                onClick={openBooking}
                className="flex items-center gap-2 bg-[#FF5A3C] text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-[#e84a2e] active:scale-95 transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-[#FF5A3C]/30">
                Book a Seat <FaArrowRight />
              </button>
              <button
                onClick={openTracking}
                className="flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 active:scale-95 transition-all text-sm">
                <FaMapMarkerAlt /> Live Track
              </button>
            </div>
          </div>

          {/* Car image + Stats */}
          <div className="flex-shrink-0 w-full md:w-[440px] flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <img
                src="/unidrives.png"
                alt="Unidrives Car"
                className="w-full object-contain"
                style={{ maxHeight: "420px", minHeight: "220px", mixBlendMode: "screen" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val:"8",    label:"Seats / Car",  Icon: MdEventSeat },
                { val:"₹90", label:"Per Ride",      Icon: MdPayment },
              ].map(({ val, label, Icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5A3C]/15 flex items-center justify-center shrink-0">
                    <Icon className="text-[#FF5A3C] text-xs" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-tight">{val}</div>
                    <div className="text-gray-500 text-[10px]">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#111] tracking-tight">Why Choose Unidrives<span className="text-[#FF5A3C]">.</span></h2>
          <p className="text-gray-500 mt-3 text-sm max-w-lg mx-auto">Built specifically for university students who need reliable, affordable daily transport.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#FF5A3C]/40 hover:shadow-md transition-all group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-[#FF5A3C]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF5A3C] transition-colors">
                <Icon className="text-[#FF5A3C] text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-[#111] mb-1.5">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAFETY AWARENESS SECTION ── */}
      <SafetySection onBookNow={openBooking} />

      {/* How it works */}
      <section className="bg-[#111] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight">How it Works</h2>
            <p className="text-gray-400 mt-2 text-sm">Three simple steps to your next ride</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step:"01", title:"Create Account", desc:"Register with your university email and get started in under a minute." },
              { step:"02", title:"Book Your Seat", desc:"Browse available cars, pick a seat number, and pay just ₹90." },
              { step:"03", title:"Ride & Track",   desc:"Get notified when your car departs. Track it live until you arrive." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-[#FF5A3C] text-5xl font-black opacity-30 mb-3">{step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#111] tracking-tight">What Students Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, rating }) => (
            <div key={name} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {[...Array(rating)].map((_,i) => <FaStar key={i} className="text-[#FF5A3C] text-sm" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
              <div>
                <div className="font-bold text-[#111] text-sm">{name}</div>
                <div className="text-gray-400 text-xs">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 px-4" style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #2a1a10 100%)" }}>
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-10" style={{ background:"#FF5A3C" }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full opacity-10" style={{ background:"#FF5A3C" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2" style={{ background:"#FF5A3C" }} />

        <div className="relative max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#FF5A3C] animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Coming Soon</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            Ready to Ride<br />
            <span className="text-[#FF5A3C]">Smarter?</span>
          </h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
            We're launching soon. Register your interest now and be the first to know when we go live!
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:items-center">
            <a href={FORM_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#FF5A3C] text-white px-8 py-4 rounded-2xl font-bold active:scale-95 transition-all text-sm shadow-lg shadow-orange-900/30 hover:bg-[#ff6b4d]">
              <IoCarSportSharp className="text-base" /> Get Started
            </a>
            <a href={FORM_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 active:scale-95 transition-all text-sm backdrop-blur-sm">
              Register Interest →
            </a>
          </div>

          <p className="text-white/30 text-xs mt-5">No credit card required · Free forever for students</p>
        </div>
      </section>
    </div>
  );
}
