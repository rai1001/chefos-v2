begin;

select plan(5);

reset role;

insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'Evento ChefOS', now() + interval '1 day', now() + interval '1 day' + interval '2 hours', 'confirmed'),
  ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555',
   'Evento externo', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 'draft')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values ('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'viewer', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

set role authenticated;

select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select is((select count(*) from dashboard_event_highlights())::int, 1, 'admin sees highlights for own org');
select is((select count(*) from dashboard_rolling_grid())::int, 7, 'admin sees rolling grid days');

select set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
select is((select count(*) from dashboard_event_highlights())::int, 1, 'viewer sees highlights for own org');

select set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
select is((select count(*) from dashboard_event_highlights())::int, 0, 'user without membership sees no highlights');
select is((select count(*) from dashboard_rolling_grid())::int, 0, 'user without membership sees no rolling grid');

reset role;

select * from finish();
rollback;
