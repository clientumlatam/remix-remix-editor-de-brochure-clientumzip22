CREATE DATABASE IF NOT EXISTS clientum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clientum;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS crm_deals (
  id VARCHAR(36) PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  stage ENUM('leads','bot_contact','proposed','closed') DEFAULT 'leads',
  industry VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  contact VARCHAR(100),
  contact_title VARCHAR(100),
  pain_point TEXT,
  guiacores_url TEXT,
  meddic_metrics INT DEFAULT 0,
  meddic_buyer INT DEFAULT 0,
  meddic_criteria INT DEFAULT 0,
  meddic_process INT DEFAULT 0,
  meddic_pain INT DEFAULT 0,
  meddic_champion INT DEFAULT 0,
  meddic_score INT DEFAULT 0,
  meddic_red_flags TEXT,
  meddic_next_actions TEXT,
  outreach_email1 TEXT,
  outreach_email2 TEXT,
  outreach_email3 TEXT,
  outreach_linkedin TEXT,
  outreach_phone_script TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 0,
  monthly DECIMAL(12,2) DEFAULT 0,
  category VARCHAR(100),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  specialty VARCHAR(100),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  manager VARCHAR(100),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  status ENUM('activa','derivada','resuelta') DEFAULT 'activa',
  query_type VARCHAR(100),
  channel VARCHAR(50) DEFAULT 'whatsapp',
  assigned_seller_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_seller_id) REFERENCES sellers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deal_id VARCHAR(36),
  action VARCHAR(100),
  description TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO products (code, name, description, price, monthly, category) VALUES
('PRO-001', 'Plan Pro — CRM + Chatbot + IA', 'Chatbot WhatsApp ilimitado, CRM completo, Asistente IA y Facturación AFIP integrada.', 350000, 350000, 'Plan'),
('PRO-002', 'Plan Starter — Chatbot', 'Bot de WhatsApp para respuestas automáticas, hasta 500 conversaciones/mes.', 180000, 180000, 'Plan'),
('PRO-003', 'Consultoría & Implementación', 'Setup completo en 5 días hábiles incluido.', 120000, 0, 'Servicio');
