-- Run this once in Neon SQL Editor (or any PostgreSQL client)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  flight_number    VARCHAR(20)  NOT NULL,
  airline          VARCHAR(100),
  origin_code      VARCHAR(10)  NOT NULL,
  origin_city      VARCHAR(100),
  destination_code VARCHAR(10)  NOT NULL,
  destination_city VARCHAR(100),
  departure_time   VARCHAR(20),
  arrival_time     VARCHAR(20),
  duration         VARCHAR(20),
  price            DECIMAL(10,2) NOT NULL,
  passengers       INTEGER NOT NULL DEFAULT 1,
  seat             VARCHAR(10),
  status           VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  booked_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  flight_number    VARCHAR(20)  NOT NULL,
  airline          VARCHAR(100),
  origin_code      VARCHAR(10)  NOT NULL,
  origin_city      VARCHAR(100),
  destination_code VARCHAR(10)  NOT NULL,
  destination_city VARCHAR(100),
  departure_time   VARCHAR(20),
  arrival_time     VARCHAR(20),
  duration         VARCHAR(20),
  price            DECIMAL(10,2) NOT NULL,
  passengers       INTEGER NOT NULL DEFAULT 1,
  added_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
