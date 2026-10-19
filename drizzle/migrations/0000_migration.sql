create type public.app_role as enum ('admin','worker','client');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role public.app_role not null default 'client'
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','worker'))
$$;

create policy "own or staff read profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()) or public.is_staff(id));
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "read own role or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "admin manage roles" on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- signup: profile + role (first user becomes admin, rest are clients)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role)
  values (new.id, case when exists (select 1 from public.user_roles where role='admin') then 'client'::public.app_role else 'admin'::public.app_role end);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  address text not null default '',
  notes text not null default '',
  status text not null default 'programada',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "see own appointments" on public.appointments for select to authenticated
  using (client_id = auth.uid() or worker_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "staff create appointments" on public.appointments for insert to authenticated
  with check ((worker_id = auth.uid() and public.has_role(auth.uid(),'worker')) or public.has_role(auth.uid(),'admin'));
create policy "staff update appointments" on public.appointments for update to authenticated
  using (worker_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "staff delete appointments" on public.appointments for delete to authenticated
  using (worker_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "read chat" on public.messages for select to authenticated
  using (client_id = auth.uid() or public.is_staff(auth.uid()));
create policy "write chat" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and (client_id = auth.uid() or public.is_staff(auth.uid())));
alter publication supabase_realtime add table public.messages;

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles(id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  in_lat double precision, in_lng double precision, in_label text,
  out_lat double precision, out_lng double precision, out_label text
);
grant select, insert, update on public.time_entries to authenticated;
grant all on public.time_entries to service_role;
alter table public.time_entries enable row level security;
create policy "read time" on public.time_entries for select to authenticated
  using (worker_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "clock in" on public.time_entries for insert to authenticated
  with check (worker_id = auth.uid() and public.is_staff(auth.uid()));
create policy "clock out" on public.time_entries for update to authenticated
  using (worker_id = auth.uid()) with check (worker_id = auth.uid());