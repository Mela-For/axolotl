alter table personal_notes enable row level security;

create policy "Users can view notes for their own profiles"
  on personal_notes for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = personal_notes.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert notes for their own profiles"
  on personal_notes for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = personal_notes.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete notes for their own profiles"
  on personal_notes for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = personal_notes.profile_id
        and profiles.user_id = auth.uid()
    )
  );
