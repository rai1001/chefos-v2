-- Sprint 06: stock levels, reservations, barcodes

do $$
begin
  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type reservation_status as enum ('active', 'cancelled');
  end if;
end $$;

create table if not exists stock_levels (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  location_id uuid references inventory_locations(id) not null,
  supplier_item_id uuid references supplier_items(id) not null,
  on_hand numeric not null default 0,
  available_on_hand numeric not null default 0,
  consider_reservations boolean not null default true,
  created_at timestamptz default now(),
  unique (org_id, supplier_item_id)
);

create table if not exists stock_reservations (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  event_id uuid references events(id) not null,
  event_service_id uuid references event_services(id),
  supplier_item_id uuid references supplier_items(id) not null,
  qty_reserved numeric not null check (qty_reserved > 0),
  status reservation_status not null default 'active',
  created_at timestamptz default now()
);

create table if not exists product_barcodes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  barcode text not null,
  supplier_item_id uuid references supplier_items(id) not null,
  created_at timestamptz default now(),
  unique (org_id, barcode)
);

create index if not exists stock_levels_org_item_idx
  on stock_levels (org_id, supplier_item_id);
create index if not exists stock_reservations_org_item_status_idx
  on stock_reservations (org_id, supplier_item_id, status);

create or replace function recalc_available_on_hand(p_org_id uuid, p_supplier_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reserved numeric;
begin
  select coalesce(sum(qty_reserved), 0)
    into v_reserved
  from stock_reservations
  where org_id = p_org_id
    and supplier_item_id = p_supplier_item_id
    and status = 'active';

  update stock_levels
  set available_on_hand = case
    when consider_reservations then greatest(on_hand - v_reserved, 0)
    else on_hand
  end
  where org_id = p_org_id
    and supplier_item_id = p_supplier_item_id;
end;
$$;

create or replace function trg_recalc_available_on_hand()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform recalc_available_on_hand(old.org_id, old.supplier_item_id);
    return old;
  end if;

  perform recalc_available_on_hand(new.org_id, new.supplier_item_id);
  return new;
end;
$$;

drop trigger if exists trg_recalc_available_on_hand on stock_reservations;
create trigger trg_recalc_available_on_hand
after insert or update or delete on stock_reservations
for each row
execute function trg_recalc_available_on_hand();

create or replace function trg_sync_stock_levels()
returns trigger
language plpgsql
as $$
begin
  perform recalc_available_on_hand(new.org_id, new.supplier_item_id);
  return new;
end;
$$;

drop trigger if exists trg_sync_stock_levels on stock_levels;
create trigger trg_sync_stock_levels
after insert or update of on_hand, consider_reservations on stock_levels
for each row
execute function trg_sync_stock_levels();

alter table stock_levels enable row level security;
alter table stock_reservations enable row level security;
alter table product_barcodes enable row level security;

drop policy if exists "stock levels org read" on stock_levels;
create policy "stock levels org read" on stock_levels
  for select
  using (org_id = current_org_id());

drop policy if exists "stock levels manage" on stock_levels;
create policy "stock levels manage" on stock_levels
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('purchasing')))
  with check (is_member('admin') or is_member('purchasing'));

drop policy if exists "stock reservations org read" on stock_reservations;
create policy "stock reservations org read" on stock_reservations
  for select
  using (org_id = current_org_id());

drop policy if exists "stock reservations manage" on stock_reservations;
create policy "stock reservations manage" on stock_reservations
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('chef') or is_member('kitchen')))
  with check (is_member('admin') or is_member('chef') or is_member('kitchen'));

drop policy if exists "product barcodes org read" on product_barcodes;
create policy "product barcodes org read" on product_barcodes
  for select
  using (org_id = current_org_id());

drop policy if exists "product barcodes manage" on product_barcodes;
create policy "product barcodes manage" on product_barcodes
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('purchasing')))
  with check (is_member('admin') or is_member('purchasing'));
