export const vansData = [
  {
    id: "GJ-1203",
    driver: "Rajesh Singh",
    rating: 4.9,
    seats: [true, true, false, false, false, false, true, true],
    time: "7:00 AM",
    eta: "8 min",
    price: 49,
  },
  {
    id: "GJ-4451",
    driver: "Amar Verma",
    rating: 4.7,
    seats: [true, true, true, false, false, false, false, true],
    time: "7:15 AM",
    eta: "22 min",
    price: 49,
  },
  {
    id: "GJ-8872",
    driver: "Priya Sharma",
    rating: 5.0,
    seats: [false, false, false, false, false, false, true, true],
    time: "7:30 AM",
    eta: "35 min",
    price: 49,
  },
  {
    id: "GJ-2209",
    driver: "Deepak Kumar",
    rating: 4.6,
    seats: [true, false, false, false, false, false, false, false],
    time: "8:00 AM",
    eta: "58 min",
    price: 49,
  },
];

export const bookingHistory = [
  { route: "BG → GU", date: "Today, 7:00 AM", van: "GJ-1203", status: "confirmed" },
  { route: "GU → BG", date: "Yesterday, 5:30 PM", van: "GJ-4451", status: "completed" },
  { route: "BG → GU", date: "Mon, 7:00 AM", van: "GJ-8872", status: "completed" },
  { route: "GU → BG", date: "Fri, 6:00 PM", van: "GJ-2209", status: "cancelled" },
];
