-- SUPABASE DATABASE SETUP
-- Run these commands in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kid_name TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create playdates table
CREATE TABLE playdates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('oneOnOne', 'group')),
    location TEXT,
    activity TEXT,
    notes TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create RSVPs table (for future multi-user support)
CREATE TABLE rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playdate_id UUID REFERENCES playdates(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playdate_id, profile_id)
);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger for playdates
CREATE TRIGGER update_playdates_updated_at BEFORE UPDATE ON playdates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS) - for production
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playdates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- 7. Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to playdates" ON playdates FOR ALL USING (true);
CREATE POLICY "Allow all access to rsvps" ON rsvps FOR ALL USING (true);

-- 8. Create indexes for better performance
CREATE INDEX idx_playdates_creator ON playdates(creator_id);
CREATE INDEX idx_playdates_date ON playdates(date);
CREATE INDEX idx_playdates_status ON playdates(status);
CREATE INDEX idx_rsvps_playdate ON rsvps(playdate_id);
CREATE INDEX idx_rsvps_profile ON rsvps(profile_id);

-- DONE! Your database is ready.
-- Next steps:
-- 1. Copy your Supabase URL and anon key from Settings > API
-- 2. Update the constants in playdate-matcher-with-backend.jsx
-- 3. Set up the email function (see email-function.js)
