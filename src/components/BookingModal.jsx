export default function BookingModal({ van, seat, seatNumber, onClose, onConfirm, loading, booking }) {
  if (!van) return null;
  const seatNum = seat || seatNumber;
  const isLoading = loading || booking;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[200] px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 sm:p-8">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily:"'Syne',sans-serif" }}>Confirm Booking</h3>
          <p className="text-sm text-gray-500 mb-4">Review your ride details before confirming.</p>
          <div className="bg-[#f5f7f2] rounded-xl p-4 mb-4 text-sm space-y-2">
            {[
              ["Route",    van.route],
              ["Van",      van.vanNumber],
              ["Driver",   `${van.driverName || "Assigned"} ⭐${van.driverRating || 5}`],
              ["Departs",  van.departureTime || "—"],
              ["Seat No.", `#${seatNum}`],
              ["Fare",     null],
            ].map(([label, val]) => (
              <div key={label} className={`flex justify-between gap-3 ${label === "Fare" ? "border-t border-gray-200 pt-2 mt-2" : ""}`}>
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className={`font-semibold text-right break-words min-w-0 ${label === "Fare" ? "text-[#111]" : ""}`}>
                  {label === "Fare" ? `₹${van.fare || 49}` : val}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 rounded-lg p-3 mb-4 text-xs text-[#111] font-medium leading-relaxed">
            💡 Payment is processed securely. Demo mode = instant confirmation, no payment needed.
          </div>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pb-safe">
            <button onClick={onClose} disabled={isLoading}
              className="w-full xs:flex-1 py-3 sm:py-2.5 rounded-xl border border-gray-200 bg-[#f5f7f2] text-sm font-medium disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isLoading}
              className="w-full xs:flex-1 py-3 sm:py-2.5 rounded-xl bg-[#111] text-white text-sm font-medium hover:bg-[#FF5A3C] transition-colors disabled:opacity-60 text-center">
              {isLoading ? "Processing…" : `Confirm & Pay ₹${van.fare || 49}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
