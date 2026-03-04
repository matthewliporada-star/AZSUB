-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.CLIENT (
  client_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sub_id bigint NOT NULL,
  CONSTRAINT CLIENT_pkey PRIMARY KEY (client_id),
  CONSTRAINT CLIENT_sub_id_fkey FOREIGN KEY (sub_id) REFERENCES public.az_submissions(sub_id)
);
CREATE TABLE public.activity_action_types (
  action_code text NOT NULL,
  action_label text NOT NULL,
  action_category text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_action_types_pkey PRIMARY KEY (action_code)
);
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text,
  performed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.agency (
  agency_id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  location character varying NOT NULL,
  email character varying NOT NULL,
  contact_number numeric NOT NULL,
  CONSTRAINT agency_pkey PRIMARY KEY (agency_id)
);
CREATE TABLE public.az_submissions (
  sub_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_name text NOT NULL,
  client_email character varying NOT NULL,
  policy_id bigint NOT NULL,
  premium_paid numeric NOT NULL,
  anp numeric NOT NULL,
  payment_interval json NOT NULL,
  serial_id bigint NOT NULL,
  issued_at timestamp without time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'Pending'::text,
  form_type text,
  attachments jsonb DEFAULT '[]'::jsonb,
  submission_type text,
  next_payment_date date,
  mode_of_payment text,
  is_paid boolean DEFAULT false,
  date_issued timestamp with time zone,
  agency_id smallint,
  profile_id uuid,
  app_password text,
  CONSTRAINT az_submissions_pkey PRIMARY KEY (sub_id),
  CONSTRAINT AZ SUB_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.policy(policy_id),
  CONSTRAINT AZ SUB_serial_id_fkey FOREIGN KEY (serial_id) REFERENCES public.serial_number(serial_id),
  CONSTRAINT az_submissions_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(agency_id),
  CONSTRAINT az_submissions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.client_sample (
  id bigint NOT NULL DEFAULT nextval('client_sample_id_seq'::regclass),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_sample_pkey PRIMARY KEY (id)
);
CREATE TABLE public.family_medical_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  personal_id uuid NOT NULL,
  relationship text NOT NULL,
  name text,
  age integer,
  medical_history text,
  current_health_status text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT family_medical_history_pkey PRIMARY KEY (id),
  CONSTRAINT fk_personal FOREIGN KEY (personal_id) REFERENCES public.personal_informations(id)
);
CREATE TABLE public.habits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  personal_id uuid,
  smoker_status text,
  cigarettes_per_day text,
  smoked_before_since text,
  alcohol_type text,
  alcohol_measurement text,
  alcohol_frequency text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_personal_id_fkey FOREIGN KEY (personal_id) REFERENCES public.personal_informations(id)
);
CREATE TABLE public.payment_history (
  payment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sub_id bigint,
  amount numeric,
  payment_date timestamp without time zone DEFAULT now(),
  period_covered date,
  CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payment_history_sub_id_fkey FOREIGN KEY (sub_id) REFERENCES public.az_submissions(sub_id)
);
CREATE TABLE public.pdf file (
  PdfID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_id bigint NOT NULL,
  send_at timestamp without time zone,
  CONSTRAINT pdf file_pkey PRIMARY KEY (PdfID)
);
CREATE TABLE public.personal_informations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text,
  fathers_name text,
  mobile_code text,
  mobile_no text,
  email text,
  residence_address jsonb,
  previous_residence jsonb,
  secondary_residence jsonb,
  permanent_address jsonb,
  tin_ssn text,
  citizenship text,
  hobbies text,
  duration_at_address text,
  CONSTRAINT personal_informations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.personal_medical (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weight character varying,
  height character varying,
  exercise text,
  health_disorders text,
  medications text,
  family_physician character varying,
  physician_address character varying,
  physician_phone character varying,
  years_attended character varying,
  last_visited text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personal_medical_pkey PRIMARY KEY (id),
  CONSTRAINT personal_medical_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.personal_informations(id)
);
CREATE TABLE public.policy (
  policy_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  policy_name text NOT NULL,
  policy_type text NOT NULL,
  form_type text,
  active_status boolean DEFAULT true,
  agency smallint,
  request_type text,
  requirements jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT policy_pkey PRIMARY KEY (policy_id),
  CONSTRAINT policy_agency_fkey FOREIGN KEY (agency) REFERENCES public.agency(agency_id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username text UNIQUE,
  email text NOT NULL UNIQUE,
  account_type text DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now(),
  role_id bigint,
  last_submission_at timestamp with time zone,
  status USER-DEFINED DEFAULT 'Active'::"Status_User",
  Address character varying,
  contact_number bigint,
  gender USER-DEFINED,
  birthday date,
  civil_status USER-DEFINED,
  Middle text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(role_id)
);
CREATE TABLE public.serial_number (
  serial_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  serial_number numeric NOT NULL,
  is_issued boolean DEFAULT false,
  Confirm boolean,
  date timestamp without time zone NOT NULL,
  serial_type character varying NOT NULL,
  issued_by uuid,
  ResponseID bigint,
  RequestedBy character varying,
  CONSTRAINT serial_number_pkey PRIMARY KEY (serial_id),
  CONSTRAINT serial_number_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.travel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid,
  country text,
  city text,
  length text,
  frequency text,
  travel_date text,
  reason text,
  CONSTRAINT travel_details_pkey PRIMARY KEY (id),
  CONSTRAINT travel_details_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.personal_informations(id)
);
CREATE TABLE public.user_hierarchy (
  uh_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  report_to_id uuid,
  assigned_at timestamp without time zone NOT NULL DEFAULT now(),
  assigned_by uuid DEFAULT auth.uid(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT user_hierarchy_pkey PRIMARY KEY (uh_id),
  CONSTRAINT user_hierarchy_report_to_id_fkey FOREIGN KEY (report_to_id) REFERENCES public.profiles(id),
  CONSTRAINT user_hierarchy_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_roles (
  role_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  role_code text NOT NULL UNIQUE,
  role_name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.users (
  user_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  user_email character varying NOT NULL,
  contact_number numeric NOT NULL,
  agency_id smallint NOT NULL,
  role_id bigint NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT USER_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(agency_id)
);