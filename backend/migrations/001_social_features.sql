-- Social, privacy, notification, preference, inventory and AI persistence.
-- The application applies equivalent idempotent changes at startup for SQLite/PostgreSQL.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS equipped BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY, requester_id INTEGER NOT NULL REFERENCES users(id),
  addressee_id INTEGER NOT NULL REFERENCES users(id), status VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requester_id, addressee_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), kind VARCHAR(32) NOT NULL DEFAULT 'system',
  title VARCHAR(160) NOT NULL, message TEXT NOT NULL DEFAULT '', payload JSON NOT NULL DEFAULT '{}', read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id), values JSON NOT NULL DEFAULT '{}', updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_actions (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), action VARCHAR(64) NOT NULL,
  input JSON NOT NULL DEFAULT '{}', result JSON NOT NULL DEFAULT '{}', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
