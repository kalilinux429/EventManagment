/*
  # Initial Schema Setup for Event Management System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, linked to auth.users)
      - `username` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `time` (time)
      - `location` (text)
      - `image_url` (text)
      - `price` (decimal)
      - `capacity` (integer)
      - `category` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `status` (enum: pending, confirmed, cancelled)
      - `preferences` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-specific policies
*/

-- Create custom types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  location text NOT NULL,
  image_url text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 0,
  category text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  preferences text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Insert sample data
INSERT INTO events (title, description, date, time, location, image_url, price, capacity, category) VALUES
('Tech Conference 2024', 'Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.', '2024-04-15', '09:00', 'Silicon Valley Convention Center', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 299.99, 500, 'Technology'),
('Music Festival', 'Experience an unforgettable weekend of live music performances from top artists across multiple genres.', '2024-05-20', '16:00', 'Central Park', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 149.99, 1000, 'Music'),
('Food & Wine Festival', 'Savor exquisite cuisines and premium wines from around the world in this gastronomic celebration.', '2024-06-10', '14:00', 'Downtown Food District', 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 89.99, 300, 'Food & Drink'),
('Art Exhibition', 'Discover contemporary masterpieces from emerging artists around the globe.', '2024-07-01', '10:00', 'Modern Art Gallery', 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 25.00, 200, 'Art'),
('Startup Pitch Night', 'Watch innovative startups pitch their ideas to top investors.', '2024-07-15', '18:00', 'Innovation Hub', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 50.00, 150, 'Business'),
('Wellness Retreat', 'A day of mindfulness, yoga, and healthy living workshops.', '2024-08-01', '08:00', 'Serenity Gardens', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 199.99, 100, 'Wellness'),
('Comedy Night', 'Laugh out loud with top stand-up comedians.', '2024-08-15', '20:00', 'Laugh Factory', 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80', 45.00, 250, 'Entertainment');