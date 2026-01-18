-- Sprint 08: Staff scheduling, time off, production tasks enhancements, shortages RPC

do $$
begin
  if not exists (select 1 from pg_type where typname = 'shift_status') then
    create type shift_status as enum ('scheduled', 'done', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'time_off_type') then
    create type time_off_type as enum ('vacation', 'sick', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('draft', 'in_progress', 'done');
  end if;
end $$;

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  user_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  role text,
  status shift_status not null default 'scheduled',
  created_at timestamptz default now(),
  constraint shifts_valid_range check (starts_at < ends_at)
);

create table if not exists time_off (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  user_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  type time_off_type not null default 'vacation',
  created_at timestamptz default now(),
  constraint time_off_valid_range check (starts_at < ends_at)
);

-- enhance production tasks with status/priority/station defaults if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'production_tasks' and column_name = 'status') then
    alter table production_tasks add column status task_status default 'draft';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'production_tasks' and column_name = 'station') then
    alter table production_tasks add column station text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'production_tasks' and column_name = 'priority') then
    alter table production_tasks add column priority int;
  end if;
end $$;

create or replace function update_production_task_status(p_task_id uuid, p_status task_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_current task_status;
begin
  select org_id, status into v_org, v_current from production_tasks where id = p_task_id;
  if v_org is null then
    raise exception 'task not found';
  end if;

  if v_org <> current_org_id() then
    raise exception 'access denied';
  end if;

  if v_current = p_status then
    return;
  end if;

  if v_current = 'draft' and p_status in ('in_progress', 'done') then
    update production_tasks set status = p_status where id = p_task_id;
    return;
  end if;

  if v_current = 'in_progress' and p_status = 'done' then
    update production_tasks set status = p_status where id = p_task_id;
    return;
  end if;

  raise exception 'invalid status transition';
end;
$$;

grant execute on function update_production_task_status(uuid, task_status) to authenticated;

-- shortages RPC: simple count of shifts per day; shortage = greatest(min_required - count, 0)
create or replace function get_staff_shortages(p_start date default current_date, p_end date default current_date + 7)
returns table(day date, shortage int)
language plpgsql
security definer
set search_path = public
as $$
declare
  min_required int := 1;
begin
  return query
  select d::date as day,
         greatest(min_required - coalesce(count(s.id), 0), 0) as shortage
  from generate_series(p_start, p_end, interval '1 day') d
  left join shifts s
    on s.org_id = current_org_id()
   and s.starts_at::date = d::date
   and s.status = 'scheduled'
  group by d
  order by d;
end;
$$;

grant execute on function get_staff_shortages(date, date) to authenticated;

-- RLS
alter table shifts enable row level security;
alter table time_off enable row level security;
alter table production_tasks enable row level security;

drop policy if exists "shifts read" on shifts;
create policy "shifts read" on shifts
  for select using (org_id = current_org_id());

drop policy if exists "shifts manage" on shifts;
create policy "shifts manage" on shifts
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner') or is_member('chef') or is_member('kitchen')))
  with check (is_member('admin') or is_member('planner') or is_member('chef') or is_member('kitchen'));

drop policy if exists "time off read" on time_off;
create policy "time off read" on time_off
  for select using (org_id = current_org_id());

drop policy if exists "time off manage" on time_off;
create policy "time off manage" on time_off
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner') or is_member('chef') or is_member('kitchen')))
  with check (is_member('admin') or is_member('planner') or is_member('chef') or is_member('kitchen'));

drop policy if exists "production tasks read" on production_tasks;
create policy "production tasks read" on production_tasks
  for select using (org_id = current_org_id());

drop policy if exists "production tasks manage" on production_tasks;
create policy "production tasks manage" on production_tasks
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('chef') or is_member('kitchen')))
  with check (is_member('admin') or is_member('chef') or is_member('kitchen'));
