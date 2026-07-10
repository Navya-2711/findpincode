import { supabase, type Pincode, type BlogPost } from './supabase';
import { fallbackPincodes } from './fallbackData';

function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

async function queryPincodes<T>(queryFn: () => PromiseLike<T> | T): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for this deployment.');
  }

  try {
    return await queryFn() as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Supabase error';
    if (message.toLowerCase().includes('404') || message.toLowerCase().includes('does not exist') || message.toLowerCase().includes('relation') || message.toLowerCase().includes('not found')) {
      throw new Error('Pincode data is not available in the current Supabase deployment.');
    }
    throw error;
  }
}

function getFallbackPincodes(query: string): Pincode[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return fallbackPincodes.filter((item) => {
    const haystack = `${item.pincode} ${item.office_name} ${item.district_name} ${item.state_name}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}

export async function searchPincodes(query: string): Promise<Pincode[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (/^\d+$/.test(trimmed)) {
    try {
      const { data, error } = await queryPincodes(async () => supabase
        .from('pincodes')
        .select('*')
        .eq('pincode', trimmed)
        .order('office_name'));
      if (error) throw error;
      return (data as Pincode[]) ?? [];
    } catch {
      return getFallbackPincodes(trimmed);
    }
  }

  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('*')
      .or(`office_name.ilike.%${trimmed}%,district_name.ilike.%${trimmed}%,state_name.ilike.%${trimmed}%,taluk.ilike.%${trimmed}%`)
      .order('office_name')
      .limit(100));
    if (error) throw error;
    return (data as Pincode[]) ?? [];
  } catch {
    return getFallbackPincodes(trimmed);
  }
}

export async function getPincodeById(id: string): Promise<Pincode | null> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('*')
      .eq('id', id)
      .maybeSingle());
    if (error) throw error;
    return data as Pincode | null;
  } catch {
    return fallbackPincodes.find((item) => item.id === id) ?? null;
  }
}

export async function getPincodesByPincode(pincode: string): Promise<Pincode[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('*')
      .eq('pincode', pincode)
      .order('office_name'));
    if (error) throw error;
    return (data as Pincode[]) ?? [];
  } catch {
    return getFallbackPincodes(pincode);
  }
}

export type StateSummary = {
  state_name: string;
  post_office_count: number;
  pincode_count: number;
  district_count: number;
  popular_cities: string[];
};

function buildStateSummaries(rows: Array<Pick<Pincode, 'state_name' | 'district_name' | 'pincode' | 'office_name'>>) {
  const stateMap = new Map<string, {
    post_office_count: number;
    pincodes: Set<string>;
    districts: Set<string>;
    districtCounts: Map<string, number>;
  }>();

  for (const row of rows) {
    const state = row.state_name;
    const district = row.district_name || 'Unknown';
    let entry = stateMap.get(state);
    if (!entry) {
      entry = {
        post_office_count: 0,
        pincodes: new Set(),
        districts: new Set(),
        districtCounts: new Map(),
      };
      stateMap.set(state, entry);
    }
    entry.post_office_count += 1;
    entry.pincodes.add(row.pincode);
    entry.districts.add(district);
    entry.districtCounts.set(district, (entry.districtCounts.get(district) ?? 0) + 1);
  }

  return Array.from(stateMap.entries()).map(([state_name, entry]) => ({
    state_name,
    post_office_count: entry.post_office_count,
    pincode_count: entry.pincodes.size,
    district_count: entry.districts.size,
    popular_cities: Array.from(entry.districtCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([district]) => district),
  })).sort((a, b) => a.state_name.localeCompare(b.state_name));
}

function getFallbackStateSummaries(): StateSummary[] {
  return buildStateSummaries(fallbackPincodes.map((item) => ({
    state_name: item.state_name,
    district_name: item.district_name,
    pincode: item.pincode,
    office_name: item.office_name,
  })));
}

export async function getStateSummaries(): Promise<StateSummary[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('state_name,district_name,pincode,office_name'));
    if (error) throw error;
    return buildStateSummaries(data as Array<Pick<Pincode, 'state_name' | 'district_name' | 'pincode' | 'office_name'>> ?? []);
  } catch {
    return getFallbackStateSummaries();
  }
}

export async function getStateSummary(state: string): Promise<StateSummary | null> {
  const records = await getPincodesByState(state);
  if (!records.length) return null;
  const summary = buildStateSummaries(records.map((item) => ({
    state_name: item.state_name,
    district_name: item.district_name,
    pincode: item.pincode,
    office_name: item.office_name,
  })));
  return summary.find((item) => item.state_name === state) ?? null;
}

export async function getAllStates(): Promise<string[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('state_name'));
    if (error) throw error;
    const states = Array.from(new Set((data as Pick<Pincode, 'state_name'>[]).map((r) => r.state_name)));
    return states.sort();
  } catch {
    return Array.from(new Set(fallbackPincodes.map((item) => item.state_name))).sort();
  }
}

export async function getDistrictsByState(state: string): Promise<string[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('district_name')
      .eq('state_name', state));
    if (error) throw error;
    const districts = Array.from(new Set((data as Pick<Pincode, 'district_name'>[]).map((r) => r.district_name)));
    return districts.sort();
  } catch {
    return Array.from(new Set(fallbackPincodes.filter((item) => item.state_name === state).map((item) => item.district_name))).sort();
  }
}

export async function getPincodesByState(state: string): Promise<Pincode[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('*')
      .eq('state_name', state)
      .order('district_name')
      .order('office_name'));
    if (error) throw error;
    return (data as Pincode[]) ?? [];
  } catch {
    return fallbackPincodes.filter((item) => item.state_name === state);
  }
}

export async function getPincodesByDistrict(state: string, district: string): Promise<Pincode[]> {
  try {
    const { data, error } = await queryPincodes(async () => supabase
      .from('pincodes')
      .select('*')
      .eq('state_name', state)
      .eq('district_name', district)
      .order('office_name'));
    if (error) throw error;
    return (data as Pincode[]) ?? [];
  } catch {
    return fallbackPincodes.filter((item) => item.state_name === state && item.district_name === district);
  }
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as BlogPost[];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw error;
    return data as BlogPost | null;
  } catch {
    return null;
  }
}

export async function submitContact(name: string, email: string, subject: string, message: string) {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject, message });
    if (error) throw error;
  } catch {
    // Ignore contact form failures in deployments without Supabase table setup.
  }
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
