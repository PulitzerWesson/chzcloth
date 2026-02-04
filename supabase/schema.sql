-- ============================================
-- CHZCLOTH Complete Schema (v2)
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  website text,
  stage text,
  team_size text,
  industry text,
  current_mode text,  -- pmf, growth, efficiency, expansion, unsure
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;

-- ============================================
-- USER_ORGANIZATIONS JOIN TABLE
-- ============================================
create table public.user_organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  role text,
  seniority text,
  started_at date,
  ended_at date,
  is_current boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, org_id)
);

alter table public.user_organizations enable row level security;

create policy "Users can view own org relationships"
  on public.user_organizations for select
  using (auth.uid() = user_id);

create policy "Users can insert own org relationships"
  on public.user_organizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own org relationships"
  on public.user_organizations for update
  using (auth.uid() = user_id);

create policy "Users can delete own org relationships"
  on public.user_organizations for delete
  using (auth.uid() = user_id);

create policy "Users can view orgs they belong to"
  on public.organizations for select
  using (exists (
    select 1 from public.user_organizations uo
    where uo.org_id = organizations.id and uo.user_id = auth.uid()
  ));

create policy "Users can insert organizations"
  on public.organizations for insert
  with check (true);

create policy "Users can update orgs they belong to"
  on public.organizations for update
  using (exists (
    select 1 from public.user_organizations uo
    where uo.org_id = organizations.id and uo.user_id = auth.uid()
  ));

-- ============================================
-- BETS TABLE
-- ============================================
create table public.bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete set null,
  hypothesis text not null,
  metric_domain text,
  metric text,
  custom_metric text,
  bet_type text,
  baseline text,
  prediction text,
  confidence integer default 70,
  timeframe integer,
  assumptions text,
  cheap_test text,
  is_own_idea boolean default true,
  idea_source text,
  measurement_tool text,
  is_past_bet boolean default false,
  past_bet_outcome text,
  past_bet_actual_result text,
  past_bet_learned text,
  past_bet_timeframe text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bets enable row level security;

create policy "Users can view own bets" 
  on public.bets for select 
  using (auth.uid() = user_id);

create policy "Users can insert own bets" 
  on public.bets for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own bets" 
  on public.bets for update 
  using (auth.uid() = user_id);

create policy "Users can delete own bets" 
  on public.bets for delete 
  using (auth.uid() = user_id);

create index bets_user_id_idx on public.bets(user_id);
create index bets_org_id_idx on public.bets(org_id);
create index bets_created_at_idx on public.bets(created_at desc);

-- ============================================
-- OUTCOMES TABLE
-- ============================================
create table public.outcomes (
  id uuid default gen_random_uuid() primary key,
  bet_id uuid references public.bets(id) on delete cascade unique not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actual_result text,
  status text not null,
  learned text,
  would_do_again boolean,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.outcomes enable row level security;

create policy "Users can view own outcomes" 
  on public.outcomes for select 
  using (auth.uid() = user_id);

create policy "Users can insert own outcomes" 
  on public.outcomes for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own outcomes" 
  on public.outcomes for update 
  using (auth.uid() = user_id);

create index outcomes_bet_id_idx on public.outcomes(bet_id);
create index outcomes_user_id_idx on public.outcomes(user_id);

-- ============================================
-- INDEXES
-- ============================================
create index user_orgs_user_id_idx on public.user_organizations(user_id);
create index user_orgs_org_id_idx on public.user_organizations(org_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user stats
create or replace function public.get_user_stats(user_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_bets', count(*),
    'completed_bets', count(*) filter (where o.status is not null or b.past_bet_outcome is not null),
    'successful_bets', count(*) filter (where o.status in ('succeeded', 'partial') or b.past_bet_outcome in ('succeeded', 'partial')),
    'failed_bets', count(*) filter (where o.status = 'failed' or b.past_bet_outcome = 'failed'),
    'accuracy', case 
      when count(*) filter (where o.status in ('succeeded', 'partial', 'failed') or b.past_bet_outcome in ('succeeded', 'partial', 'failed')) > 0 
      then round(
        (count(*) filter (where o.status in ('succeeded', 'partial') or b.past_bet_outcome in ('succeeded', 'partial'))::numeric / 
         count(*) filter (where o.status in ('succeeded', 'partial', 'failed') or b.past_bet_outcome in ('succeeded', 'partial', 'failed'))::numeric) * 100
      )
      else null 
    end
  ) into result
  from public.bets b
  left join public.outcomes o on b.id = o.bet_id
  where b.user_id = user_uuid;
  
  return result;
end;
$$ language plpgsql security definer;
