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
