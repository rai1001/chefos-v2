begin;

select plan(7);

reset role;

insert into orgs (id, name, slug)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Org Staff', 'org-staff'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Org Other', 'org-other-2')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values ('aaaaaaaa-9999-9999-9999-aaaaaaaa9999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hotel Staff')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-aaaaaaaa1111', 'planner', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-2222-2222-2222-aaaaaaaa2222', 'chef', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-1111-1111-1111-bbbbbbbb1111', 'planner', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values (
  'aaaaaaaa-eeee-0000-0000-aaaaaaaa0000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-9999-9999-9999-aaaaaaaa9999',
  'Evento Staff',
  now(),
  now() + interval '2 hours',
  'confirmed'
)
on conflict (id) do nothing;

insert into event_services (id, org_id, event_id, service_type, format)
values (
  'aaaaaaaa-bbbb-0000-0000-aaaaaaaa0000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-eeee-0000-0000-aaaaaaaa0000',
  'coffee_break',
  'de_pie'
)
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-1111-1111-1111-aaaaaaaa1111', true);

select lives_ok($$
  insert into shifts (org_id, hotel_id, user_id, starts_at, ends_at, role)
  values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-9999-9999-9999-aaaaaaaa9999',
    'aaaaaaaa-1111-1111-1111-aaaaaaaa1111',
    now(),
    now() + interval '8 hours',
    'chef'
  )
$$, 'planner can insert shift');

select throws_ok($$
  insert into shifts (org_id, hotel_id, user_id, starts_at, ends_at)
  values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-9999-9999-9999-aaaaaaaa9999',
    'aaaaaaaa-1111-1111-1111-aaaaaaaa1111',
    now(),
    now() - interval '1 hour'
  )
$$, '23514');

select set_config('request.jwt.claim.sub', 'bbbbbbbb-1111-1111-1111-bbbbbbbb1111', true);
select is((select count(*) from shifts)::int, 0::int, 'other org cannot read shifts');

select set_config('request.jwt.claim.sub', 'aaaaaaaa-2222-2222-2222-aaaaaaaa2222', true);
select throws_ok($$
  select update_production_task_status('00000000-0000-0000-0000-000000000000', 'done')
$$, 'task not found', 'nonexistent task');

-- seed production task for org and test transition
reset role;
insert into production_plans (id, org_id, hotel_id, event_service_id, status)
values ('aaaaaaaa-aaaa-0000-0000-aaaaaaaa0000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-9999-9999-9999-aaaaaaaa9999', 'aaaaaaaa-bbbb-0000-0000-aaaaaaaa0000', 'draft')
on conflict (id) do nothing;

insert into production_tasks (id, org_id, hotel_id, plan_id, title, status)
values ('aaaaaaaa-cccc-0000-0000-aaaaaaaa0000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-9999-9999-9999-aaaaaaaa9999', 'aaaaaaaa-aaaa-0000-0000-aaaaaaaa0000', 'Picar verduras', 'draft')
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-2222-2222-2222-aaaaaaaa2222', true);
select lives_ok($$
  select update_production_task_status('aaaaaaaa-cccc-0000-0000-aaaaaaaa0000', 'in_progress')
$$, 'chef can move task to in_progress');

select is(
  (select status from production_tasks where id = 'aaaaaaaa-cccc-0000-0000-aaaaaaaa0000'),
  'in_progress'::task_status,
  'status updated'
);

select throws_ok($$
  select update_production_task_status('aaaaaaaa-cccc-0000-0000-aaaaaaaa0000', 'draft')
$$, 'invalid status transition', 'cannot go back to draft');

reset role;

select * from finish();
rollback;
