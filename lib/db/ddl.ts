/**
 * Creates the tables on first start if they don't exist yet (the same idea as
 * the Python version's create_all). Keep in step with schema.ts.
 */
export const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username varchar(80) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  id serial PRIMARY KEY,
  key varchar(80) NOT NULL UNIQUE,
  label varchar(120) NOT NULL,
  "group" varchar(60) NOT NULL DEFAULT 'General',
  kind varchar(20) NOT NULL DEFAULT 'text',
  value text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  grade varchar(40) NOT NULL,
  physical_form varchar(40) NOT NULL DEFAULT '',
  particle_size varchar(120) NOT NULL DEFAULT '',
  acid_value varchar(40) NOT NULL DEFAULT '',
  amine_value varchar(40) NOT NULL DEFAULT '',
  melting_point varchar(40) NOT NULL DEFAULT '',
  color varchar(60) NOT NULL DEFAULT '',
  packing text NOT NULL DEFAULT '',
  best_for text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS applications (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  description text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS milestones (
  id serial PRIMARY KEY,
  year varchar(10) NOT NULL,
  title varchar(160) NOT NULL,
  description text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS advantages (
  id serial PRIMARY KEY,
  title varchar(160) NOT NULL,
  description text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS yearly_stats (
  id serial PRIMARY KEY,
  year integer NOT NULL UNIQUE,
  production_tons double precision NOT NULL DEFAULT 0,
  sales_tons double precision NOT NULL DEFAULT 0,
  sales_usd double precision NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS monthly_stats (
  id serial PRIMARY KEY,
  year integer NOT NULL,
  month integer NOT NULL,
  production_tons double precision NOT NULL DEFAULT 0,
  sales_tons double precision NOT NULL DEFAULT 0,
  sales_usd double precision NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS markets (
  id serial PRIMARY KEY,
  country varchar(80) NOT NULL,
  share_pct double precision NOT NULL DEFAULT 0,
  note varchar(200) NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS clients (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  country varchar(80) NOT NULL DEFAULT '',
  sector varchar(120) NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS certifications (
  id serial PRIMARY KEY,
  name varchar(160) NOT NULL,
  scope text NOT NULL DEFAULT '',
  since varchar(20) NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS news (
  id serial PRIMARY KEY,
  slug varchar(160) NOT NULL UNIQUE,
  title varchar(200) NOT NULL,
  category varchar(60) NOT NULL DEFAULT 'Company',
  published_on date NOT NULL DEFAULT CURRENT_DATE,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url varchar(300) NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS inquiries (
  id serial PRIMARY KEY,
  created_at timestamp NOT NULL DEFAULT now(),
  name varchar(120) NOT NULL,
  company varchar(160) NOT NULL,
  email varchar(160) NOT NULL,
  country varchar(80) NOT NULL DEFAULT '',
  interest varchar(80) NOT NULL DEFAULT '',
  grade varchar(40) NOT NULL DEFAULT '',
  volume varchar(80) NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL DEFAULT 'New'
);
CREATE TABLE IF NOT EXISTS media (
  id serial PRIMARY KEY,
  filename varchar(200) NOT NULL,
  content_type varchar(80) NOT NULL,
  data bytea NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
`;
