CREATE DATABASE IF NOT EXISTS grindly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grindly;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(255),
  username VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(80) NOT NULL,
  avatar VARCHAR(32) NOT NULL DEFAULT 'avatar-1',
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  next_level_exp INT NOT NULL DEFAULT 1000,
  coins INT NOT NULL DEFAULT 250,
  streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_completed_on DATE,
  attributes JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  difficulty VARCHAR(16) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'Medium',
  estimated_minutes INT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'planned',
  started_at DATETIME,
  completed_at DATETIME,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  reward_xp INT NOT NULL DEFAULT 0,
  reward_coins INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_quests_user_status (user_id, status),
  INDEX idx_quests_user_created (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS quest_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quest_id INT NOT NULL,
  user_id INT NOT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  stopped_at DATETIME,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_quest_user_session UNIQUE (quest_id, user_id),
  CONSTRAINT fk_sessions_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  kind VARCHAR(32) NOT NULL,
  title VARCHAR(160) NOT NULL,
  detail VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activities_user_created (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id VARCHAR(64) NOT NULL,
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_inventory_user_item UNIQUE (user_id, item_id),
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
