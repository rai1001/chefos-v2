begin;

select plan(6);

reset role;

insert into orgs (id, name, slug)
values
  ('eeeeeeee-1111-1111-1111-111111111111', 'Org Import', 'org-import'),
  ('ffffffff-1111-1111-1111-111111111111', 'Org Other', 'org-other')
on conflict (id) do nothing;

insert into org_members (org_id, user_id, role, is_active)
values
  ('eeeeeeee-1111-1111-1111-111111111111', 'eeeeeeee-2222-2222-2222-222222222222', 'planner', true),
  ('ffffffff-1111-1111-1111-111111111111', 'ffffffff-2222-2222-2222-222222222222', 'planner', true)
on conflict (org_id, user_id) do update set is_active = excluded.is_active;

insert into import_jobs (id, org_id, status, source, created_by)
values
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-1111-1111-1111-111111111111', 'ready', 'test', 'eeeeeeee-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into import_rows (org_id, job_id, row_number, raw_json, errors_json, is_valid)
values
  ('eeeeeeee-1111-1111-1111-111111111111', 'eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '{"item":"A"}', '{}'::jsonb, true),
  ('eeeeeeee-1111-1111-1111-111111111111', 'eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '{"item":"B"}', '{}'::jsonb, false)
on conflict do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', 'eeeeeeee-2222-2222-2222-222222222222', true);

select is(
  (select count(*) from import_jobs)::int,
  1::int,
  'planner sees jobs of own org'
);

select throws_ok($$
  select import_commit('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
$$, 'job has invalid rows', 'commit fails with invalid rows');

update import_rows set is_valid = true where job_id = 'eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is(
  (select import_commit('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa'))::int,
  2::int,
  'commit returns total rows'
);

select is(
  (select status from import_jobs where id = 'eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'committed'::import_status,
  'status updated to committed'
);

select lives_ok($$
  select import_commit('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
$$, 'commit idempotent when already committed');

select set_config('request.jwt.claim.sub', 'ffffffff-2222-2222-2222-222222222222', true);
select is(
  (select count(*) from import_jobs)::int,
  0::int,
  'other org cannot see import jobs'
);

reset role;

select * from finish();
rollback;
