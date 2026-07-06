import { supabase, type Pincode, type BlogPost } from './supabase';

export async function searchPincodes(query: string): Promise<Pincode[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (/^\d+$/.test(trimmed)) {
    const { data, error } = await supabase
      .from('pincodes')
      .select('*')
      .eq('pincode', trimmed)
      .order('office_name');
    if (error) throw error;
    return data as Pincode[];
  }

  const { data, error } = await supabase
    .from('pincodes')
    .select('*')
    .or(`office_name.ilike.%${trimmed}%,district_name.ilike.%${trimmed}%,state_name.ilike.%${trimmed}%,taluk.ilike.%${trimmed}%`)
    .order('office_name')
    .limit(100);
  if (error) throw error;
  return data as Pincode[];
}

export async function getPincodeById(id: string): Promise<Pincode | null> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Pincode | null;
}

export async function getPincodesByPincode(pincode: string): Promise<Pincode[]> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('*')
    .eq('pincode', pincode)
    .order('office_name');
  if (error) throw error;
  return data as Pincode[];
}

export async function getAllStates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('state_name');
  if (error) throw error;
  const states = Array.from(new Set((data as Pick<Pincode, 'state_name'>[]).map((r) => r.state_name)));
  return states.sort();
}

export async function getDistrictsByState(state: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('district_name')
    .eq('state_name', state);
  if (error) throw error;
  const districts = Array.from(new Set((data as Pick<Pincode, 'district_name'>[]).map((r) => r.district_name)));
  return districts.sort();
}

export async function getPincodesByState(state: string): Promise<Pincode[]> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('*')
    .eq('state_name', state)
    .order('district_name')
    .order('office_name');
  if (error) throw error;
  return data as Pincode[];
}

export async function getPincodesByDistrict(state: string, district: string): Promise<Pincode[]> {
  const { data, error } = await supabase
    .from('pincodes')
    .select('*')
    .eq('state_name', state)
    .eq('district_name', district)
    .order('office_name');
  if (error) throw error;
  return data as Pincode[];
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return data as BlogPost | null;
}

export async function submitContact(name: string, email: string, subject: string, message: string) {
  const { error } = await supabase
    .from('contact_messages')
    .insert({ name, email, subject, message });
  if (error) throw error;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
