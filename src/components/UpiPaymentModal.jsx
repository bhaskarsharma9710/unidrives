import { useState, useEffect, useRef } from "react";

/**
 * UpiPaymentModal
 *
 * Props:
 *   booking  – { bookingId, ticketId, fare, upiId, upiName, upiLink }
 *   onSuccess(confirmedBooking) – called after backend confirms
 *   onCancel()                  – called if user closes before paying
 *   apiBase  – your backend base URL, e.g. "http://192.168.1.9:5000"
 *   token    – JWT token from localStorage / auth context
 */
export default function UpiPaymentModal({ booking, onSuccess, onCancel, apiBase, token }) {
  // "waiting" → user is in UPI app  |  "returned" → user came back, one-tap confirm
  const [stage, setStage]       = useState("waiting");
  const [utrInput, setUtrInput] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const visibilityRef           = useRef(false);

  // Detect when the user comes BACK to this tab/app (UPI app closes → our page regains focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && visibilityRef.current) {
        setStage("returned");
      }
    };
    const handleFocus = () => {
      if (visibilityRef.current) setStage("returned");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Open the UPI deep-link
  function openUpiApp() {
    visibilityRef.current = true;
    window.location.href = booking.upiLink;
    // Fallback: if deep-link fails on desktop, user can still tap "I've Paid"
    setTimeout(() => setStage("returned"), 3000);
  }

  // Auto-open on mount
  useEffect(() => {
    const t = setTimeout(openUpiApp, 400); // slight delay so modal renders first
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/bookings/confirm-payment`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ bookingId: booking.bookingId, utrNumber: utrInput }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Confirmation failed");
      onSuccess(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#111] px-6 pt-6 pb-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF5A3C]/15 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-[#FF5A3C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <h2 className="text-white font-black text-lg">Pay ₹{booking.fare}</h2>
          <p className="text-gray-400 text-xs mt-1">Ticket {booking.ticketId}</p>
        </div>

        <div className="px-6 py-5 space-y-4">

          {stage === "waiting" && (
            <>
              {/* UPI destination */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF5A3C]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#FF5A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Pay to</p>
                  <p className="text-sm font-bold text-[#111]">{booking.upiName}</p>
                  <p className="text-xs text-gray-500">{booking.upiId}</p>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 leading-relaxed">
                Opening your UPI app…<br/>
                Pay <span className="font-bold text-[#111]">₹{booking.fare}</span> and come back here.
              </p>

              <button
                onClick={openUpiApp}
                className="w-full bg-[#FF5A3C] text-white py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-orange-200"
              >
                Open UPI App
              </button>

              <button
                onClick={() => setStage("returned")}
                className="w-full text-gray-400 text-xs py-1 underline"
              >
                Already paid? Tap here
              </button>
            </>
          )}

          {stage === "returned" && (
            <>
              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-green-700 font-semibold text-sm">Welcome back!</p>
                <p className="text-green-600 text-xs mt-0.5">Tap the button below to confirm your booking instantly.</p>
              </div>

              {/* Optional UTR input */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  UTR / Transaction ID <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 427311234567"
                  value={utrInput}
                  onChange={e => setUtrInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A3C] focus:ring-1 focus:ring-[#FF5A3C]/30 transition"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Found in your UPI app under transaction history. Helps resolve any disputes.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-[#FF5A3C] text-white py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-orange-200 disabled:opacity-60"
              >
                {loading ? "Confirming…" : "✓  I've Paid — Confirm Booking"}
              </button>

              <button
                onClick={() => { setStage("waiting"); setError(""); }}
                className="w-full text-gray-400 text-xs py-1 underline"
              >
                Go back to payment
              </button>
            </>
          )}

          {/* Cancel link */}
          <button
            onClick={onCancel}
            className="w-full text-gray-400 text-xs pt-1 hover:text-gray-600 transition"
          >
            Cancel booking
          </button>
        </div>
      </div>
    </div>
  );
}
