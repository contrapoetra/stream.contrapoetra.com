# 🚀 YouTube Clone - Distributed Systems Deployment Guide

## 📋 Overview
This guide will help you deploy the YouTube Clone application across **2 laptops** for distributed systems demonstration.

## 🏗️ Architecture

```
LAPTOP 1 (SERVER)                    LAPTOP 2 (CLIENT)
┌─────────────────┐                ┌─────────────────┐
│  Docker XAMPP   │                │  React Frontend │
│  - PHP API      │◄──────────────►│  - Browser      │
│  - MySQL DB     │   WiFi/UTP     │  - Dev Server   │
│  - File Storage │                │                 │
│  Port: 80       │                │  Port: 5173     │
│  Port: 3306     │                │                 │
└─────────────────┘                └─────────────────┘
```

## 🔧 Step-by-Step Setup

### **LAPTOP 1 - SERVER SETUP**

#### 1. Prerequisites
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Setup Backend Server
```bash
# Clone/Navigate to project
cd /path/to/stream.contrapoetra.com

# Start Docker containers
cd backend
docker-compose up -d

# Check containers are running
docker-compose ps

# Access phpMyAdmin (Optional)
# Open browser: http://localhost:80/phpmyadmin
# Username: root
# Password: i.hate.sequels
```

#### 3. Create Database Schema
```sql
-- Open phpMyAdmin or connect to MySQL and run:
CREATE DATABASE IF NOT EXISTS streaming;
USE streaming;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos Table
CREATE TABLE IF NOT EXISTS Videos (
    video_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    mime_type VARCHAR(100),
    size BIGINT,
    visibility ENUM('public', 'private') DEFAULT 'public',
    status VARCHAR(50) DEFAULT 'uploaded',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    video_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES Videos(video_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Likes Table
CREATE TABLE IF NOT EXISTS Likes (
    video_id INT NOT NULL,
    user_id INT NOT NULL,
    like_type ENUM('like', 'dislike'),
    like_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (video_id, user_id),
    FOREIGN KEY (video_id) REFERENCES Videos(video_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS Subscriptions (
    subscriber_id INT NOT NULL,
    channel_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    subscribe_date DATE,
    PRIMARY KEY (subscriber_id, channel_id),
    FOREIGN KEY (subscriber_id) REFERENCES Users(user_id),
    FOREIGN KEY (channel_id) REFERENCES Users(user_id)
);
```

#### 4. Test Server API
```bash
# Test API endpoints from Laptop 1
curl http://localhost:80/api/api.php?action=videos
curl http://localhost:80/api/api.php?action=video&id=1
```

#### 5. Find Server IP Address
```bash
# Get your IP address
ip addr show
# or
hostname -I
```

#### 6. Firewall Configuration (if needed)
```bash
# Allow ports 80 and 3306
sudo ufw allow 80
sudo ufw allow 3306
sudo ufw reload
```

---

### **LAPTOP 2 - CLIENT SETUP**

#### 1. Prerequisites
```bash
# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git (if not installed)
sudo apt update
sudo apt install git
```

#### 2. Setup Frontend Client
```bash
# Clone project to Laptop 2
git clone <your-repo-url> stream.contrapoetra.com
cd stream.contrapoetra.com/frontend

# Install dependencies
npm install

# Configure API to point to Server
# Replace IP_ADDRESS with Laptop 1's IP
cp .env.example .env
echo "VITE_API_URL=http://IP_ADDRESS:80/api/api.php" > .env

# Start development server
npm run dev
```

#### 3. Test Connection
```bash
# Test if Laptop 2 can reach Laptop 1's API
curl http://IP_ADDRESS:80/api/api.php?action=videos

# If connection fails, check:
# 1. Both laptops on same WiFi/network
# 2. Firewall on Laptop 1 allows connections
# 3. Docker containers running on Laptop 1
```

#### 4. Access Application
```bash
# Open browser on Laptop 2
http://localhost:5173
```

---

## 🌐 Network Setup Options

### **Option 1: WiFi Connection**
1. Both laptops connect to same WiFi network
2. Find Laptop 1's IP: `hostname -I`
3. Configure frontend to use Laptop 1's IP

### **Option 2: Direct Ethernet Connection**
```bash
# On both laptops, set up static IPs:
# Laptop 1 (Server): 192.168.1.1
# Laptop 2 (Client): 192.168.1.2

# Configure on Ubuntu:
sudo nano /etc/netplan/01-network-manager-all.yaml
```

### **Option 3: Mobile Hotspot**
1. Laptop 1 creates mobile hotspot
2. Laptop 2 connects to hotspot
3. Use hotspot IP addresses

---

## 🧪 Testing & Verification

### **1. Test API Connectivity**
```bash
# From Laptop 2, test all endpoints:
curl -X GET "http://IP_ADDRESS:80/api/api.php?action=videos"
curl -X POST "http://IP_ADDRESS:80/api/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### **2. Test Frontend Integration**
1. Open browser on Laptop 2: `http://localhost:5173`
2. Should see video list (empty initially)
3. No error messages in console

### **3. Test Upload Functionality**
1. Register/login through frontend
2. Upload test video file
3. Verify video appears in list

---

## 🐛 Common Issues & Solutions

### **Issue: "CORS error"**
```php
// In backend/htdocs/api/api.php, ensure CORS headers:
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### **Issue: "Cannot connect to server"**
1. Check both laptops on same network
2. Ping from Laptop 2: `ping IP_ADDRESS`
3. Check Docker containers running: `docker-compose ps`
4. Check firewall settings

### **Issue: "Database connection failed"**
1. Verify MySQL container running: `docker-compose logs mysql`
2. Check database exists: use phpMyAdmin
3. Verify database credentials in config.php

### **Issue: "Video upload fails"**
1. Check upload directory permissions: `chmod 755 uploads/`
2. Verify PHP upload limits in php.ini
3. Check disk space on server

---

## 📱 Demo Script for UAS Presentation

### **1. Introduction (2 minutes)**
- "Selamat pagi, saya akan mendemonstrasikan sistem YouTube Clone dengan arsitektur distributed systems"
- "Sistem ini menggunakan 2 laptop: 1 sebagai server, 1 sebagai client"

### **2. Show Architecture (1 minute)**
- Explain client-server model
- Show network diagram
- Highlight REST API communication

### **3. Live Demo (5 minutes)**
```bash
# Show server running
docker-compose ps
curl http://localhost:80/api/api.php?action=videos

# Show client accessing server
# Browse to http://localhost:5173 on client laptop
# Show real-time data from API
```

### **4. Upload & Playback (3 minutes)**
- Register new user
- Upload sample video
- Show video appears immediately on both laptops
- Demonstrate video playback

### **5. Database Relations (2 minutes)**
- Show phpMyAdmin with 5 tables
- Explain foreign key relationships
- Show how data flows between tables

### **6. Conclusion (1 minute)**
- Recap distributed systems concepts demonstrated
- Q&A

---

## 📊 Project Completion Checklist

- [x] **2 Laptop Setup**: Server + Client configuration
- [x] **REST API**: All CRUD operations implemented
- [x] **Database**: 5 tables with proper relationships
- [x] **Authentication**: JWT-based login system
- [x] **File Upload**: Video storage and retrieval
- [x] **Responsive Design**: Mobile-friendly UI
- [x] **Real-time Updates**: Live data synchronization

---

## 🆘 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify network**: `ping IP_ADDRESS`
3. **Test API**: Use Postman or curl
4. **Check browser console**: F12 → Network tab

Good luck with your UAS presentation! 🎉