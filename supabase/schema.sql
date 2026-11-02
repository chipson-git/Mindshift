-- Mindshift database schema. Run once in the Supabase SQL editor.
-- Row Level Security: users read/write only their own rows. Plan and usage
-- columns are NOT writable by users (only the service role / security-definer functions).

-- Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  tier text check (tier in ('basic', 'pro', 'vip')),
  billing_period text check (billing_period in ('monthly', 'yearly')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

-- Users may change their name only. tier / billing_period / current_period_end
-- are changed by the server with the service role key (checkout, payment webhooks).
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

-- Create a profile row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Daily exercise completions --------------------------------------------------
create table if not exists public.exercise_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  exercise_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day, exercise_id)
);

alter table public.exercise_completions enable row level security;
create policy "exercises: read own" on public.exercise_completions
  for select using (auth.uid() = user_id);
create policy "exercises: insert own" on public.exercise_completions
  for insert with check (auth.uid() = user_id);

-- Course lesson completions ---------------------------------------------------
create table if not exists public.lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_completions enable row level security;
create policy "lessons: read own" on public.lesson_completions
  for select using (auth.uid() = user_id);
create policy "lessons: insert own" on public.lesson_completions
  for insert with check (auth.uid() = user_id);

-- Monthly AI usage counters ---------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  coach_messages int not null default 0,
  custom_meditations int not null default 0,
  primary key (user_id, month)
);

alter table public.ai_usage enable row level security;
create policy "usage: read own" on public.ai_usage
  for select using (auth.uid() = user_id);
-- No insert/update policy: counters only change through increment_usage().

create or replace function public.increment_usage(p_month text, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_kind not in ('coach_messages', 'custom_meditations') then
    raise exception 'invalid kind';
  end if;
  insert into public.ai_usage (user_id, month) values (auth.uid(), p_month)
    on conflict (user_id, month) do nothing;
  execute format('update public.ai_usage set %I = %I + 1 where user_id = $1 and month = $2', p_kind, p_kind)
    using auth.uid(), p_month;
end;
$$;

revoke all on function public.increment_usage(text, text) from public;
grant execute on function public.increment_usage(text, text) to authenticated;

-- Community posts -------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default '',
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "posts: read (signed in)" on public.posts
  for select using (auth.role() = 'authenticated');
create policy "posts: insert own" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "posts: delete own" on public.posts
  for delete using (auth.uid() = user_id);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Game results (personal leaderboard and progress charts) -----------------------
-- The app keeps results in the browser for now; this table is ready for syncing them.
create table if not exists public.game_results (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  game text not null,
  score int not null check (score >= 0),
  played_at timestamptz not null default now()
);

alter table public.game_results enable row level security;
create policy "game results: read own" on public.game_results
  for select using (auth.uid() = user_id);
create policy "game results: insert own" on public.game_results
  for insert with check (auth.uid() = user_id);

create index if not exists game_results_user_game_idx on public.game_results (user_id, game, played_at desc);
