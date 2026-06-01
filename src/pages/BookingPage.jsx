import { FaArrowRight } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdxWEftMD3T0ZYKzrCcOYJcuzBcAHDFKlfnNV13deXdzG7xAA/viewform?usp=dialog";

export default function BookingPage({ navigate }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="inline-flex items-center gap-2 bg-[#FF5A3C]/10 text-[#FF5A3C] border border-[#FF5A3C]/25 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
        <span className="w-2 h-2 rounded-full bg-[#FF5A3C] animate-pulse" /> Coming Soon
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight mb-4">
        Booking is<br /><span className="text-[#FF5A3C]">Almost Here</span>
      </h1>
      <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
        We're putting the finishing touches on our booking system. Register your interest now and we'll notify you the moment we launch!
      </p>
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#FF5A3C] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:bg-[#e84a2e] active:scale-95 transition-all hover:-translate-y-0.5"
      >
        <IoCarSportSharp /> Register Interest <FaArrowRight />
      </a>
      <p className="text-gray-400 text-xs mt-5">Takes less than 1 minute · No commitment required</p>
    </div>
  );
}
