-- Sprint 03: events/spaces/services constraints and triggers

create or replace function is_member(role text) returns boolean
language sql stable security definer
set row_security = off
as $$
  select exists (
    select 1
    from org_members
    where org_id = current_org_id()
      and user_id = auth.uid()
      and org_members.role = $1
      and is_active
    limit 1
  );
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_starts_before_ends'
  ) then
    alter table events
      add constraint events_starts_before_ends
      check (starts_at < ends_at);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'space_bookings_starts_before_ends'
  ) then
    alter table space_bookings
      add constraint space_bookings_starts_before_ends
      check (starts_at < ends_at);
  end if;
end $$;

create or replace function validate_hotel_org(p_org_id uuid, p_hotel_id uuid)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from hotels
    where id = p_hotel_id
      and org_id = p_org_id
  ) then
    raise exception 'hotel does not belong to org';
  end if;
end;
$$;

create or replace function validate_event_org_hotel()
returns trigger
language plpgsql
as $$
begin
  perform validate_hotel_org(new.org_id, new.hotel_id);
  return new;
end;
$$;

create or replace function validate_space_org_hotel()
returns trigger
language plpgsql
as $$
begin
  perform validate_hotel_org(new.org_id, new.hotel_id);
  return new;
end;
$$;

create or replace function validate_event_service_org()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from events
    where id = new.event_id
      and org_id = new.org_id
  ) then
    raise exception 'event does not belong to org';
  end if;
  return new;
end;
$$;

create or replace function space_booking_overlaps(
  p_space_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_id uuid default null
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from space_bookings b
    where b.space_id = p_space_id
      and (p_booking_id is null or b.id <> p_booking_id)
      and b.starts_at < p_ends_at
      and b.ends_at > p_starts_at
  );
$$;

create or replace function validate_space_booking()
returns trigger
language plpgsql
as $$
declare
  event_org uuid;
  event_hotel uuid;
  space_org uuid;
  space_hotel uuid;
begin
  select org_id, hotel_id into event_org, event_hotel
  from events
  where id = new.event_id;

  select org_id, hotel_id into space_org, space_hotel
  from spaces
  where id = new.space_id;

  if event_org is null or space_org is null then
    raise exception 'event or space not found';
  end if;

  if event_org <> new.org_id or space_org <> new.org_id then
    raise exception 'space booking org mismatch';
  end if;

  if event_hotel <> space_hotel then
    raise exception 'event and space hotel mismatch';
  end if;

  if space_booking_overlaps(new.space_id, new.starts_at, new.ends_at, new.id) then
    raise exception 'space booking overlaps existing booking';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_event_org_hotel on events;
create trigger trg_validate_event_org_hotel
before insert or update on events
for each row
execute function validate_event_org_hotel();

drop trigger if exists trg_validate_space_org_hotel on spaces;
create trigger trg_validate_space_org_hotel
before insert or update on spaces
for each row
execute function validate_space_org_hotel();

drop trigger if exists trg_validate_event_service_org on event_services;
create trigger trg_validate_event_service_org
before insert or update on event_services
for each row
execute function validate_event_service_org();

drop trigger if exists trg_validate_space_booking on space_bookings;
create trigger trg_validate_space_booking
before insert or update on space_bookings
for each row
execute function validate_space_booking();

drop policy if exists "events org" on events;
create policy "events org" on events for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('planner')
);

drop policy if exists "spaces org" on spaces;
create policy "spaces org" on spaces for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('planner')
);

drop policy if exists "space bookings org" on space_bookings;
create policy "space bookings org" on space_bookings for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('planner')
);

drop policy if exists "event services org" on event_services;
create policy "event services org" on event_services for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('planner')
);
