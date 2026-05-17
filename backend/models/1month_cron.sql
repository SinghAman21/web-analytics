create or replace function manage_monthly_partitions()
returns void
language plpgsql
as $$
declare
  curr_start date := date_trunc('month', now());
  next_start date := curr_start + interval '1 month';
  prev_start date := curr_start - interval '1 month';

  curr_table text := 'ultrafree_raw_events_' || to_char(curr_start, 'YYYY_MM');
  prev_table text := 'ultrafree_raw_events_' || to_char(prev_start, 'YYYY_MM');
begin
  -- Create current month partition
  execute format(
    'create table if not exists public.%I partition of public.ultrafree_raw_events
     for values from (%L) to (%L);',
    curr_table, curr_start, next_start
  );

  -- Drop previous month partition
  execute format(
    'drop table if exists public.%I;',
    prev_table
  );
end;
$$;

select manage_monthly_partitions();

----------------------------------------------

select cron.schedule(
  'monthly-partition-job',
  '0 0 3 * *',
  $$ select manage_monthly_partitions(); $$
);