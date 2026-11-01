alter table conversation_logs enable row level security;

create policy "Users can view logs for their own profiles"
  on conversation_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = conversation_logs.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert logs for their own profiles"
  on conversation_logs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = conversation_logs.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "Users can update logs for their own profiles"
  on conversation_logs for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = conversation_logs.profile_id
        and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = conversation_logs.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete logs for their own profiles"
  on conversation_logs for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = conversation_logs.profile_id
        and profiles.user_id = auth.uid()
    )
  );
