-- Run this in Neon SQL Editor

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
  id VARCHAR(255) PRIMARY KEY,
  creator_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  current_player_index INTEGER DEFAULT 0,
  board_state JSONB DEFAULT '{"tiles": [], "leftEnd": 0, "rightEnd": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  winner_id VARCHAR(255)
);

CREATE TABLE game_players (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  player_index INTEGER NOT NULL,
  hand_state JSONB DEFAULT '[]',
  pass_count INTEGER DEFAULT 0,
  UNIQUE(game_id, player_id)
);

CREATE TABLE player_stats (
  user_id VARCHAR(255) PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  highest_win_streak INTEGER DEFAULT 0
);