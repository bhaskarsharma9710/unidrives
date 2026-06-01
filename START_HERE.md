# 🚀 EcoVan — Full Stack Setup Guide

## One-time setup

### 1. Backend
```bash
cd ecovan-backend
npm install
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
npm run dev
# → Running at http://localhost:5000
```

### 2. Frontend
```bash
cd ecovan
npm install
# .env is already set to http://localhost:5000
npm run dev
# → Running at http://localhost:5173
```

## Seed some vans (run once after backend starts)
Open a new terminal and run:
```bash
curl -X POST http://localhost:5000/api/vans \
  -H "Content-Type: application/json" \
  -d '{"vanNumber":"GJ-1203","driverName":"Rajesh Singh","driverRating":4.9,"route":"Botanical Garden → Galgotias University","departureTime":"7:00 AM","fare":49}'

curl -X POST http://localhost:5000/api/vans \
  -H "Content-Type: application/json" \
  -d '{"vanNumber":"GJ-4451","driverName":"Amar Verma","driverRating":4.7,"route":"Botanical Garden → Galgotias University","departureTime":"7:30 AM","fare":49}'

curl -X POST http://localhost:5000/api/vans \
  -H "Content-Type: application/json" \
  -d '{"vanNumber":"GJ-8872","driverName":"Priya Sharma","driverRating":5.0,"route":"Galgotias University → Botanical Garden","departureTime":"5:30 PM","fare":49}'
```

## What works without backend (Demo mode)
- Homepage, UI navigation — always works
- Booking page — shows mock vans if backend is offline
- Auth — shows errors from real API when online
- Dashboard — shows mock bookings if API is offline
- Tracking — animates even without socket (demo)

## Environment Variables

### Backend (.env)
| Variable | Value |
|----------|-------|
| PORT | 5000 |
| MONGO_URI | Get from MongoDB Atlas |
| JWT_SECRET | Any long random string |
| JWT_EXPIRE | 7d |
| RAZORPAY_KEY_ID | From Razorpay dashboard |
| RAZORPAY_KEY_SECRET | From Razorpay dashboard |
| CLIENT_URL | http://localhost:5173 |

### Frontend (.env) — already filled
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Quick Reference
| Action | Method | URL |
|--------|--------|-----|
| Register | POST | /api/auth/register |
| Login | POST | /api/auth/login |
| Get Vans | GET | /api/vans |
| Book Seat | POST | /api/bookings/create-order |
| Verify Payment | POST | /api/bookings/verify-payment |
| My Bookings | GET | /api/bookings/my-bookings |
| Cancel | DELETE | /api/bookings/:id |
