begin;

select plan(7);

reset role;

insert into orgs (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'ChefOS Owners', 'chefos')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Hotel Central')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin', true),
  ('11111111-1111-1111-1111-111111111111', '99999999-0000-0000-0000-000000000099', 'purchasing', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into suppliers (id, org_id, name)
values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Proveedor Test')
on conflict (id) do nothing;

insert into supplier_items (id, org_id, supplier_id, name, purchase_unit, pack_size, unit_price)
values ('aaaaaaaa-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'Item Test', 'kg', 5, 4.5)
on conflict (id) do nothing;

insert into purchase_orders (id, org_id, hotel_id, supplier_id, status)
values ('aaaaaaaa-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 'approved')
on conflict (id) do nothing;

set role authenticated;

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select lives_ok($$
  insert into purchase_order_lines (id, org_id, purchase_order_id, supplier_item_id, requested_qty, rounding_rule, pack_size)
  values ('aaaaaaaa-0000-0000-0000-000000000201', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000101',
          'aaaaaaaa-0000-0000-0000-000000000011', 2, 'ceil_pack', 5)
$$, 'purchasing can insert lines');

select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select throws_ok($$
  insert into suppliers (id, org_id, name)
  values ('aaaaaaaa-0000-0000-0000-000000000099', '11111111-1111-1111-1111-111111111111', 'Proveedor Viewer')
$$, '42501');

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select throws_ok($$
  insert into purchase_order_lines (id, org_id, purchase_order_id, supplier_item_id, requested_qty, rounding_rule, pack_size)
  values ('aaaaaaaa-0000-0000-0000-000000000202', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000101',
          'aaaaaaaa-0000-0000-0000-000000000011', 2, 'ceil_pack', 0)
$$, 'pack_size must be > 0 when rounding_rule=ceil_pack', 'pack size constraint');

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select lives_ok($$
  select receive_purchase_order('aaaaaaaa-0000-0000-0000-000000000101')
$$, 'purchasing can receive approved order');

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select throws_ok($$
  select receive_purchase_order('aaaaaaaa-0000-0000-0000-000000000101')
$$, 'invalid status transition', 'cannot receive twice');

insert into purchase_orders (id, org_id, hotel_id, supplier_id, status)
values ('aaaaaaaa-0000-0000-0000-000000000102', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-0000-0000-0000-000000000001', 'draft')
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select throws_ok($$
  update purchase_orders set status = 'received' where id = 'aaaaaaaa-0000-0000-0000-000000000102'
$$, 'invalid status transition', 'cannot skip to received');

select set_config('request.jwt.claim.sub', '99999999-0000-0000-0000-000000000099', true);
select throws_ok($$
  select receive_purchase_order('bbbbbbbb-0000-0000-0000-000000000101')
$$, 'purchase order not found', 'invalid order id');

reset role;

select * from finish();
rollback;
