export interface Activity {
  _id: string;
  name: string;
  description: string;
  image: string;
  duration?: number; // minutos
}

export interface Itinerary {
  _id: string;
  title: string;
  price: number; // 1-5
  guide: string;
  duration: number; // horas
  hashtags: string[];
  guide_image: string; // URL
  description: string;
  activities?: Activity[]; // CAMBIA de string[] a Activity[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  city: string | any; // ID o Ciudad populada
}

export interface CreateItineraryData {
  title: string;
  price: number;
  guide: string;
  duration: number;
  hashtags?: string[];
  guide_image: string;
  description: string;
  // activities REMOVIDO — se gestionan aparte
}

export interface CreateActivityData {
  name: string;
  description: string;
  image: string;
  duration?: number;
}