-- Sprint 04: Purchasing core tables and RPC

do $$
begin
  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type purchase_status as enum ('draft', 'approved', 'ordered', 'received');
  end if;
  if not exists (select 1 from pg_type where typname = 'rounding_rule') then
    create type rounding_rule as enum ('none', 'ceil_unit', 'ceil_pack');
  end if;
end $$;

create table if not exists suppliers (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  name text not null,
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);

create table if not exists supplier_items (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  supplier_id uuid references suppliers(id) not null,
  name text not null,
  purchase_unit text not null,
  pack_size numeric,
  unit_price numeric,
  created_at timestamptz default now()
);

create table if not exists purchase_order_lines (
  id uuid primary key,
  org_id uuid references orgs(id) not null,
  purchase_order_id uuid references purchase_orders(id) not null,
  supplier_item_id uuid references supplier_items(id) not null,
  requested_qty numeric not null,
  received_qty numeric default 0,
  unit_price numeric,
  rounding_rule rounding_rule default 'none',
  pack_size numeric,
  created_at timestamptz default now()
);

create or replace function validate_rounding_pack()
returns trigger
language plpgsql
as $$
begin
  if new.rounding_rule = 'ceil_pack' and (new.pack_size is null or new.pack_size <= 0) then
    raise exception 'pack_size must be > 0 when rounding_rule=ceil_pack';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_rounding_pack on purchase_order_lines;
create trigger trg_validate_rounding_pack
before insert or update on purchase_order_lines
for each row
execute function validate_rounding_pack();

create or replace function validate_purchase_order_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'draft' and new.status in ('approved') then
    return new;
  end if;

  if old.status = 'approved' and new.status in ('ordered', 'received') then
    return new;
  end if;

  if old.status = 'ordered' and new.status in ('received') then
    return new;
  end if;

  raise exception 'invalid status transition';
end;
$$;

drop trigger if exists trg_validate_purchase_order_status on purchase_orders;
create trigger trg_validate_purchase_order_status
before update on purchase_orders
for each row
execute function validate_purchase_order_status();

create or replace function receive_purchase_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status purchase_status;
begin
  select status into v_status
  from purchase_orders
  where id = p_order_id
    and org_id = current_org_id();

  if v_status is null then
    raise exception 'purchase order not found';
  end if;

  if v_status not in ('approved', 'ordered') then
    raise exception 'invalid status transition';
  end if;

  update purchase_orders
  set status = 'received'
  where id = p_order_id
    and org_id = current_org_id();
end;
$$;

grant execute on function receive_purchase_order(uuid) to authenticated;

alter table suppliers enable row level security;
alter table supplier_items enable row level security;
alter table purchase_order_lines enable row level security;

drop policy if exists "suppliers org" on suppliers;
create policy "suppliers org" on suppliers for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "supplier items org" on supplier_items;
create policy "supplier items org" on supplier_items for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "purchase order lines org" on purchase_order_lines;
create policy "purchase order lines org" on purchase_order_lines for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "purchase orders org" on purchase_orders;
create policy "purchase orders org" on purchase_orders for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);

drop policy if exists "event purchase orders org" on event_purchase_orders;
create policy "event purchase orders org" on event_purchase_orders for all using (
  org_id = current_org_id()
) with check (
  is_member('admin') or is_member('purchasing')
);
