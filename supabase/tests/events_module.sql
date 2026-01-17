begin;

select plan(6);

reset role;

insert into spaces (id, org_id, hotel_id, name)
values ('88888888-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Salon Test')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'viewer', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

set role authenticated;

select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select lives_ok($$
  insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
  values ('88888888-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
          'Evento Admin', now() + interval '3 days', now() + interval '3 days' + interval '1 hour', 'draft')
$$, 'admin can insert event');

select set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);
select lives_ok($$
  insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
  values ('88888888-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
          'Evento Planner', now() + interval '4 days', now() + interval '4 days' + interval '1 hour', 'draft')
$$, 'planner can insert event');

select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select throws_ok($$
  insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
  values ('88888888-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
          'Evento Viewer', now() + interval '5 days', now() + interval '5 days' + interval '1 hour', 'draft')
$$, '42501');

select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select throws_ok($$
  insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
  values ('88888888-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555',
          'Evento Mal Hotel', now() + interval '6 days', now() + interval '6 days' + interval '1 hour', 'draft')
$$, 'hotel does not belong to org', 'reject mismatched hotel org');

select lives_ok($$
  insert into space_bookings (id, org_id, event_id, space_id, starts_at, ends_at)
  values ('88888888-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111',
          '88888888-0000-0000-0000-000000000010', '88888888-0000-0000-0000-000000000001',
          '2026-02-01 10:00:00+00', '2026-02-01 12:00:00+00')
$$, 'admin can create space booking');

select throws_ok($$
  insert into space_bookings (id, org_id, event_id, space_id, starts_at, ends_at)
  values ('88888888-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111',
          '88888888-0000-0000-0000-000000000011', '88888888-0000-0000-0000-000000000001',
          '2026-02-01 11:00:00+00', '2026-02-01 13:00:00+00')
$$, 'space booking overlaps existing booking', 'reject overlapping booking');

reset role;

select * from finish();
rollback;
