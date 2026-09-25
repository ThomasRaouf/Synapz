
drop policy if exists "Backend access only" on public.materials;

create policy "Users can manage their own materials"
    on public.materials
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);