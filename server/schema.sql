-- Services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  section VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  note TEXT DEFAULT '',
  base_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guides table
CREATE TABLE IF NOT EXISTS guides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(64) DEFAULT 'general',
  cover_image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  notes TEXT DEFAULT '',
  status VARCHAR(32) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traffic logs table
CREATE TABLE IF NOT EXISTS traffic_logs (
  id SERIAL PRIMARY KEY,
  path VARCHAR(512) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT,
  response_time_ms INT,
  ip VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_created ON traffic_logs(created_at DESC);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default admin user (username: admin, password: admin123)
-- Change this password immediately after first login!
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$1Yvg8zi8unlL/KwB1tLkG.Whevc9a2C6V91WMTA3OMdRfxpEloOUy')
ON CONFLICT (username) DO NOTHING;

-- Seed services
INSERT INTO services (section, name, note, base_price) VALUES
('software', 'Windows Installation', 'Fresh install + updates + drivers', 120),
('software', 'Software Installation', 'Office, antivirus, custom apps', 60),
('software', 'Data Recovery', 'Retrieve lost or corrupted files', 150),
('software', 'Virus & Malware Removal', 'Deep scan and cleanup', 80),
('software', 'Operating System Upgrade', 'Upgrade to latest Windows version', 100),
('care', 'PC Health Check', 'Full diagnostics and report', 50),
('care', 'Laptop Repair', 'Hardware diagnosis and fix', 200),
('care', 'Screen Replacement', 'Laptop screen replacement', 350),
('care', 'Thermal Paste Replacement', 'Repaste CPU/GPU for better cooling', 80),
('care', 'Keyboard Repair/Replacement', 'Fix or replace faulty keys', 120),
('network', 'WiFi Network Setup', 'Full router configuration', 150),
('network', 'Network Troubleshooting', 'Diagnose and fix connectivity issues', 80),
('network', 'Cable Management', 'Organize and label network cables', 100),
('network', 'Router Configuration', 'Port forwarding, QoS, security', 100),
('media', 'Smart TV Setup', 'App installation and configuration', 100),
('media', 'Streaming Device Setup', 'Roku, Fire Stick, Apple TV setup', 80),
('media', 'Home Theater Setup', 'Audio/video system installation', 200),
('media', 'CCTV Installation', 'Camera setup and DVR configuration', 400),
('deals', 'Full PC Tune-Up', 'Software cleanup + hardware check', 180),
('deals', 'Student Tech Pack', 'Windows + Office + antivirus install', 200),
('deals', 'Office Network Package', 'WiFi + printer setup + cable management', 350)
ON CONFLICT DO NOTHING;

-- Seed guides
INSERT INTO guides (title, content, category) VALUES
('How to Speed Up Your Slow PC', '<h2>Why Your PC Is Slow</h2><p>Over time, computers accumulate temporary files, startup programs, and fragmented data that slow performance.</p><h3>Quick Fixes</h3><ul><li><strong>Disable startup programs:</strong> Press Ctrl+Shift+Esc, go to Startup tab, disable unnecessary apps</li><li><strong>Clean temporary files:</strong> Press Win+R, type "temp", delete all files</li><li><strong>Run disk cleanup:</strong> Search "Disk Cleanup" in Start menu</li><li><strong>Upgrade to SSD:</strong> If you still use a hard drive, an SSD is the single biggest upgrade</li></ul><h3>When to Call a Professional</h3><p>If these steps don''t help, your PC may have hardware issues or need a fresh Windows installation.</p>', 'tips'),
('Protecting Your Home Network', '<h2>Secure Your WiFi</h2><p>A poorly secured network can expose your personal data and slow your internet.</p><h3>Essential Steps</h3><ul><li><strong>Change default router password:</strong> Most routers ship with "admin/admin"</li><li><strong>Use WPA3 or WPA2:</strong> Never use WEP — it''s easily cracked</li><li><strong>Create a guest network:</strong> Keep visitors and IoT devices separate</li><li><strong>Update firmware:</strong> Check for updates monthly</li></ul><h3>Advanced Tips</h3><p>Enable MAC address filtering and disable WPS for extra security.</p>', 'networking'),
('What To Do When Your Laptop Won''t Turn On', '<h2>Diagnostic Steps</h2><ol><li>Check the power adapter — is the LED light on?</li><li>Try a different power outlet</li><li>Remove the battery and try powering on with just the adapter</li><li>Hold the power button for 30 seconds (hard reset)</li><li>Listen for any beeps or fan noise</li></ol><h3>Common Causes</h3><ul><li>Dead battery or faulty charger</li><li>Failed motherboard</li><li>RAM not seated properly</li><li>Corrupted BIOS</li></ul><p>If none of these work, bring it in for a professional diagnosis.</p>', 'hardware'),
('Essential Software Every PC Needs', '<h2>Must-Have Software</h2><h3>Security</h3><ul><li><strong>Antivirus:</strong> Windows Defender is good, or use Bitdefender/Kaspersky</li><li><strong>VPN:</strong> For public WiFi protection</li></ul><h3>Productivity</h3><ul><li><strong>Web Browser:</strong> Chrome, Firefox, or Edge</li><li><strong>Office Suite:</strong> Microsoft Office or LibreOffice</li><li><strong>PDF Reader:</strong> Adobe Reader or Sumatra PDF</li></ul><h3>Maintenance</h3><ul><li><strong>CCleaner:</strong> Temp file cleanup</li><li><strong>7-Zip:</strong> File compression</li><li><strong>Driver Booster:</strong> Keep drivers updated</li></ul>', 'software'),
('Signs Your Hard Drive Is Failing', '<h2>Warning Signs</h2><ul><li>Frequent crashes or blue screens</li><li>Files suddenly disappear or become corrupted</li><li>Weird clicking or grinding noises</li><li>Very slow file transfers</li><li>Computer takes forever to boot</li></ul><h3>What To Do</h3><ol><li><strong>Back up immediately</strong> — your drive could die any moment</li><li>Run CrystalDiskInfo to check S.M.A.R.T. status</li><li>If health is "Caution" or "Bad", replace the drive</li><li>Consider upgrading to an SSD for better speed and reliability</li></ol>', 'hardware'),
('How to Remove Viruses and Malware', '<h2>Step-by-Step Removal</h2><ol><li>Disconnect from the internet to prevent data theft</li><li>Boot into Safe Mode (restart + F8 or Shift+Restart)</li><li>Run a full scan with Windows Defender</li><li>Download and run Malwarebytes free scan</li><li>Check browser extensions and remove anything suspicious</li><li>Clear temporary files</li></ol><h3>Prevention Tips</h3><ul><li>Don''t click suspicious email links</li><li>Download software only from official sources</li><li>Keep your OS and browser updated</li><li>Use an ad blocker to prevent malicious ads</li></ul>', 'security');
