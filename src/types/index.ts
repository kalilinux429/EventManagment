export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  price: number;
  capacity: number;
  registeredCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string;
}