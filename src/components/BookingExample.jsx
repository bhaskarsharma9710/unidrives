/**
 * USAGE EXAMPLE — drop UpiPaymentModal into your existing booking page.
 *
 * This is not a full page — just shows how to wire the flow into
 * whatever component currently handles booking (e.g. BookingPage.jsx).
 */
import { useState } from "react";
import UpiPaymentModal from "./UpiPaymentModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.1.9:5000";

export default function BookingExample() {
  const token = localStorage.getItem("token"); // or from your auth context

  // Set by your existing "Book Seat" button handler
  const [upiData, setUpiData]           = useState(null);  // holds response from /create-order
  const [confirmedBooking, setConfirmed] = useState(null);
  const [bookingError, setBookingError]  = useState("");

  // ── Step 1: called when user taps "Book Seat" ──────────────────────────────
  async function handleBookSeat({ vanId, seatNumber, pickup, destination, departureTime }) {
    setBookingError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/create-order`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vanId, seatNumber, pickup, destination, departureTime }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setUpiData(data); // ← opens the modal
    } catch (err) {
      setBookingError(err.message);
    }
  }

  // ── Step 2: called by modal after /confirm-payment succeeds ───────────────
  function handlePaymentSuccess(booking) {
    setUpiData(null);
    setConfirmed(booking);
    // navigate to My Bookings or show a success screen
  }

  // ── Step 3: user cancelled before paying ──────────────────────────────────
  function handlePaymentCancel() {
    setUpiData(null);
    // optionally call DELETE /api/bookings/:id to clean up the pending booking
  }

  return (
    <div>
      {/* ── your existing booking UI ── */}
      <button
        onClick={() => handleBookSeat({
          vanId:         "YOUR_VAN_ID",
          seatNumber:    3,
          pickup:        "Botanical Garden Metro",
          destination:   "Galgotias University",
          departureTime: "7:30 AM",
        })}
        className="bg-[#FF5A3C] text-white px-6 py-3 rounded-xl font-semibold"
      >
        Book Seat
      </button>

      {bookingError && <p className="text-red-500 text-sm mt-2">{bookingError}</p>}

      {confirmedBooking && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl text-green-700 font-semibold">
          ✓ Booking confirmed! Ticket: {confirmedBooking.ticketId}
        </div>
      )}

      {/* ── UPI modal — shown automatically after create-order ── */}
      {upiData && (
        <UpiPaymentModal
          booking={{
            bookingId: upiData.bookingId,
            ticketId:  upiData.ticketId,
            fare:      upiData.fare,
            upiId:     upiData.upiId,
            upiName:   upiData.upiName,
            upiLink:   upiData.upiLink,
          }}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          apiBase={API_BASE}
          token={token}
        />
      )}
    </div>
  );
}
