import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Gym {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  pricePerSession: number;
  latitude: number;
  longitude: number;
  ownerId: string;
  amenities: string[];
  gradientStart: string;
  gradientEnd: string;
  imageUrl: string;
  capacity: number;
  revenueShare: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface TimeSlot {
  id: string;
  gymId: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  bookedCount: number;
}

export interface Booking {
  id: string;
  userId: string;
  gymId: string;
  gymName: string;
  gymGradientStart: string;
  gymGradientEnd: string;
  gymImageUrl: string;
  slotId: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "checked_in" | "cancelled" | "completed";
  qrCode: string;
  amount: number;
  createdAt: string;
}

export interface RevenueEntry {
  bookingId: string;
  gymId: string;
  gymName: string;
  amount: number;
  gymShare: number;
  platformShare: number;
  date: string;
  status: "pending" | "paid";
}

interface DataContextValue {
  gyms: Gym[];
  bookings: Booking[];
  revenueEntries: RevenueEntry[];
  isLoading: boolean;
  getGym: (id: string) => Gym | undefined;
  getTimeSlots: (gymId: string, date: string) => TimeSlot[];
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Promise<Booking>;
  checkInBooking: (bookingId: string, qrCode: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
  getGymBookings: (gymId: string) => Booking[];
  getGymRevenue: (gymId: string) => RevenueEntry[];
  globalRevenueShare: number;
  setGlobalRevenueShare: (pct: number) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const BOOKINGS_KEY = "@gympass_bookings";
const REVENUE_KEY = "@gympass_revenue";
const SETTINGS_KEY = "@gympass_settings";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SEED_GYMS: Gym[] = [
  {
    id: "gym_001",
    name: "Iron District",
    address: "340 Pine St, San Francisco",
    neighborhood: "Financial District",
    description: "Premium strength training facility with state-of-the-art equipment, Olympic lifting platforms, and expert coaching. Built for serious athletes.",
    category: "Strength",
    rating: 4.9,
    reviewCount: 342,
    pricePerSession: 2500,
    latitude: 37.7911,
    longitude: -122.4027,
    ownerId: "owner_001",
    amenities: ["Olympic Lifting", "Saunas", "Protein Bar", "Lockers", "Towels"],
    gradientStart: "#1A1A2E",
    gradientEnd: "#E94560",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    capacity: 30,
    revenueShare: 80,
    isOpen: true,
    openTime: "05:00",
    closeTime: "23:00",
  },
  {
    id: "gym_002",
    name: "Apex Boxing",
    address: "580 Howard St, San Francisco",
    neighborhood: "SoMa",
    description: "World-class boxing gym with professional trainers, ring sessions, and high-energy cardio classes. Train like a champion.",
    category: "Boxing",
    rating: 4.8,
    reviewCount: 218,
    pricePerSession: 3000,
    latitude: 37.7849,
    longitude: -122.3994,
    ownerId: "owner_002",
    amenities: ["Boxing Ring", "Heavy Bags", "Speed Bags", "Coach Sessions", "Wraps"],
    gradientStart: "#1A0A00",
    gradientEnd: "#F97316",
    imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
    capacity: 20,
    revenueShare: 75,
    isOpen: true,
    openTime: "06:00",
    closeTime: "22:00",
  },
  {
    id: "gym_003",
    name: "Zen Flow Studio",
    address: "2415 California St, San Francisco",
    neighborhood: "Pacific Heights",
    description: "Serene yoga and pilates studio combining ancient practices with modern wellness techniques. Find your flow.",
    category: "Yoga",
    rating: 4.7,
    reviewCount: 189,
    pricePerSession: 2200,
    latitude: 37.7876,
    longitude: -122.4344,
    ownerId: "owner_003",
    amenities: ["Heated Rooms", "Meditation Space", "Infrared Sauna", "Towels", "Tea Bar"],
    gradientStart: "#0A1628",
    gradientEnd: "#3B82F6",
    imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80",
    capacity: 25,
    revenueShare: 82,
    isOpen: true,
    openTime: "06:30",
    closeTime: "21:00",
  },
  {
    id: "gym_004",
    name: "CrossFit Surge",
    address: "1050 Bryant St, San Francisco",
    neighborhood: "Potrero Hill",
    description: "High-intensity functional fitness with certified coaches, daily WODs, and a community that pushes you beyond your limits.",
    category: "CrossFit",
    rating: 4.9,
    reviewCount: 456,
    pricePerSession: 2800,
    latitude: 37.7721,
    longitude: -122.4072,
    ownerId: "owner_004",
    amenities: ["Pull-up Rigs", "Rowers", "Bikes", "Coaching", "Community"],
    gradientStart: "#0D1117",
    gradientEnd: "#22C55E",
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    capacity: 15,
    revenueShare: 78,
    isOpen: true,
    openTime: "05:30",
    closeTime: "20:00",
  },
  {
    id: "gym_005",
    name: "Velocity Cycling",
    address: "399 Valencia St, San Francisco",
    neighborhood: "Mission District",
    description: "Immersive indoor cycling experience with rhythm-based classes, power tracking, and motivating instructors who keep you pedaling.",
    category: "Cycling",
    rating: 4.6,
    reviewCount: 312,
    pricePerSession: 3500,
    latitude: 37.7664,
    longitude: -122.4213,
    ownerId: "owner_005",
    amenities: ["45 Bikes", "Power Meters", "Shoe Rental", "Showers", "Towels"],
    gradientStart: "#1A0A1E",
    gradientEnd: "#A855F7",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    capacity: 45,
    revenueShare: 70,
    isOpen: true,
    openTime: "06:00",
    closeTime: "21:30",
  },
  {
    id: "gym_006",
    name: "Harbor HIIT",
    address: "900 North Point St, San Francisco",
    neighborhood: "Fisherman's Wharf",
    description: "Results-driven HIIT training with a stunning bay view. Small groups, big results — burn more in 45 minutes than most do in 2 hours.",
    category: "HIIT",
    rating: 4.8,
    reviewCount: 167,
    pricePerSession: 2600,
    latitude: 37.8066,
    longitude: -122.4194,
    ownerId: "owner_006",
    amenities: ["Bay Views", "TRX", "Kettlebells", "Battle Ropes", "Showers"],
    gradientStart: "#001A1A",
    gradientEnd: "#14B8A6",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    capacity: 18,
    revenueShare: 77,
    isOpen: false,
    openTime: "07:00",
    closeTime: "20:00",
  },
  {
    id: "gym_007",
    name: "Urban Rock",
    address: "2295 Harrison St, San Francisco",
    neighborhood: "Mission",
    description: "Indoor bouldering and lead climbing with 60+ routes for all skill levels. Monthly route resets keep every visit fresh.",
    category: "Climbing",
    rating: 4.7,
    reviewCount: 234,
    pricePerSession: 2000,
    latitude: 37.7601,
    longitude: -122.4089,
    ownerId: "owner_007",
    amenities: ["60+ Routes", "Bouldering Wall", "Lead Wall", "Gear Rental", "Cafe"],
    gradientStart: "#1A1000",
    gradientEnd: "#F59E0B",
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
    capacity: 50,
    revenueShare: 85,
    isOpen: true,
    openTime: "08:00",
    closeTime: "22:00",
  },
  {
    id: "gym_008",
    name: "Nob Hill Athletics",
    address: "1450 Sacramento St, San Francisco",
    neighborhood: "Nob Hill",
    description: "Classic full-service gym with premium cardio equipment, free weights, and personal training. Everything you need under one roof.",
    category: "Full Service",
    rating: 4.5,
    reviewCount: 521,
    pricePerSession: 1800,
    latitude: 37.7929,
    longitude: -122.4171,
    ownerId: "owner_008",
    amenities: ["Cardio Deck", "Free Weights", "Machines", "Pool", "Spa"],
    gradientStart: "#0A0A1A",
    gradientEnd: "#6366F1",
    imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
    capacity: 60,
    revenueShare: 80,
    isOpen: true,
    openTime: "05:00",
    closeTime: "23:30",
  },
];

function generateTimeSlots(gymId: string, date: string, capacity: number): TimeSlot[] {
  const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  return times.map((time) => ({
    id: `slot_${gymId}_${date}_${time}`,
    gymId,
    date,
    time,
    duration: 60,
    capacity,
    bookedCount: Math.floor(Math.random() * Math.floor(capacity * 0.7)),
  }));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalRevenueShare, setGlobalRevenueShareState] = useState(80);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BOOKINGS_KEY),
      AsyncStorage.getItem(REVENUE_KEY),
      AsyncStorage.getItem(SETTINGS_KEY),
    ]).then(([bData, rData, sData]) => {
      if (bData) setBookings(JSON.parse(bData));
      if (rData) setRevenueEntries(JSON.parse(rData));
      if (sData) {
        const s = JSON.parse(sData);
        if (s.globalRevenueShare) setGlobalRevenueShareState(s.globalRevenueShare);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const persistBookings = async (b: Booking[]) => {
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(b));
  };

  const persistRevenue = async (r: RevenueEntry[]) => {
    await AsyncStorage.setItem(REVENUE_KEY, JSON.stringify(r));
  };

  const getGym = (id: string) => SEED_GYMS.find((g) => g.id === id);

  const getTimeSlots = (gymId: string, date: string) => {
    const gym = getGym(gymId);
    if (!gym) return [];
    const slots = generateTimeSlots(gymId, date, gym.capacity);
    const existingBookings = bookings.filter(
      (b) => b.gymId === gymId && b.date === date && b.status !== "cancelled"
    );
    return slots.map((slot) => {
      const booked = existingBookings.filter((b) => b.slotId === slot.id).length;
      return { ...slot, bookedCount: slot.bookedCount + booked };
    });
  };

  const createBooking = async (booking: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const gym = getGym(booking.gymId);
    const gymShare = gym ? Math.round(booking.amount * (gym.revenueShare / 100)) : 0;
    const revenue: RevenueEntry = {
      bookingId: newBooking.id,
      gymId: booking.gymId,
      gymName: booking.gymName,
      amount: booking.amount,
      gymShare,
      platformShare: booking.amount - gymShare,
      date: new Date().toISOString(),
      status: "pending",
    };
    const updatedBookings = [...bookings, newBooking];
    const updatedRevenue = [...revenueEntries, revenue];
    await persistBookings(updatedBookings);
    await persistRevenue(updatedRevenue);
    setBookings(updatedBookings);
    setRevenueEntries(updatedRevenue);
    return newBooking;
  };

  const checkInBooking = async (bookingId: string, qrCode: string) => {
    const booking = bookings.find((b) => b.id === bookingId || b.qrCode === qrCode);
    if (!booking || booking.status === "checked_in") return false;
    const updated = bookings.map((b) =>
      b.id === booking.id ? { ...b, status: "checked_in" as const } : b
    );
    const updatedRevenue = revenueEntries.map((r) =>
      r.bookingId === booking.id ? { ...r, status: "paid" as const } : r
    );
    await persistBookings(updated);
    await persistRevenue(updatedRevenue);
    setBookings(updated);
    setRevenueEntries(updatedRevenue);
    return true;
  };

  const cancelBooking = async (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    await persistBookings(updated);
    setBookings(updated);
  };

  const getUserBookings = (userId: string) =>
    bookings.filter((b) => b.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getGymBookings = (gymId: string) =>
    bookings.filter((b) => b.gymId === gymId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getGymRevenue = (gymId: string) =>
    revenueEntries.filter((r) => r.gymId === gymId);

  const setGlobalRevenueShare = async (pct: number) => {
    setGlobalRevenueShareState(pct);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ globalRevenueShare: pct }));
  };

  const value = useMemo(
    () => ({
      gyms: SEED_GYMS,
      bookings,
      revenueEntries,
      isLoading,
      getGym,
      getTimeSlots,
      createBooking,
      checkInBooking,
      cancelBooking,
      getUserBookings,
      getGymBookings,
      getGymRevenue,
      globalRevenueShare,
      setGlobalRevenueShare,
    }),
    [bookings, revenueEntries, isLoading, globalRevenueShare]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
