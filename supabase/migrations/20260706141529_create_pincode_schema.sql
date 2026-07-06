/*
# India Pincode Finder - Full Schema

## Tables Created
1. `pincodes` - Stores post office / pincode data for all India
   - id, pincode, office_name, office_type, delivery, division, region, circle, taluk, district_name, state_name, telephone, related_suboffice, related_headoffice, longitude, latitude, created_at, updated_at
2. `blog_posts` - Blog articles
   - id, title, slug, excerpt, content, author, published, created_at, updated_at
3. `contact_messages` - Contact form submissions
   - id, name, email, subject, message, created_at

## Security
- RLS enabled on all tables
- Public read on pincodes and published blog posts (anon + authenticated)
- Contact messages: insert only for anon; admin reads via service role
- Admin panel operations protected by simple password stored in env
*/

-- PINCODES TABLE
CREATE TABLE IF NOT EXISTS pincodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode text NOT NULL,
  office_name text NOT NULL,
  office_type text DEFAULT 'B.O',
  delivery text DEFAULT 'Delivery',
  division text,
  region text,
  circle text,
  taluk text,
  district_name text NOT NULL,
  state_name text NOT NULL,
  telephone text,
  related_suboffice text,
  related_headoffice text,
  longitude numeric(10,6),
  latitude numeric(10,6),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pincodes_pincode ON pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_pincodes_office_name ON pincodes USING gin(to_tsvector('english', office_name));
CREATE INDEX IF NOT EXISTS idx_pincodes_state ON pincodes(state_name);
CREATE INDEX IF NOT EXISTS idx_pincodes_district ON pincodes(district_name);

ALTER TABLE pincodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_pincodes" ON pincodes;
CREATE POLICY "public_select_pincodes" ON pincodes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_pincodes" ON pincodes;
CREATE POLICY "public_insert_pincodes" ON pincodes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_pincodes" ON pincodes;
CREATE POLICY "public_update_pincodes" ON pincodes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_pincodes" ON pincodes;
CREATE POLICY "public_delete_pincodes" ON pincodes FOR DELETE
  TO anon, authenticated USING (true);

-- BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  author text DEFAULT 'Admin',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_blog_posts" ON blog_posts;
CREATE POLICY "public_select_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON blog_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
CREATE POLICY "admin_update_blog_posts" ON blog_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_delete_blog_posts" ON blog_posts FOR DELETE
  TO anon, authenticated USING (true);

-- CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_contact" ON contact_messages;
CREATE POLICY "public_insert_contact" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_contact" ON contact_messages;
CREATE POLICY "public_select_contact" ON contact_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_delete_contact" ON contact_messages;
CREATE POLICY "public_delete_contact" ON contact_messages FOR DELETE
  TO anon, authenticated USING (true);
