-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  file_id uuid REFERENCES public.files(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: on new file_message, notify participants (file owner, assigned admin, and admins if new_inquiry) except sender
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_file RECORD;
  v_sender_name text;
  v_recipient uuid;
  v_subject text;
BEGIN
  SELECT f.id, f.subject, f.created_by, f.assigned_to
    INTO v_file
    FROM public.files f WHERE f.id = NEW.file_id;

  IF v_file.id IS NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, email) INTO v_sender_name
    FROM public.profiles WHERE id = NEW.sender_id;

  v_subject := v_file.subject;

  -- Notify file owner
  IF v_file.created_by IS NOT NULL AND v_file.created_by <> NEW.sender_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, file_id)
    VALUES (v_file.created_by, 'new_message',
            'New message on ' || v_subject,
            COALESCE(v_sender_name, 'Someone') || ' replied',
            v_file.id);
  END IF;

  -- Notify assigned admin
  IF v_file.assigned_to IS NOT NULL
     AND v_file.assigned_to <> NEW.sender_id
     AND v_file.assigned_to <> COALESCE(v_file.created_by, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, body, file_id)
    VALUES (v_file.assigned_to, 'new_message',
            'New message on ' || v_subject,
            COALESCE(v_sender_name, 'Someone') || ' replied',
            v_file.id);
  END IF;

  -- If unassigned, notify all admins (except sender)
  IF v_file.assigned_to IS NULL THEN
    FOR v_recipient IN
      SELECT ur.user_id FROM public.user_roles ur
      WHERE ur.role = 'admin'
        AND ur.user_id <> NEW.sender_id
        AND ur.user_id <> COALESCE(v_file.created_by, '00000000-0000-0000-0000-000000000000'::uuid)
    LOOP
      INSERT INTO public.notifications (user_id, type, title, body, file_id)
      VALUES (v_recipient, 'new_message',
              'New message on ' || v_subject,
              COALESCE(v_sender_name, 'Someone') || ' replied',
              v_file.id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_on_new_message() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER file_messages_notify
  AFTER INSERT ON public.file_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();

-- Notify admins on new public inquiry
CREATE OR REPLACE FUNCTION public.notify_on_new_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient uuid;
BEGIN
  FOR v_recipient IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (v_recipient, 'new_inquiry',
            'New inquiry from ' || COALESCE(NEW.name, 'someone'),
            LEFT(COALESCE(NEW.message, ''), 140));
  END LOOP;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_on_new_inquiry() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER inquiries_notify
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_inquiry();
