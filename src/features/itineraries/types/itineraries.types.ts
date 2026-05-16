export interface Itinerary {
  _id: string;
  title: string;
  price: number; // 1-5
  guide: string;
  duration: number; // horas
  hashtags: string[];
  guide_image: string; // URL
  description: string;
  activities?: string[];
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
  activities?: string[];
}