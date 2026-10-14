-- Illustrative org simulation for local demos. Recreated wholesale by scripts/seed-org.mjs.
create schema ainspire_demo;

create table ainspire_demo.organizations (
  code text primary key,
  display_name text not null,
  snapshot_date date not null default current_date,
  source_label text not null,
  is_illustrative boolean not null default true
);

create table ainspire_demo.divisions (
  organization_code text not null references ainspire_demo.organizations (code),
  division_code text not null,
  name_en text not null,
  name_bm text not null,
  primary key (organization_code, division_code)
);

create table ainspire_demo.employees (
  staff_id text primary key check (staff_id ~ '^TM[0-9]{6}$'),
  display_name text not null,
  organization_code text not null,
  division_code text not null,
  business_role text not null,
  grade_code text not null,
  supervisor_staff_id text references ainspire_demo.employees (staff_id) deferrable initially deferred,
  is_hr boolean not null default false,
  assessment_status text not null check (assessment_status in ('complete', 'pending')),
  persona text check (persona in ('explorer', 'builder', 'strategist', 'visionary')),
  readiness_score integer check (readiness_score between 0 and 100),
  is_ready boolean,
  dimension_scores jsonb,
  foreign key (organization_code, division_code) references ainspire_demo.divisions (organization_code, division_code),
  check (supervisor_staff_id is distinct from staff_id),
  check ((assessment_status = 'complete') = (persona is not null and readiness_score is not null and is_ready is not null and dimension_scores is not null))
);

create index employees_supervisor_idx on ainspire_demo.employees (supervisor_staff_id);
create index employees_division_status_idx on ainspire_demo.employees (organization_code, division_code, assessment_status);

-- Counts are derived from employees so dashboards can never drift from the population.
create view ainspire_demo.division_metrics as
select d.organization_code, d.division_code, d.name_en, d.name_bm,
  count(e.staff_id)::int as population_count,
  (count(*) filter (where e.assessment_status = 'complete'))::int as assessed_count,
  (count(*) filter (where e.is_ready))::int as ready_count,
  jsonb_build_object(
    'explorer', count(*) filter (where e.persona = 'explorer'),
    'builder', count(*) filter (where e.persona = 'builder'),
    'strategist', count(*) filter (where e.persona = 'strategist'),
    'visionary', count(*) filter (where e.persona = 'visionary')
  ) as persona_counts
from ainspire_demo.divisions d
left join ainspire_demo.employees e using (organization_code, division_code)
group by d.organization_code, d.division_code, d.name_en, d.name_bm;

create view ainspire_demo.organization_metrics as
select o.code, o.display_name, o.snapshot_date, o.source_label, o.is_illustrative,
  coalesce(sum(m.population_count), 0)::int as population_count,
  coalesce(sum(m.assessed_count), 0)::int as assessed_count,
  coalesce(sum(m.ready_count), 0)::int as ready_count
from ainspire_demo.organizations o
left join ainspire_demo.division_metrics m on m.organization_code = o.code
group by o.code, o.display_name, o.snapshot_date, o.source_label, o.is_illustrative;
