insert into orgs (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'ChefOS Owners', 'chefos')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Hotel Central')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'viewer', false)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'planner', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '99999999-0000-0000-0000-000000000099', 'purchasing', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into orgs (id, name, slug)
values ('44444444-4444-4444-4444-444444444444', 'ChefOS Other', 'chefos-other')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Hotel Lateral')
on conflict (id) do nothing;

insert into spaces (id, org_id, hotel_id, name)
values
  ('66666666-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Salon Azul'),
  ('66666666-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Terraza Norte')
on conflict (id) do nothing;

insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values (
  '66666666-0000-0000-0000-000000000010',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Demo apertura',
  now() + interval '2 days',
  now() + interval '2 days' + interval '2 hours',
  'confirmed'
)
on conflict (id) do nothing;

insert into event_services (id, org_id, event_id, service_type, format)
values (
  '66666666-0000-0000-0000-000000000020',
  '11111111-1111-1111-1111-111111111111',
  '66666666-0000-0000-0000-000000000010',
  'coffee_break',
  'de_pie'
)
on conflict (id) do nothing;

insert into suppliers (id, org_id, name, contact_email, contact_phone)
values
  ('77777777-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Proveedor Norte', 'norte@proveedor.test', '+34 900 111 222')
on conflict (id) do nothing;

insert into supplier_items (id, org_id, supplier_id, name, purchase_unit, pack_size, unit_price)
values
  ('77777777-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000001', 'Harina 00', 'kg', 10, 12.5),
  ('77777777-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000001', 'Leche entera', 'l', 6, 8.4),
  ('77777777-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000001', 'Huevos camperos', 'docena', 1, 3.2)
on conflict (id) do nothing;

insert into purchase_orders (id, org_id, hotel_id, supplier_id, status, total_estimated)
values (
  '77777777-0000-0000-0000-000000000101',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '77777777-0000-0000-0000-000000000001',
  'draft',
  96.5
)
on conflict (id) do nothing;

insert into purchase_order_lines (id, org_id, purchase_order_id, supplier_item_id, requested_qty, unit_price, rounding_rule, pack_size)
values
  ('77777777-0000-0000-0000-000000000201', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000101', '77777777-0000-0000-0000-000000000011', 2, 12.5, 'ceil_pack', 10),
  ('77777777-0000-0000-0000-000000000202', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000101', '77777777-0000-0000-0000-000000000012', 3, 8.4, 'none', null),
  ('77777777-0000-0000-0000-000000000203', '11111111-1111-1111-1111-111111111111', '77777777-0000-0000-0000-000000000101', '77777777-0000-0000-0000-000000000013', 1, 3.2, 'none', null)
on conflict (id) do nothing;

insert into inventory_locations (id, org_id, hotel_id, name, is_default)
values
  ('88888888-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Almacen Central', true),
  ('88888888-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Camara Fria', false)
on conflict (id) do nothing;

insert into stock_batches (id, org_id, location_id, supplier_item_id, qty_on_hand, expires_at, source)
values
  ('88888888-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', '88888888-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000011', 20, now() + interval '5 days', 'purchase'),
  ('88888888-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', '88888888-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000012', 10, now() + interval '15 days', 'purchase'),
  ('88888888-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', '88888888-0000-0000-0000-000000000002', '77777777-0000-0000-0000-000000000013', 6, now() + interval '2 days', 'purchase'),
  ('88888888-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', '88888888-0000-0000-0000-000000000002', '77777777-0000-0000-0000-000000000013', 4, null, 'prep')
on conflict (id) do nothing;

insert into expiry_rules (id, org_id, threshold_days, severity, is_active)
values ('88888888-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 7, 'warning', true)
on conflict (id) do nothing;
