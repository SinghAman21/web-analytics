create or replace function manage_three_month_partitions()
returns void
language plpgsql
as $$
declare
  curr_start date := date_trunc('month', now())::date;
  next_start date := (curr_start + interval '3 months')::date;
  prev_start date := (curr_start - interval '3 months')::date;

  curr_table text := 'free_sites_raw_event_' || to_char(curr_start, 'YYYY_MM') || to_char(curr_start + interval '1 month', 'MM') || to_char(curr_start + interval '2 months', 'MM') || to_char(next_start, 'MM');
  prev_table text := 'free_sites_raw_event_' || to_char(prev_start, 'YYYY_MM') || to_char(prev_start + interval '1 month', 'MM') || to_char(prev_start + interval '2 months', 'MM') || to_char(prev_start + interval '3 months', 'MM');
begin
  -- Create current 3-month partition
  execute format(
    'create table if not exists public.%I partition of public.free_sites_raw_event
     for values from (%L) to (%L);',
    curr_table, curr_start, next_start
  );

  -- Drop previous 3-month partition
  execute format(
    'drop table if exists public.%I;',
    prev_table
  );
end;
$$;

select manage_three_month_partitions();

----------------------------------------------

select cron.schedule(
  'three-month-partition-job',
  '0 0 1 1,4,7,10 *',
  $$ select manage_three_month_partitions(); $$
);