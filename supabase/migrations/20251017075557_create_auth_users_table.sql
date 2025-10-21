/*
  # Create Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text) - Admin email address
      - `created_at` (timestamptz) - Account creation timestamp

  2. Security
    - Enable RLS on `admin_users` table
    - Only authenticated admin users can view admin_users table
    - This table is used to identify which users have admin privileges

  3. Important Notes
    - This table works alongside Supabase's built-in auth.users table
    - Admin status is determined by presence in this table
    - Initial admin users must be manually added to this table
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );