-- Switch generate_subscription_transactions to SECURITY INVOKER so RLS is enforced natively for authenticated users,
-- and restrict execution of the Supabase-managed rls_auto_enable event trigger helper.

CREATE OR REPLACE FUNCTION public.generate_subscription_transactions(p_target_date date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_caller_uid uuid;
  v_effective_date date;
  v_sub record;
  v_start_month date;
  v_end_month date;
  v_month_cursor date;
  v_due_date date;
  v_inserted_count integer := 0;
  v_row_count integer := 0;
  v_max_generated date;
BEGIN
  v_caller_uid := auth.uid();

  IF v_caller_uid IS NOT NULL THEN
    -- Prevent authenticated callers from generating transactions far into the future
    v_effective_date := LEAST(COALESCE(p_target_date, CURRENT_DATE), (CURRENT_DATE + 1));
  ELSE
    IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      RAISE EXCEPTION 'Unauthorized execution of generate_subscription_transactions';
    END IF;
    v_effective_date := COALESCE(p_target_date, CURRENT_DATE);
  END IF;

  v_end_month := date_trunc('month', v_effective_date)::date;

  FOR v_sub IN
    SELECT s.id, s.user_id, s.category_id, s.name, s.amount, s.payment_method, s.due_day, s.last_generated_on, s.created_at
    FROM public.subscriptions s
    WHERE s.is_active = true
      AND (v_caller_uid IS NULL OR s.user_id = v_caller_uid)
  LOOP
    v_start_month := date_trunc('month', COALESCE(v_sub.last_generated_on, v_sub.created_at::date, v_effective_date))::date;
    v_month_cursor := v_start_month;
    v_max_generated := v_sub.last_generated_on;

    WHILE v_month_cursor <= v_end_month LOOP
      v_due_date := public.compute_due_date(
        EXTRACT(YEAR FROM v_month_cursor)::integer,
        EXTRACT(MONTH FROM v_month_cursor)::integer,
        v_sub.due_day
      );

      IF v_due_date <= v_effective_date
         AND v_due_date >= v_sub.created_at::date
         AND (v_sub.last_generated_on IS NULL OR v_due_date > v_sub.last_generated_on)
      THEN
        INSERT INTO public.transactions (
          user_id,
          category_id,
          subscription_id,
          description,
          amount,
          type,
          payment_method,
          date,
          status
        )
        VALUES (
          v_sub.user_id,
          v_sub.category_id,
          v_sub.id,
          v_sub.name,
          v_sub.amount,
          'expense',
          v_sub.payment_method,
          v_due_date,
          'completed'
        )
        ON CONFLICT (subscription_id, date) DO NOTHING;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        v_inserted_count := v_inserted_count + v_row_count;

        IF v_max_generated IS NULL OR v_due_date > v_max_generated THEN
          v_max_generated := v_due_date;
        END IF;
      END IF;

      v_month_cursor := (v_month_cursor + INTERVAL '1 month')::date;
    END LOOP;

    IF v_max_generated IS DISTINCT FROM v_sub.last_generated_on THEN
      UPDATE public.subscriptions
      SET last_generated_on = v_max_generated
      WHERE id = v_sub.id;
    END IF;
  END LOOP;

  RETURN v_inserted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_subscription_transactions(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_subscription_transactions(date) TO authenticated, postgres, service_role;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
