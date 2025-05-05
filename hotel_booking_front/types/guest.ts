export interface Guest {
  id: number;
  fullname: string;
  email: string;
  checkIn: string;
  leaveDate: string;
  roomNo: number;
  status: 'active' | 'checked-out';
  paid: boolean;
  [key: string]: any; // Pour permettre d'autres propriétés
}