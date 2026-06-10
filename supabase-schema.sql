-- Users table
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  avatar text,
  username text unique,
  google_access_token text,
  google_refresh_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Availability table
create table if not exists availability (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  day text not null,
  active boolean default true,
  start_time text not null,
  end_time text not null,
  created_at timestamptz default now()
);

-- Appointment types table
create table if not exists appointment_types (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  label text not null,
  duration integer not null,
  color text default '#4f46e5',
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  type_label text,
  created_at timestamptz default now()
);
