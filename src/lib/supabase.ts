import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Pincode = {
  id: string;
  pincode: string;
  office_name: string;
  office_type: string;
  delivery: string;
  division: string | null;
  region: string | null;
  circle: string | null;
  taluk: string | null;
  district_name: string;
  state_name: string;
  telephone: string | null;
  related_suboffice: string | null;
  related_headoffice: string | null;
  longitude: number | null;
  latitude: number | null;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};
