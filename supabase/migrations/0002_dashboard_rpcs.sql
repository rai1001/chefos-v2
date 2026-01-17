-- Dashboard RPCs for Sprint 02
create or replace function dashboard_rolling_grid()
returns table (
  day date,
  events_count int
)
language sql
security definer
set search_path = public
set row_security = on
as $$
  with active_org as (
    select current_org_id() as org_id
  )
  select
    day::date,
    count(e.id)::int as events_count
  from active_org
  join generate_series(current_date, current_date + interval '6 days', interval '1 day') as day
    on active_org.org_id is not null
  left join events e
    on e.org_id = active_org.org_id
    and e.starts_at::date = day::date
  group by day
  order by day;
$$;

create or replace function dashboard_event_highlights()
returns table (
  event_id uuid,
  title text,
  starts_at timestamptz,
  status text,
  hotel_name text
)
language sql
security definer
set search_path = public
set row_security = on
as $$
  select
    e.id as event_id,
    e.title,
    e.starts_at,
    e.status::text as status,
    h.name as hotel_name
  from events e
  join hotels h on h.id = e.hotel_id
  where e.org_id = current_org_id()
    and e.starts_at >= now() - interval '1 day'
  order by e.starts_at asc
  limit 8;
$$;

grant execute on function dashboard_rolling_grid() to authenticated;
grant execute on function dashboard_event_highlights() to authenticated;
