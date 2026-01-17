-- Sprint 05: Inventory MVP (locations, batches, expiry rules/alerts)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'expiry_severity') then
    create type expiry_severity as enum ('warning', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'expiry_status') then
    create type expiry_status as enum ('open', 'dismissed');
  end if;
end $$;

create table if not exists inventory_locations (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  hotel_id uuid references hotels(id) not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists stock_batches (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  location_id uuid references inventory_locations(id) not null,
  supplier_item_id uuid references supplier_items(id) not null,
  qty_on_hand numeric not null,
  expires_at timestamptz,
  source text,
  created_at timestamptz default now()
);

create table if not exists expiry_rules (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  threshold_days int not null,
  severity expiry_severity not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists expiry_alerts (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  batch_id uuid references stock_batches(id) not null,
  rule_id uuid references expiry_rules(id) not null,
  severity expiry_severity not null,
  status expiry_status default 'open',
  dedupe_key text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists expiry_alerts_dedupe_key_idx on expiry_alerts (dedupe_key);
create index if not exists stock_batches_expiry_idx on stock_batches (org_id, expires_at);
create index if not exists expiry_alerts_status_idx on expiry_alerts (org_id, status);

create or replace function set_expiry_alert_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_expiry_alerts_updated_at on expiry_alerts;
create trigger trg_expiry_alerts_updated_at
before update on expiry_alerts
for each row
execute function set_expiry_alert_updated_at();

create or replace function generate_expiry_alerts(p_reference timestamptz default now())
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_inserted int := 0;
begin
  if not (is_member('admin') or is_member('purchasing')) then
    raise exception 'not authorized to generate alerts';
  end if;

  v_org_id := current_org_id();

  with rules as (
    select id, threshold_days, severity
    from expiry_rules
    where org_id = v_org_id
      and is_active
  ),
  batches as (
    select id, expires_at
    from stock_batches
    where org_id = v_org_id
      and expires_at is not null
  ),
  candidates as (
    select
      b.id as batch_id,
      r.id as rule_id,
      r.severity,
      format('%s:%s:%s', b.id, r.id, to_char(b.expires_at::date, 'YYYYMMDD')) as dedupe_key
    from batches b
    join rules r on b.expires_at <= (p_reference + make_interval(days => r.threshold_days))
  )
  insert into expiry_alerts (id, org_id, batch_id, rule_id, severity, status, dedupe_key)
  select gen_random_uuid(), v_org_id, batch_id, rule_id, severity, 'open', dedupe_key
  from candidates
  on conflict (dedupe_key)
  do update set status = 'open', severity = excluded.severity, updated_at = now();

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

grant execute on function generate_expiry_alerts(timestamptz) to authenticated;

alter table inventory_locations enable row level security;
alter table stock_batches enable row level security;
alter table expiry_rules enable row level security;
alter table expiry_alerts enable row level security;

drop policy if exists "inventory locations org" on inventory_locations;
create policy "inventory locations org" on inventory_locations for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "stock batches org" on stock_batches;
create policy "stock batches org" on stock_batches for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "expiry rules org" on expiry_rules;
create policy "expiry rules org" on expiry_rules for all using (
  org_id = current_org_id()
) with check (
  is_member('admin')
);

drop policy if exists "expiry alerts read" on expiry_alerts;
create policy "expiry alerts read" on expiry_alerts for select using (
  org_id = current_org_id()
    and (is_member('admin') or is_member('purchasing') or is_member('chef') or is_member('kitchen'))
);

drop policy if exists "expiry alerts manage" on expiry_alerts;
create policy "expiry alerts manage" on expiry_alerts for update using (
  org_id = current_org_id()
    and (is_member('admin') or is_member('chef') or is_member('kitchen'))
) with check (
  org_id = current_org_id()
    and (is_member('admin') or is_member('chef') or is_member('kitchen'))
);

