BEGIN;

CREATE TABLE accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  login text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'parent', 'student'))
);

CREATE TABLE students (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name text NOT NULL,
  subject text NOT NULL
);

CREATE TABLE student_access (
  account_id bigint REFERENCES accounts ON DELETE CASCADE,
  student_id bigint REFERENCES students ON DELETE CASCADE,
  PRIMARY KEY (account_id, student_id)
);

CREATE TABLE subscriptions (
  student_id bigint REFERENCES students,
  month date NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  lesson_count integer NOT NULL CHECK (lesson_count > 0),
  amount_kopecks bigint NOT NULL CHECK (amount_kopecks >= 0),
  paid_at timestamptz,
  paid_by bigint REFERENCES accounts,
  CHECK ((paid_at IS NULL) = (paid_by IS NULL)),
  PRIMARY KEY (student_id, month)
);

CREATE TABLE lessons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES students,
  starts_at timestamptz NOT NULL UNIQUE,
  zoom_url text
);
CREATE INDEX lessons_by_student ON lessons (student_id, starts_at);

CREATE TABLE homework (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES students,
  description text NOT NULL,
  due_on date NOT NULL,
  completed_at timestamptz
);

CREATE TABLE student_documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES students,
  uploaded_by bigint NOT NULL REFERENCES accounts,
  object_key text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
