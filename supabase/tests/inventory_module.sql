begin;

select plan(6);

reset role;

insert into orgs (id, name, slug)
values
  ('aaaaaaaa-1111-1111-1111-111111111111', 'Org Inventario', 'org-inv'),
  ('bbbbbbbb-1111-1111-1111-111111111111', 'Org Ajena', 'org-ajena')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values
  ('aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', 'Hotel Inventario')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-3333-3333-3333-333333333333', 'admin', true),
  ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-4444-4444-4444-444444444444', 'chef', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into suppliers (id, org_id, name)
values ('aaaaaaaa-5555-5555-5555-555555555555', 'aaaaaaaa-1111-1111-1111-111111111111', 'Proveedor Inventario')
on conflict (id) do nothing;

insert into supplier_items (id, org_id, supplier_id, name, purchase_unit, pack_size, unit_price)
values ('aaaaaaaa-6666-6666-6666-666666666666', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-5555-5555-5555-555555555555', 'Item Inventario', 'kg', 1, 2.5)
on conflict (id) do nothing;

insert into inventory_locations (id, org_id, hotel_id, name, is_default)
values
  ('aaaaaaaa-7777-7777-7777-777777777777', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'Location A', true),
  ('aaaaaaaa-8888-8888-8888-888888888888', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'Location B', false)
on conflict (id) do nothing;

insert into stock_batches (id, org_id, location_id, supplier_item_id, qty_on_hand, expires_at, source)
values
  ('aaaaaaaa-9999-9999-9999-999999999991', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-7777-7777-7777-777777777777', 'aaaaaaaa-6666-6666-6666-666666666666', 5, now() + interval '2 days', 'purchase'),
  ('aaaaaaaa-9999-9999-9999-999999999992', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-7777-7777-7777-777777777777', 'aaaaaaaa-6666-6666-6666-666666666666', 5, now() + interval '5 days', 'purchase'),
  ('aaaaaaaa-9999-9999-9999-999999999993', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-8888-8888-8888-888888888888', 'aaaaaaaa-6666-6666-6666-666666666666', 5, null, 'prep')
on conflict (id) do nothing;

insert into expiry_rules (id, org_id, threshold_days, severity, is_active)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-1111-1111-1111-111111111111', 7, 'warning', true)
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-3333-3333-3333-333333333333', true);

select is(
  (select array_agg(id order by expires_at asc nulls last) from stock_batches)::text,
  array['aaaaaaaa-9999-9999-9999-999999999991','aaaaaaaa-9999-9999-9999-999999999992','aaaaaaaa-9999-9999-9999-999999999993']::text,
  'FEFO ordering uses expires_at asc with nulls last'
);

select is((select generate_expiry_alerts())::int, 2, 'alert generation creates expected alerts');
select ok((select generate_expiry_alerts()) >= 0, 'alert generation idempotent');
select is((select count(*) from expiry_alerts)::int, 2, 'dedupe prevents duplicates');

select set_config('request.jwt.claim.sub', 'aaaaaaaa-4444-4444-4444-444444444444', true);
select lives_ok($$
  update expiry_alerts
  set status = 'dismissed'
  where org_id = 'aaaaaaaa-1111-1111-1111-111111111111'
$$, 'chef can dismiss alerts');

select set_config('request.jwt.claim.sub', 'bbbbbbbb-3333-3333-3333-333333333333', true);
select is((select count(*) from stock_batches)::int, 0, 'other org sees no batches');

reset role;

select * from finish();
rollback;
