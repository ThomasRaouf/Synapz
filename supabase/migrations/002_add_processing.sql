alter table public.materials
    add column if not exists source_text    text,
    add column if not exists processed_text text,
    add column if not exists processed_at   timestamptz,
    add column if not exists processing_error   text;

alter table public.materials
    add constraint materials_status_values
    check (status in ('New', 'Processing', 'Processed', 'Failed'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists materials_set_updated_at on public.materials;

create trigger materials_set_updated_at
    before update on public.materials
    for each row
    execute procedure public.set_updated_at();
