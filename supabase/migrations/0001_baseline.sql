-- baseline schema
create table orgs (
  id uuid primary key,
  name text not null,
  slug text unique not null
);
create table org_members (
  org_id uuid references orgs(id),
  user_id uuid,
  role text not null,
  is_active boolean default true,
  primary key (org_id, user_id)
);
create table hotels (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  name text not null
);
create type event_status as enum ('draft', 'confirmed', 'cancelled');
create table events (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status event_status default 'draft'
);
create table spaces (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  name text not null
);
create table space_bookings (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  event_id uuid references events(id) not null,
  space_id uuid references spaces(id) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);
create type service_type as enum('coffee_break', 'dinner', 'production');
create type service_format as enum('de_pie', 'sentado');
create table event_services (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  event_id uuid references events(id) not null,
  service_type service_type not null,
  format service_format not null
);
create type production_status as enum('draft', 'in_progress', 'done');
create table production_plans (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  event_service_id uuid references event_services(id) not null,
  status production_status default 'draft'
);
create table production_tasks (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  plan_id uuid references production_plans(id) not null,
  title text not null,
  station text,
  priority int
);
create table products (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  name text not null,
  unit text not null
);
create type purchase_status as enum('draft', 'approved', 'ordered', 'received');
create table purchase_orders (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  supplier_id uuid,
  status purchase_status default 'draft',
  total_estimated numeric
);
create table event_purchase_orders (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  event_id uuid references events(id) not null,
  status purchase_status default 'draft'
);

-- helper functions
create or replace function current_org_id() returns uuid
language sql stable security definer
set row_security = off
as $$
  select org_id
  from org_members
  where user_id = auth.uid()
    and is_active
  limit 1;
$$;

create or replace function is_member(role text) returns boolean
language sql stable security definer
set row_security = off
as $$
  select exists (
    select 1
    from org_members
    where org_id = current_org_id()
      and user_id = auth.uid()
      and role = role
      and is_active
    limit 1
  );
$$;

-- RLS policies
alter table orgs enable row level security;
create policy "own org" on orgs for select using (
  id = current_org_id()
  or is_member('admin')
);
create policy "admin manage org" on orgs for all using (
  is_member('admin')
) with check (
  is_member('admin')
);

alter table org_members enable row level security;
create policy "org member select" on org_members for select using (
  org_id = current_org_id()
);
create policy "admin manage members" on org_members for all using (
  is_member('admin')
) with check (
  is_member('admin')
);

alter table hotels enable row level security;
create policy "hotels org" on hotels for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table events enable row level security;
create policy "events org" on events for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table spaces enable row level security;
create policy "spaces org" on spaces for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table space_bookings enable row level security;
create policy "space bookings org" on space_bookings for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table event_services enable row level security;
create policy "event services org" on event_services for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table production_plans enable row level security;
create policy "production plans org" on production_plans for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table production_tasks enable row level security;
create policy "production tasks org" on production_tasks for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table products enable row level security;
create policy "products org" on products for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table purchase_orders enable row level security;
create policy "purchase orders org" on purchase_orders for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

alter table event_purchase_orders enable row level security;
create policy "event purchase orders org" on event_purchase_orders for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);
