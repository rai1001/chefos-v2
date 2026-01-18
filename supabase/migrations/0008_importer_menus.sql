-- Sprint 07: Importer staging + menus core

do $$
begin
  if not exists (select 1 from pg_type where typname = 'import_status') then
    create type import_status as enum ('pending', 'processing', 'ready', 'committed', 'failed');
  end if;
end $$;

create table if not exists import_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  status import_status not null default 'pending',
  source text,
  created_by uuid,
  created_at timestamptz default now(),
  committed_at timestamptz
);

create table if not exists import_rows (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  job_id uuid references import_jobs(id) on delete cascade,
  row_number int not null,
  raw_json jsonb,
  errors_json jsonb,
  is_valid boolean default false,
  created_at timestamptz default now()
);

create table if not exists menu_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  name text not null,
  version int not null default 1,
  payload_json jsonb,
  created_at timestamptz default now(),
  unique (org_id, name, version)
);

create table if not exists menu_overrides (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) not null,
  event_id uuid references events(id),
  template_id uuid references menu_templates(id),
  override_json jsonb,
  created_at timestamptz default now()
);

create or replace function import_commit(p_job_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_invalid_count int;
  v_total int;
begin
  select org_id into v_org from import_jobs where id = p_job_id;
  if v_org is null then
    raise exception 'import job not found';
  end if;

  if v_org <> current_org_id() then
    raise exception 'access denied';
  end if;

  select count(*) into v_invalid_count from import_rows where job_id = p_job_id and is_valid = false;
  if v_invalid_count > 0 then
    raise exception 'job has invalid rows';
  end if;

  select count(*) into v_total from import_rows where job_id = p_job_id;

  update import_jobs
  set status = 'committed',
      committed_at = now()
  where id = p_job_id
    and org_id = current_org_id();

  return v_total;
end;
$$;

grant execute on function import_commit(uuid) to authenticated;

-- RLS
alter table import_jobs enable row level security;
alter table import_rows enable row level security;
alter table menu_templates enable row level security;
alter table menu_overrides enable row level security;

drop policy if exists "import jobs read" on import_jobs;
create policy "import jobs read" on import_jobs
  for select using (org_id = current_org_id());

drop policy if exists "import jobs manage" on import_jobs;
create policy "import jobs manage" on import_jobs
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner') or is_member('purchasing')))
  with check (is_member('admin') or is_member('planner') or is_member('purchasing'));

drop policy if exists "import rows read" on import_rows;
create policy "import rows read" on import_rows
  for select using (org_id = current_org_id());

drop policy if exists "import rows manage" on import_rows;
create policy "import rows manage" on import_rows
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner') or is_member('purchasing')))
  with check (is_member('admin') or is_member('planner') or is_member('purchasing'));

drop policy if exists "menu templates read" on menu_templates;
create policy "menu templates read" on menu_templates
  for select using (org_id = current_org_id());

drop policy if exists "menu templates manage" on menu_templates;
create policy "menu templates manage" on menu_templates
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner')))
  with check (is_member('admin') or is_member('planner'));

drop policy if exists "menu overrides read" on menu_overrides;
create policy "menu overrides read" on menu_overrides
  for select using (org_id = current_org_id());

drop policy if exists "menu overrides manage" on menu_overrides;
create policy "menu overrides manage" on menu_overrides
  for all
  using (org_id = current_org_id() and (is_member('admin') or is_member('planner')))
  with check (is_member('admin') or is_member('planner'));
