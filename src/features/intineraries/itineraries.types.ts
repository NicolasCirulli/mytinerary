import type { City } from "@features/cities/cities.types";
export interface Itinerary{
    _id: string;
    title: string;
    price: number;
    guide: string;
    duration: number;
    hashtags: string[];
    guide_image: string;
    description: string;
    activities?: string[];
    likes?: string[]; 
    reviews?: string[];
    city: City;
}