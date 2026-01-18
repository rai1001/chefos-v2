begin;

select plan(6);

reset role;

insert into orgs (id, name, slug)
values
  ('cccccccc-1111-1111-1111-111111111111', 'Org Reservas', 'org-reservas'),
  ('dddddddd-1111-1111-1111-111111111111', 'Org Barcode', 'org-barcode')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values
  ('cccccccc-2222-2222-2222-222222222222', 'cccccccc-1111-1111-1111-111111111111', 'Hotel Reservas')
on conflict (id) do nothing;

insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values (
  'cccccccc-3333-3333-3333-333333333333',
  'cccccccc-1111-1111-1111-111111111111',
  'cccccccc-2222-2222-2222-222222222222',
  'Evento Reservas',
  now() + interval '1 day',
  now() + interval '1 day' + interval '2 hours',
  'confirmed'
)
on conflict (id) do nothing;

insert into event_services (id, org_id, event_id, service_type, format)
values (
  'cccccccc-4444-4444-4444-444444444444',
  'cccccccc-1111-1111-1111-111111111111',
  'cccccccc-3333-3333-3333-333333333333',
  'coffee_break',
  'de_pie'
)
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('cccccccc-1111-1111-1111-111111111111', 'cccccccc-9999-9999-9999-999999999999', 'admin', true),
  ('dddddddd-1111-1111-1111-111111111111', 'dddddddd-9999-9999-9999-999999999999', 'admin', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into suppliers (id, org_id, name)
values
  ('cccccccc-5555-5555-5555-555555555555', 'cccccccc-1111-1111-1111-111111111111', 'Proveedor Reservas'),
  ('dddddddd-5555-5555-5555-555555555555', 'dddddddd-1111-1111-1111-111111111111', 'Proveedor Barcode')
on conflict (id) do nothing;

insert into supplier_items (id, org_id, supplier_id, name, purchase_unit, pack_size, unit_price)
values
  ('cccccccc-6666-6666-6666-666666666666', 'cccccccc-1111-1111-1111-111111111111', 'cccccccc-5555-5555-5555-555555555555', 'Item Reserva', 'kg', 1, 2.5),
  ('dddddddd-6666-6666-6666-666666666666', 'dddddddd-1111-1111-1111-111111111111', 'dddddddd-5555-5555-5555-555555555555', 'Item Barcode', 'kg', 1, 2.5)
on conflict (id) do nothing;

insert into inventory_locations (id, org_id, hotel_id, name, is_default)
values
  ('cccccccc-7777-7777-7777-777777777777', 'cccccccc-1111-1111-1111-111111111111', 'cccccccc-2222-2222-2222-222222222222', 'Almacen Reservas', true)
on conflict (id) do nothing;

insert into stock_levels (id, org_id, location_id, supplier_item_id, on_hand, available_on_hand, consider_reservations)
values
  ('cccccccc-8888-8888-8888-888888888888', 'cccccccc-1111-1111-1111-111111111111', 'cccccccc-7777-7777-7777-777777777777', 'cccccccc-6666-6666-6666-666666666666', 10, 10, true)
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', 'cccccccc-9999-9999-9999-999999999999', true);

insert into stock_reservations (id, org_id, event_id, event_service_id, supplier_item_id, qty_reserved, status)
values (
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-1111-1111-1111-111111111111',
  'cccccccc-3333-3333-3333-333333333333',
  'cccccccc-4444-4444-4444-444444444444',
  'cccccccc-6666-6666-6666-666666666666',
  3,
  'active'
);

select is(
  (select available_on_hand from stock_levels where id = 'cccccccc-8888-8888-8888-888888888888')::numeric,
  7::numeric,
  'available_on_hand descuenta reservas activas'
);

update stock_reservations
set status = 'cancelled'
where id = 'cccccccc-0000-0000-0000-000000000001';

select is(
  (select available_on_hand from stock_levels where id = 'cccccccc-8888-8888-8888-888888888888')::numeric,
  10::numeric,
  'cancelar reservas restaura disponible'
);

update stock_levels
set consider_reservations = false
where id = 'cccccccc-8888-8888-8888-888888888888';

update stock_reservations
set status = 'active'
where id = 'cccccccc-0000-0000-0000-000000000001';

select is(
  (select available_on_hand from stock_levels where id = 'cccccccc-8888-8888-8888-888888888888')::numeric,
  10::numeric,
  'consider_reservations=false ignora reservas'
);

insert into product_barcodes (id, org_id, barcode, supplier_item_id)
values (
  'cccccccc-0000-0000-0000-000000000010',
  'cccccccc-1111-1111-1111-111111111111',
  '5601234567890',
  'cccccccc-6666-6666-6666-666666666666'
);

select throws_ok($$
  insert into product_barcodes (id, org_id, barcode, supplier_item_id)
  values (
    'cccccccc-0000-0000-0000-000000000011',
    'cccccccc-1111-1111-1111-111111111111',
    '5601234567890',
    'cccccccc-6666-6666-6666-666666666666'
  )
$$, '23505', 'duplicate key value violates unique constraint "product_barcodes_org_id_barcode_key"', 'barcode unico por org');

select set_config('request.jwt.claim.sub', 'dddddddd-9999-9999-9999-999999999999', true);
select lives_ok($$
  insert into product_barcodes (id, org_id, barcode, supplier_item_id)
  values (
    'dddddddd-0000-0000-0000-000000000010',
    'dddddddd-1111-1111-1111-111111111111',
    '5601234567890',
    'dddddddd-6666-6666-6666-666666666666'
  )
$$, 'barcode repetido permitido en otra org');

select is((select count(*) from stock_reservations)::int, 0, 'otra org no ve reservas');

reset role;

select * from finish();
rollback;
