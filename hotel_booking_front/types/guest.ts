export interface Guest {
  id: number;
  fullname: string;
  checkIn: string;
  leaveDate: string;
  roomNo: number;
  statusfield: 'confirmed' | 'checked-out';
  paid: boolean;
  [key: string]: any; // Pour permettre d'autres propriétés
}

// Interface qui correspond à la structure de données retournée par Strapi
export interface StrapiGuest {
  id: number;
  attributes: {
    fullname: string;
    checkIn: string;
    leaveDate: string;
    roomNo: number;
    statusfield: 'confirmed' | 'checked-out';
    paid: boolean;
    [key: string]: any;
  }
}

// Interfaces pour les réponses Strapi
export interface StrapiResponse<T> {
  data: T;
  meta?: unknown;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: unknown;
}