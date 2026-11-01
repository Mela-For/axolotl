create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  seniority text,
  location text,
  company text,
  job text,
  image text,
  email text,
  linkedin text,
  phone text
);
