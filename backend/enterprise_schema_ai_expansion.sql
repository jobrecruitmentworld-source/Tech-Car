-- ==============================================
-- 11. AI MODULE & ASSISTANT
-- ==============================================
CREATE TABLE IF NOT EXISTS ai_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider ENUM('OpenAI', 'Anthropic', 'Local', 'Other') DEFAULT 'OpenAI',
    api_key VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intent VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'generate_seo_title', 'grammar_fix'
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    model_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NULL,
    prompt_id INT NULL,
    input_text LONGTEXT,
    output_text LONGTEXT,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_seo_suggestions (
    id CHAR(36) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    focus_keyword VARCHAR(255) NULL,
    seo_score INT DEFAULT 0,
    readability_score INT DEFAULT 0,
    suggestions_json JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id)
);

-- ==============================================
-- 12. UI & MENU BUILDER
-- ==============================================
CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(50) NOT NULL, -- e.g., 'header', 'footer', 'sidebar'
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    parent_id INT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NULL,
    sort_order INT DEFAULT 0,
    target ENUM('_self', '_blank') DEFAULT '_self',
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_builder (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    layout_json JSON NOT NULL,
    status ENUM('Draft', 'Published') DEFAULT 'Draft',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================
-- 13. USER PROFILES & ENGAGEMENT
-- ==============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id CHAR(36) PRIMARY KEY,
    bio TEXT,
    avatar_media_id CHAR(36) NULL,
    social_links JSON NULL,
    website VARCHAR(255) NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (avatar_media_id) REFERENCES media_files(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id CHAR(36) PRIMARY KEY,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, entity_type, entity_id)
);

-- ==============================================
-- 14. NOTIFICATIONS & NEWSLETTER
-- ==============================================
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'blog_approved', 'comment_reply'
    message TEXT NOT NULL,
    action_url VARCHAR(255) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('Subscribed', 'Unsubscribed') DEFAULT 'Subscribed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- 15. ADVERTISEMENT & MONETIZATION
-- ==============================================
CREATE TABLE IF NOT EXISTS ad_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    width INT NULL,
    height INT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    advertiser_name VARCHAR(255) NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    status ENUM('Active', 'Paused', 'Ended') DEFAULT 'Paused',
    clicks INT DEFAULT 0,
    impressions INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ad_creatives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    zone_id INT NOT NULL,
    media_id CHAR(36) NULL,
    html_code TEXT NULL,
    target_url VARCHAR(500) NULL,
    weight INT DEFAULT 1,
    FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES ad_zones(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE SET NULL
);
