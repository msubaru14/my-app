-- +migrate Up
-- Before applying this migration, check for invalid existing values:
-- SELECT id, due_date
-- FROM tasks
-- WHERE due_date IS NOT NULL
--   AND due_date !~ '^\d{4}-\d{2}-\d{2}$';

ALTER TABLE tasks
ALTER COLUMN due_date TYPE DATE
USING NULLIF(due_date, '')::date;

-- +migrate Down
ALTER TABLE tasks
ALTER COLUMN due_date TYPE TEXT
USING due_date::text;
