# PHP Upload Settings - Fayl Yuklash Sozlamalari

## Muammo

3.8MB va undan katta rasmlar yuklanmayapti, chunki PHP sozlamalarida `upload_max_filesize = 2M` va `post_max_size = 8M`.

**Muhim:**

-   `php artisan serve` (Laravel built-in server) **CLI PHP** ishlatadi, PHP-FPM emas!
-   Web server (Nginx/Apache) PHP-FPM ishlatadi va alohida sozlamalar bor!
-   `php -i` va `php artisan tinker` CLI PHP sozlamalarini ko'rsatadi

## Yechim

### 0. Qaysi server ishlatilmoqda?

Test route orqali tekshiring:

```bash
curl http://localhost:8001/api/test-php-settings
```

Agar `php_sapi_name: "cli-server"` bo'lsa - Laravel built-in server ishlatilmoqda (CLI PHP)
Agar `php_sapi_name: "fpm-fcgi"` bo'lsa - PHP-FPM ishlatilmoqda

### 1. CLI PHP sozlamalarini o'zgartirish (agar `php artisan serve` ishlatilsa)

**Eslatma:** Laravel built-in server (`php artisan serve`) CLI PHP ishlatadi!

#### Variant A: Qo'lda o'zgartirish

```bash
sudo nano /etc/php/8.5/cli/php.ini
```

Quyidagi qatorlarni topib o'zgartiring:

```ini
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 300
max_input_time = 300
```

#### Variant B: Avtomatik o'zgartirish

```bash
# CLI PHP sozlamalarini o'zgartirish
sudo sed -i 's/^upload_max_filesize = .*/upload_max_filesize = 10M/' /etc/php/8.5/cli/php.ini
sudo sed -i 's/^post_max_size = .*/post_max_size = 12M/' /etc/php/8.5/cli/php.ini
sudo sed -i 's/^max_execution_time = .*/max_execution_time = 300/' /etc/php/8.5/cli/php.ini
sudo sed -i 's/^max_input_time = .*/max_input_time = 300/' /etc/php/8.5/cli/php.ini

# Tekshirish
grep -E "^upload_max_filesize|^post_max_size" /etc/php/8.5/cli/php.ini

# Laravel server ni qayta ishga tushirish (MUHIM!)
# Ctrl+C bilan to'xtating va qayta ishga tushiring:
php artisan serve
```

### 2. PHP-FPM sozlamalarini o'zgartirish (agar Nginx/Apache ishlatilsa)

#### Variant A: Qo'lda o'zgartirish

```bash
sudo nano /etc/php/8.5/fpm/php.ini
```

Quyidagi qatorlarni topib o'zgartiring (qidirish: `Ctrl+W`, keyin `upload_max_filesize` yozing):

```ini
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 300
max_input_time = 300
```

Keyin PHP-FPM ni qayta ishga tushiring:

```bash
sudo systemctl restart php8.5-fpm
```

#### Variant B: Avtomatik o'zgartirish (buyruqlar)

```bash
# Sozlamalarni o'zgartirish
sudo sed -i 's/^upload_max_filesize = .*/upload_max_filesize = 10M/' /etc/php/8.5/fpm/php.ini
sudo sed -i 's/^post_max_size = .*/post_max_size = 12M/' /etc/php/8.5/fpm/php.ini
sudo sed -i 's/^max_execution_time = .*/max_execution_time = 300/' /etc/php/8.5/fpm/php.ini
sudo sed -i 's/^max_input_time = .*/max_input_time = 300/' /etc/php/8.5/fpm/php.ini

# Tekshirish
sudo grep -E "^upload_max_filesize|^post_max_size" /etc/php/8.5/fpm/php.ini

# PHP-FPM ni qayta ishga tushirish (MUHIM!)
sudo systemctl restart php8.5-fpm

# Status tekshirish
sudo systemctl status php8.5-fpm
```

### 3. Nginx sozlamalari (agar Nginx ishlatilsa)

```bash
sudo nano /etc/nginx/nginx.conf
```

Yoki site konfiguratsiyasiga qo'shing:

```nginx
client_max_body_size 12M;
```

Keyin Nginx ni qayta ishga tushiring:

```bash
sudo systemctl restart nginx
```

### 4. Apache sozlamalari (agar Apache ishlatilsa)

`.htaccess` fayli allaqachon yangilandi. Agar ishlamasa, `php.ini` ni o'zgartiring:

```bash
sudo nano /etc/php/8.5/apache2/php.ini
```

Keyin Apache ni qayta ishga tushiring:

```bash
sudo systemctl restart apache2
```

## Tekshirish

### CLI PHP sozlamalari

```bash
php -i | grep -E "upload_max_filesize|post_max_size"
```

**Eslatma:** Bu CLI PHP sozlamalarini ko'rsatadi!

### PHP-FPM sozlamalari (web server uchun)

```bash
sudo grep -E "^upload_max_filesize|^post_max_size" /etc/php/8.5/fpm/php.ini
```

### Web orqali tekshirish (eng ishonchli)

#### Variant A: Test route orqali (yaratilgan)

```bash
curl http://localhost:8001/api/test-php-settings
```

Yoki brauzerda:

```
http://localhost:8001/api/test-php-settings
```

Bu qaysi server ishlatilayotganini va sozlamalarni ko'rsatadi.

#### Variant B: phpinfo() orqali

`public/test-php.php` fayl yarating:

```php
<?php
header('Content-Type: application/json');
echo json_encode([
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_execution_time' => ini_get('max_execution_time'),
    'max_input_time' => ini_get('max_input_time'),
    'php_sapi_name' => php_sapi_name(),
], JSON_PRETTY_PRINT);
?>
```

Keyin brauzerda oching:

```
http://localhost:8001/test-php.php
```

#### Variant C: Laravel Tinker (CLI PHP - web server uchun emas!)

```bash
php artisan tinker
>>> ini_get('upload_max_filesize')
>>> ini_get('post_max_size')
```

**Eslatma:** Tinker CLI PHP sozlamalarini ko'rsatadi, web server PHP-FPM sozlamalarini emas!

## Eslatma

-   `post_max_size` har doim `upload_max_filesize` dan katta bo'lishi kerak
-   `max_execution_time` va `max_input_time` katta fayllar uchun oshirilishi kerak
-   O'zgarishlar kuchga kirishi uchun server ni qayta ishga tushirish kerak
-   **Muhim:** `php artisan serve` CLI PHP ishlatadi! CLI PHP sozlamalarini o'zgartirish kerak!
-   **Muhim:** PHP-FPM sozlamalarini o'zgartirgandan keyin `sudo systemctl restart php8.5-fpm` bajarish kerak!
-   **Muhim:** CLI PHP sozlamalarini o'zgartirgandan keyin Laravel server ni qayta ishga tushirish kerak!
