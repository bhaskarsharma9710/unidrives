# 🌿 EcoVan – Student Transport Platform

A React + Tailwind CSS web app for organized eco van transport between **Botanical Garden Metro Station** and **Galgotias University**.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
ecovan/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky navigation bar
│   │   ├── Toast.jsx           # Toast notification
│   │   └── BookingModal.jsx    # Booking confirmation modal
│   ├── pages/
│   │   ├── HomePage.jsx        # Hero, search, routes, features
│   │   ├── BookingPage.jsx     # Van listing with seat map
│   │   ├── TrackingPage.jsx    # Live van tracking UI
│   │   ├── DashboardPage.jsx   # Student metrics & history
│   │   └── AuthPage.jsx        # Login & register forms
│   ├── data/
│   │   └── vans.js             # Mock data for vans & bookings
│   ├── App.jsx                 # Root component with page routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind + global styles
├── index.html
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
└── package.json
```

---

## 🎯 Pages & Features

| Page | Features |
|------|----------|
| **Home** | Hero section, stats strip, van search form, route cards, feature grid |
| **Book Ride** | Van cards, interactive seat map (click to select), filter chips, booking modal |
| **Live Tracking** | Simulated map, driver details, live ETA countdown, trip timeline, SOS button |
| **Dashboard** | Metrics (rides, spend, CO₂ saved), booking history, weekly bar chart, quick actions |
| **Login / Register** | Tabbed auth forms, college email + password, pickup preference |

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Tailwind CSS 3** — Utility-first styling
- **Vite** — Build tool & dev server
- **Google Fonts** — Syne (headings) + DM Sans (body)

---

## 🔧 Next Steps (Backend Integration)

To connect this frontend to a real backend:

1. **Replace mock data** in `src/data/vans.js` with API calls
2. **Add React Router** for proper URL-based navigation
3. **Connect to Node.js + Express APIs**:
   - `POST /register` / `POST /login` → AuthPage
   - `GET /vans` → BookingPage
   - `POST /book-seat` → BookingModal
   - `GET /my-bookings` → DashboardPage
   - Socket.io for live tracking → TrackingPage
4. **Add Razorpay** payment integration in BookingModal
5. **Integrate Google Maps API** in TrackingPage

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary Green | `#1a7a4a` |
| Accent Green | `#2db370` |
| Dark Green | `#0f4d2e` |
| Light Green | `#e6f5ed` |
| Background | `#f5f7f2` |
| Muted Text | `#5a6352` |
| Border | `#d4dcc8` |
| Heading Font | Syne (700–800) |
| Body Font | DM Sans (400–500) |
