-- Initial schema for Plafon personal finance application

-- Extensions
CREATE SCHEMA IF NOT EXISTS private;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 1. Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_budget numeric(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
  locale text NOT NULL DEFAULT 'pt-BR' CHECK (locale IN ('pt-BR', 'en-US')),
  currency text NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Categories (per-user categories, seeded with defaults on signup)
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  name_en text NOT NULL DEFAULT '',
  icon text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_user_name_type_key UNIQUE (user_id, name, type)
);

-- 3. Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'credit', 'debit', 'cash', 'transfer')),
  due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  is_active boolean NOT NULL DEFAULT true,
  last_generated_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  description text NOT NULL CHECK (char_length(trim(description)) > 0),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'credit', 'debit', 'cash', 'transfer')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_subscription_id_date_key UNIQUE (subscription_id, date)
);

-- 5. Groups (Agrupamentos — name only, per user)
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Transaction Groups (Many-to-Many join table)
CREATE TABLE public.transaction_groups (
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, group_id)
);

-- Indexes on FKs and frequent query paths
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_category_id ON public.subscriptions(category_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX idx_groups_user_id ON public.groups(user_id);
CREATE INDEX idx_transaction_groups_group_id ON public.transaction_groups(group_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = id);

-- RLS Policies: categories
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- RLS Policies: subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "subscriptions_delete_own" ON public.subscriptions
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- RLS Policies: transactions
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- RLS Policies: groups
CREATE POLICY "groups_select_own" ON public.groups
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "groups_insert_own" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "groups_update_own" ON public.groups
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "groups_delete_own" ON public.groups
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- RLS Policies: transaction_groups (must own both transaction and group)
CREATE POLICY "transaction_groups_select_own" ON public.transaction_groups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_groups.transaction_id
        AND t.user_id = (select auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = transaction_groups.group_id
        AND g.user_id = (select auth.uid())
    )
  );

CREATE POLICY "transaction_groups_insert_own" ON public.transaction_groups
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_groups.transaction_id
        AND t.user_id = (select auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = transaction_groups.group_id
        AND g.user_id = (select auth.uid())
    )
  );

CREATE POLICY "transaction_groups_delete_own" ON public.transaction_groups
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_groups.transaction_id
        AND t.user_id = (select auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = transaction_groups.group_id
        AND g.user_id = (select auth.uid())
    )
  );

-- Internal trigger helper: updated_at
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- Internal helper: seed default categories from src/lib/categories.ts
CREATE OR REPLACE FUNCTION private.seed_default_categories_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, name_en, icon, color, type)
  VALUES
    -- Expenses
    (p_user_id, 'Alimentação', 'Food', 'UtensilsCrossed', '#F97316', 'expense'),
    (p_user_id, 'Transporte', 'Transport', 'Car', '#3B82F6', 'expense'),
    (p_user_id, 'Moradia', 'Housing', 'Home', '#8B5CF6', 'expense'),
    (p_user_id, 'Saúde', 'Health', 'Heart', '#EF4444', 'expense'),
    (p_user_id, 'Educação', 'Education', 'GraduationCap', '#06B6D4', 'expense'),
    (p_user_id, 'Lazer', 'Entertainment', 'Gamepad2', '#EC4899', 'expense'),
    (p_user_id, 'Compras', 'Shopping', 'ShoppingBag', '#F59E0B', 'expense'),
    (p_user_id, 'Serviços', 'Services', 'Wrench', '#64748B', 'expense'),
    -- Income
    (p_user_id, 'Salário', 'Salary', 'Banknote', '#10B981', 'income'),
    (p_user_id, 'Freelance', 'Freelance', 'Laptop', '#14B8A6', 'income'),
    (p_user_id, 'Investimentos', 'Investments', 'TrendingUp', '#22C55E', 'income'),
    (p_user_id, 'Outros', 'Other', 'MoreHorizontal', '#6B7280', 'income')
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$;

-- Auth trigger: create profile and default categories on user signup
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  PERFORM private.seed_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Backfill existing users (including owner account)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM auth.users LOOP
    INSERT INTO public.profiles (id)
    VALUES (r.id)
    ON CONFLICT (id) DO NOTHING;

    PERFORM private.seed_default_categories_for_user(r.id);
  END LOOP;
END;
$$;

-- Helper: compute clamped due date for a given year/month
CREATE OR REPLACE FUNCTION public.compute_due_date(p_year integer, p_month integer, p_due_day integer)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_month_start date;
  v_last_day integer;
BEGIN
  v_month_start := make_date(p_year, p_month, 1);
  v_last_day := EXTRACT(DAY FROM (v_month_start + INTERVAL '1 month - 1 day'))::integer;
  RETURN make_date(p_year, p_month, LEAST(GREATEST(p_due_day, 1), v_last_day));
END;
$$;

-- Idempotent subscription transaction generator (called by pg_cron and dashboard)
CREATE OR REPLACE FUNCTION public.generate_subscription_transactions(p_target_date date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Schedule daily cron job at 00:05 UTC
SELECT cron.schedule(
  'generate-subscription-transactions-daily',
  '5 0 * * *',
  $$SELECT public.generate_subscription_transactions(CURRENT_DATE);$$
);
