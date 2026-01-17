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

insert into orgs (id, name, slug)
values ('44444444-4444-4444-4444-444444444444', 'ChefOS Other', 'chefos-other')
on conflict (id) do nothing;

insert into hotels (id, org_id, name)
values ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Hotel Lateral')
on conflict (id) do nothing;
