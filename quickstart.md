# 🚀 Kurumsal Yönetim Paneli - Hızlı Başlangıç

## ✅ Oluşturulan Tüm Dosyalar

### 📦 Artifact Listesi (Sırayla Oluşturun)

1. **corporate-management-project** - Ana README ve Docker setup
2. **backend-models** - Django models (11 model)
3. **backend-signals-admin** - Signals ve Admin panel
4. **backend-apps-init** - App configs  
5. **backend-seed-script** - Demo veri script
6. **backend-management-command** - Management command
7. **backend-serializers** - DRF serializers (18+)
8. **backend-views** - ViewSets (11)
9. **backend-filters-permissions** - Filters ve Permissions
10. **backend-urls-utils** - URLs ve Utils
11. **backend-celery-tasks** - Celery tasks (12)
12. **backend-authentication** - Auth modülü
13. **frontend-base-config** - Frontend config files
14. **frontend-api-auth** - API ve Auth utilities
15. **frontend-layout-components** - Navbar, Sidebar
16. **frontend-dashboard-page** - Dashboard sayfası
17. **frontend-login-page** - Login sayfası
18. **frontend-company-pages** - Company liste ve detay
19. **frontend-ui-components** - Shadcn UI components
20. **frontend-data-table-forms** - DataTable ve Forms

---

## 📁 Dosya Yerleştirme Rehberi

### 1. Root Dizin Dosyaları
```
corporate-management/
├── docker-compose.yml          # Artifact #1'den
├── .env.example                # Artifact #1'den
├── README.md                   # Artifact #14'ten (project-complete-guide)
└── nginx/
    ├── Dockerfile              # Aşağıda
    └── nginx.conf              # Aşağıda
```

### 2. Backend Dosyaları
```
backend/
├── Dockerfile                  # Artifact #1'den
├── requirements.txt            # Artifact #1'den
├── manage.py                   # Artifact #1'den
├── config/
│   ├── __init__.py            # Artifact #5'ten
│   ├── settings.py            # Artifact #1'den
│   ├── urls.py                # Artifact #1'den
│   ├── wsgi.py                # Artifact #1'den
│   └── celery.py              # Artifact #1'den
├── core/
│   ├── __init__.py            # Artifact #5'ten
│   ├── apps.py                # Artifact #5'ten
│   ├── models.py              # Artifact #2'den
│   ├── serializers.py         # Artifact #7'den
│   ├── views.py               # Artifact #8'den
│   ├── filters.py             # Artifact #9'dan
│   ├── permissions.py         # Artifact #9'dan
│   ├── urls.py                # Artifact #10'dan
│   ├── utils.py               # Artifact #10'dan
│   ├── tasks.py               # Artifact #11'den
│   ├── signals.py             # Artifact #3'ten
│   ├── admin.py               # Artifact #3'ten
│   └── management/
│       └── commands/
│           └── seed_db.py     # Artifact #6'dan
├── authentication/
│   ├── __init__.py            # Artifact #5'ten
│   ├── serializers.py         # Artifact #12'den
│   ├── views.py               # Artifact #12'den
│   ├── urls.py                # Artifact #12'den
│   └── tests.py               # Artifact #12'den
├── templates/
│   └── contracts/
│       └── (şablon dosyaları)
├── media/
└── static/
```

### 3. Frontend Dosyaları
```
frontend/
├── Dockerfile                 # Artifact #13'ten
├── package.json               # Artifact #13'ten
├── next.config.js             # Artifact #13'ten
├── tailwind.config.js         # Artifact #13'ten
├── tsconfig.json              # Artifact #13'ten
├── postcss.config.js          # Artifact #13'ten
├── .eslintrc.json             # Artifact #13'ten
├── .env.local.example         # Artifact #13'ten
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx         # Artifact #15'ten
    │   ├── page.tsx           # Artifact #17'den
    │   ├── providers.tsx      # Artifact #15'ten
    │   ├── globals.css        # Artifact #15'ten
    │   ├── login/
    │   │   └── page.tsx       # Artifact #17'den
    │   ├── dashboard/
    │   │   └── page.tsx       # Artifact #16'dan
    │   ├── companies/
    │   │   ├── page.tsx       # Artifact #18'den
    │   │   └── [id]/
    │   │       └── page.tsx   # Artifact #18'den
    │   └── (diğer sayfalar benzer yapı)
    ├── components/
    │   ├── layout/
    │   │   ├── navbar.tsx              # Artifact #15'ten
    │   │   ├── sidebar.tsx             # Artifact #15'ten
    │   │   ├── breadcrumbs.tsx         # Artifact #15'ten
    │   │   └── protected-layout.tsx    # Artifact #15'ten
    │   ├── dashboard/
    │   │   ├── stats-card.tsx          # Artifact #16'dan
    │   │   ├── quick-actions.tsx       # Artifact #16'dan
    │   │   ├── recent-activity.tsx     # Artifact #16'dan
    │   │   ├── overdue-notes.tsx       # Artifact #16'dan
    │   │   └── financial-chart.tsx     # Artifact #16'dan
    │   ├── tables/
    │   │   └── data-table.tsx          # Artifact #20'den
    │   ├── forms/
    │   │   └── company-form-modal.tsx  # Artifact #20'den
    │   └── ui/ (Shadcn components)
    │       ├── button.tsx              # Artifact #19'dan
    │       ├── card.tsx                # Artifact #19'dan
    │       ├── input.tsx               # Artifact #19'dan
    │       ├── label.tsx               # Artifact #17'den
    │       ├── dialog.tsx              # Artifact #19'dan
    │       ├── dropdown-menu.tsx       # Artifact #19'dan
    │       ├── avatar.tsx              # Artifact #19'dan
    │       ├── alert.tsx               # Artifact #17'den
    │       ├── badge.tsx               # Artifact #17'den
    │       ├── tabs.tsx                # Artifact #17'den
    │       ├── table.tsx               # Artifact #20'den
    │       ├── select.tsx              # Artifact #20'den
    │       ├── scroll-area.tsx         # Artifact #15'ten
    │       └── toaster.tsx             # Artifact #19'dan
    ├── lib/
    │   ├── api.ts                      # Artifact #14'ten
    │   ├── auth.ts                     # Artifact #14'ten
    │   ├── store.ts                    # Artifact #14'ten
    │   ├── utils.ts                    # Artifact #14'ten
    │   └── cn.ts                       # Artifact #13'ten
    ├── hooks/
    │   ├── useAuth.ts                  # Artifact #14'ten
    │   ├── useApi.ts                   # Artifact #14'ten
    │   └── useToast.ts                 # Artifact #14'ten
    └── types/
        └── index.ts                    # Artifact #13'ten
```

---

## 🔧 Kurulum Adımları (5 Dakika)

### 1. Dosyaları Yerleştirin
```bash
# Proje klasörü oluşturun
mkdir corporate-management
cd corporate-management

# Backend ve frontend klasörlerini oluşturun
mkdir -p backend/core/management/commands
mkdir -p backend/authentication
mkdir -p frontend/src/{app,components,lib,hooks,types}
mkdir nginx
```

### 2. Environment Dosyalarını Hazırlayın
```bash
# Root .env
cp .env.example .env

# Frontend .env.local
cd frontend
cp .env.local.example .env.local
cd ..

# .env dosyasını düzenleyin
nano .env  # veya vi, code, vb.
```

**Minimum .env içeriği:**
```env
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
DATABASE_PASSWORD=your_secure_password_here
```

### 3. Docker ile Başlatın
```bash
# Container'ları build edin ve çalıştırın
docker-compose up --build -d

# Logları izleyin (opsiyonel)
docker-compose logs -f
```

### 4. Veritabanını Hazırlayın
```bash
# Migration'ları çalıştırın
docker-compose exec web python manage.py migrate

# Superuser oluşturun
docker-compose exec web python manage.py createsuperuser

# Demo veriyi yükleyin
docker-compose exec web python manage.py seed_db
```

### 5. Erişim
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

**Demo Giriş:**
- Username: `admin`
- Password: `admin123`

---

## 📋 Eksik Dosyalar (Opsiyonel)

### Nginx Config
Eğer nginx klasörü yoksa:

**nginx/Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server web:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /admin {
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }

        location /static {
            alias /app/static;
        }

        location /media {
            alias /app/media;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
        }
    }
}
```

---

## 🐛 Sorun Giderme

### Problem: Container başlamıyor
```bash
# Logları kontrol edin
docker-compose logs web
docker-compose logs frontend

# Container'ları yeniden başlatın
docker-compose down -v
docker-compose up --build
```

### Problem: Port çakışması
```bash
# Çalışan servisleri kontrol edin
sudo lsof -i :3000
sudo lsof -i :8000

# docker-compose.yml'de portları değiştirin
# örn: 3001:3000, 8001:8000
```

### Problem: Database bağlantı hatası
```bash
# PostgreSQL'in hazır olmasını bekleyin
docker-compose exec db pg_isready

# Manuel migration deneyin
docker-compose exec web python manage.py migrate --fake-initial
```

### Problem: Frontend API'ye bağlanamıyor
```bash
# .env.local dosyasını kontrol edin
cat frontend/.env.local

# NEXT_PUBLIC_API_URL doğru olmalı
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 Sonraki Adımlar

### Geliştirme İçin
1. **Hot Reload**: Docker volume mount'ları otomatik yenileme sağlar
2. **Debug**: VSCode için launch.json ekleyin
3. **Test**: `docker-compose exec web python manage.py test`

### Production İçin
1. **Environment**: `DEBUG=False` yapın, güçlü SECRET_KEY kullanın
2. **HTTPS**: SSL sertifikası ekleyin (Let's Encrypt)
3. **Database**: Yedekleme stratejisi oluşturun
4. **Monitoring**: Sentry, Prometheus ekleyin
5. **Scaling**: Gunicorn workers artırın

---

## 🎯 Özet Checklist

- [ ] Tüm artifact'leri kopyaladım
- [ ] Dosya yapısını oluşturdum
- [ ] .env dosyalarını hazırladım
- [ ] `docker-compose up --build` çalıştırdım
- [ ] Migration'ları yaptım
- [ ] Superuser oluşturdum
- [ ] Demo veriyi yükledim
- [ ] http://localhost:3000 açılıyor
- [ ] http://localhost:8000/admin açılıyor
- [ ] Login yapabiliyorum

**Tebrikler! Projeniz çalışıyor! 🎉**

---

## 💡 İpuçları

- **Celery**: `docker-compose logs celery` ile background task'leri izleyin
- **Frontend Dev**: `cd frontend && npm run dev` ile standalone çalıştırabilirsiniz
- **Backend Dev**: `cd backend && python manage.py runserver` ile standalone çalıştırabilirsiniz
- **Database**: pgAdmin veya DBeaver ile PostgreSQL'e bağlanabilirsiniz

**Başarılar! 🚀**