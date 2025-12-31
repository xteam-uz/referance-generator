# Next.js Production Deployment Guide

## Serverda quyidagi qadamlarni bajaring:

### 1. Build qilish

```bash
cd /home/mirsolih/web/cv-frontend.firstcoder.uz/public_html
npm install
npm run build
```

### 2. PM2 o'rnatish (agar yo'q bo'lsa)

```bash
npm install -g pm2
```

### 3. PM2 bilan Next.js ni ishga tushirish

**Variant 1: To'g'ridan-to'g'ri**

```bash
cd /home/mirsolih/web/cv-frontend.firstcoder.uz/public_html
pm2 start npm --name "cv-frontend" -- start
pm2 save
pm2 startup
```

**Variant 2: Ecosystem fayl bilan (tavsiya etiladi)**

```bash
# ecosystem.config.js faylini serverga ko'chiring
cd /home/mirsolih/web/cv-frontend.firstcoder.uz/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx konfiguratsiyasi

`/etc/nginx/sites-available/cv-frontend.firstcoder.uz` faylini yarating:

```nginx
server {
    listen 80;
    server_name cv-frontend.firstcoder.uz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Nginx ni qayta ishga tushirish

```bash
sudo ln -s /etc/nginx/sites-available/cv-frontend.firstcoder.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. PM2 ni tekshirish

```bash
pm2 status
pm2 logs cv-frontend
```

## Foydali PM2 buyruqlari:

- `pm2 restart cv-frontend` - qayta ishga tushirish
- `pm2 stop cv-frontend` - to'xtatish
- `pm2 logs cv-frontend` - loglarni ko'rish
- `pm2 monit` - monitoring
