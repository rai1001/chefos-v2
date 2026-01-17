begin;

select plan(7);

reset role;

insert into orgs (id, name, slug)
values
  ('11111111-1111-1111-1111-111111111111', 'ChefOS Owners', 'chefos'),
  ('44444444-4444-4444-4444-444444444444', 'ChefOS Other', 'chefos-other')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Hotel Central'),
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Hotel Lateral')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'admin', true),
  ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'viewer', false)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

set role anon;

-- ensure current_org_id works for seeded admin
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select is(current_org_id()::text, '11111111-1111-1111-1111-111111111111', 'current_org_id returned seeded org');
select ok(is_member('admin'), 'admin membership resolves');

-- other user has no membership
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select is(current_org_id(), null, 'unknown user has no org');

-- user with inactive membership still blocked
select ok(not is_member('viewer'), 'inactive membership is not considered a member');
select is(current_org_id(), null, 'inactive membership does not expose org');

-- admin sees baseline hotel but not other org hotel
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select is((select count(*) from hotels where org_id = '11111111-1111-1111-1111-111111111111')::int, 1, 'admin can read own hotel');
select is((select count(*) from hotels where org_id = '44444444-4444-4444-4444-444444444444')::int, 0, 'admin cannot read hotel from other org');

reset role;

select * from finish();
rollback;
