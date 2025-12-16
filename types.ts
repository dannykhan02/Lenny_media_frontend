export interface Service {
  id: string;
  title: string;
  description: string;
  priceStart: string;
  image: string;
  icon: 'camera' | 'video' | 'users' | 'star';
}

export interface PortfolioItem {
  id: string;
  category: string;
  image: string;
  title: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}