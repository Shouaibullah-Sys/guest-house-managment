// types/booking.ts

export interface BookingItem {
  id: number;
  name: string;
  price: string;
  image: string;
  location: string;
  nights: number;
  rating?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType?: string;
  specialRequests?: string;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface BookingRequest {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  roomType: string;
  totalPrice: number;
  specialRequests?: string;
  userInfo: UserInfo;
  paymentInfo: PaymentInfo;
}

export interface BookingConfirmation {
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalPrice: string;
  confirmationNumber: string;
  guestName: string;
  bookingDate: string;
}
