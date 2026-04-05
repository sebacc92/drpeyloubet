CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK(category IN ('Quirúrgicos', 'Reparadoras', 'No Quirúrgicos')) NOT NULL,
  content_html TEXT
);

CREATE TABLE IF NOT EXISTS service_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);
