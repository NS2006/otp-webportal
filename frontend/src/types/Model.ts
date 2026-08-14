/** Representasi User */
export type User = {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isActive: boolean;
};

/** Representasi Store */
export type Store = {
  id: number;
  name: string;
  phoneNumber: string;
};

/** Representasi Sender OTP */
export type Sender = {
  id: number;
  name: string;
  phoneNumber: string;
  otps?: Otp[];
};

/** Representasi pesan OTP */
export type Otp = {
  id: number;
  receivedDate: string;
  receivedVia: string;
  type: string;
  code: string;
  message?: string;
  storeId: number;
  senderId: number;
  sender?: Sender; 
};

/** Representasi UserResponsibility */
export type UserResponsibility = {
  id: number;
  userId: number;
  storeId: number;
  store: Store; 
};