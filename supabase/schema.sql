create extension if not exists pgcrypto;

create table if not exists public.profiles_public (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique,
  avatar_url text not null default '',
  bio text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_public_nickname_length check (char_length(trim(nickname)) between 3 and 24),
  constraint profiles_public_avatar_url_length check (char_length(avatar_url) <= 2000),
  constraint profiles_public_bio_length check (char_length(bio) <= 500)
);

alter table public.profiles_public enable row level security;

create table if not exists public.profiles_private (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_private_full_name_length check (char_length(full_name) <= 120),
  constraint profiles_private_phone_length check (char_length(phone) <= 40),
  constraint profiles_private_email_length check (char_length(email) <= 320)
);

alter table public.profiles_private enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_nickname text;
  normalized_nickname text;
  unique_nickname text;
  suffix_counter integer := 0;
  meta_avatar text;
  meta_bio text;
  meta_full_name text;
  meta_phone text;
  user_email text;
begin
  requested_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    split_part(new.email, '@', 1),
    'trainer'
  );

  normalized_nickname := left(trim(requested_nickname), 24);

  if char_length(normalized_nickname) < 3 then
    normalized_nickname := rpad(normalized_nickname, 3, '_');
  end if;

  unique_nickname := normalized_nickname;

  while exists (
    select 1
    from public.profiles_public
    where nickname = unique_nickname
      and id <> new.id
  ) loop
    suffix_counter := suffix_counter + 1;
    unique_nickname :=
      left(
        normalized_nickname,
        greatest(3, 24 - char_length(suffix_counter::text) - 1)
      ) || '-' || suffix_counter::text;
  end loop;

  meta_avatar := left(
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''), ''),
    2000
  );
  meta_bio := left(
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'bio'), ''), ''),
    500
  );

  meta_full_name := left(
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    120
  );
  meta_phone := left(
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), ''),
    40
  );
  user_email := left(coalesce(nullif(trim(new.email), ''), ''), 320);

  insert into public.profiles_public (id, nickname, avatar_url, bio)
  values (new.id, unique_nickname, meta_avatar, meta_bio);

  insert into public.profiles_private (id, full_name, phone, email)
  values (new.id, meta_full_name, meta_phone, user_email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.sync_profiles_private_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles_private
    set email = left(coalesce(nullif(trim(new.email), ''), ''), 320)
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute procedure public.sync_profiles_private_email_from_auth();

create table if not exists public.pokemon_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles_public (id) on delete cascade,
  creator_nickname text not null default 'Unknown trainer',
  creator_avatar_url text not null default '',
  name text not null,
  image text not null default '',
  hp integer not null default 0,
  types text[] not null default '{}',
  attacks jsonb not null default '[]'::jsonb,
  weakness text not null default '',
  resistance text not null default '',
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pokemon_cards_hp_non_negative check (hp >= 0),
  constraint pokemon_cards_attacks_is_array check (jsonb_typeof(attacks) = 'array')
);

alter table public.pokemon_cards enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_card_creator_from_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pn text;
  pa text;
begin
  select nickname, avatar_url
  into pn, pa
  from public.profiles_public
  where id = new.user_id;

  new.creator_nickname := coalesce(nullif(trim(pn), ''), 'Unknown trainer');
  new.creator_avatar_url := coalesce(nullif(trim(pa), ''), '');
  return new;
end;
$$;

create or replace function public.sync_pokemon_cards_creator_display()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.nickname is distinct from old.nickname
     or new.avatar_url is distinct from old.avatar_url then
    update public.pokemon_cards
    set
      creator_nickname = coalesce(nullif(trim(new.nickname), ''), 'Unknown trainer'),
      creator_avatar_url = coalesce(nullif(trim(new.avatar_url), ''), '')
    where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists set_profiles_public_updated_at on public.profiles_public;
drop trigger if exists set_profiles_private_updated_at on public.profiles_private;
drop trigger if exists set_pokemon_cards_updated_at on public.pokemon_cards;
drop trigger if exists set_pokemon_cards_creator_from_profile on public.pokemon_cards;
drop trigger if exists sync_cards_creator_on_public_profile on public.profiles_public;

create trigger set_profiles_public_updated_at
before update on public.profiles_public
for each row execute procedure public.set_updated_at();

create trigger set_profiles_private_updated_at
before update on public.profiles_private
for each row execute procedure public.set_updated_at();

create or replace function public.profiles_private_enforce_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_email text;
begin
  select left(coalesce(nullif(trim(u.email), ''), ''), 320)
  into auth_email
  from auth.users u
  where u.id = new.id;

  new.email := coalesce(auth_email, '');
  return new;
end;
$$;

drop trigger if exists profiles_private_enforce_email on public.profiles_private;

create trigger profiles_private_enforce_email
before insert or update on public.profiles_private
for each row execute procedure public.profiles_private_enforce_email_from_auth();

create trigger set_pokemon_cards_updated_at
before update on public.pokemon_cards
for each row execute procedure public.set_updated_at();

create trigger set_pokemon_cards_creator_from_profile
before insert or update of user_id on public.pokemon_cards
for each row execute procedure public.set_card_creator_from_public_profile();

create trigger sync_cards_creator_on_public_profile
after update of nickname, avatar_url on public.profiles_public
for each row execute procedure public.sync_pokemon_cards_creator_display();

revoke all on public.profiles_public from anon;
revoke all on public.profiles_public from authenticated;
grant select on public.profiles_public to anon, authenticated;
grant insert, update on public.profiles_public to authenticated;

revoke all on public.profiles_private from anon;
revoke all on public.profiles_private from authenticated;
grant select, insert, update on public.profiles_private to authenticated;

grant select on public.pokemon_cards to anon, authenticated;
grant insert, update, delete on public.pokemon_cards to authenticated;

drop policy if exists "Users can delete their own public profile" on public.profiles_public;
drop policy if exists "Public profiles are readable by anyone" on public.profiles_public;
create policy "Public profiles are readable by anyone"
on public.profiles_public
for select
using (true);

drop policy if exists "Users can insert their own public profile" on public.profiles_public;
create policy "Users can insert their own public profile"
on public.profiles_public
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own public profile" on public.profiles_public;
create policy "Users can update their own public profile"
on public.profiles_public
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their own private profile" on public.profiles_private;
drop policy if exists "Users can read their own private profile" on public.profiles_private;
create policy "Users can read their own private profile"
on public.profiles_private
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert their own private profile" on public.profiles_private;
create policy "Users can insert their own private profile"
on public.profiles_private
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own private profile" on public.profiles_private;
create policy "Users can update their own private profile"
on public.profiles_private
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Cards are publicly readable" on public.pokemon_cards;
create policy "Cards are publicly readable"
on public.pokemon_cards
for select
using (true);

drop policy if exists "Users can insert their own cards" on public.pokemon_cards;
create policy "Users can insert their own cards"
on public.pokemon_cards
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cards" on public.pokemon_cards;
create policy "Users can update their own cards"
on public.pokemon_cards
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own cards" on public.pokemon_cards;
create policy "Users can delete their own cards"
on public.pokemon_cards
for delete
to authenticated
using (auth.uid() = user_id);
