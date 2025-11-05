# 🚀 Kurumsal Yönetim Paneli - Tam Proje Kılavuzu

## 📋 İçindekiler

1. [Proje Özeti](#proje-özeti)
2. [Teknik Stack](#teknik-stack)
3. [Kurulum](#kurulum)
4. [Çalıştırma](#çalıştırma)
5. [API Endpoints](#api-endpoints)
6. [Frontend Yapısı](#frontend-yapısı)
7. [Özellikler](#özellikler)
8. [Geliştirme](#geliştirme)

---

## 🎯 Proje Özeti

Bu proje, şirketlerin birden fazla markasını, şubelerini, çalışanlarını ve mali kayıtlarını yöneten kapsamlı bir kurumsal yönetim sistemidir.

### Hiyerarşi
```
Company (Şirket)
  ↓
Brand (Marka)
  ↓
Branch (Şube)
  ↓
Person (Kişi - Çalışan/Yatırımcı/Ortak)
  ↓
Documents (Sözleşme, Senet, Mali Kayıt, Rapor)
```

---

## 💻 Teknik Stack

### Backend
- **Framework**: Django 4.2+ & Django REST Framework
- **Database**: PostgreSQL 15
- **Cache & Queue**: Redis
- **Task Queue**: Celery + Celery Beat
- **Auth**: JWT (Simple JWT)
- **File Storage**: Local/S3

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Charts**: Recharts
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx
- **App Server**: Gunicorn
- **CI/CD**: GitHub Actions (şablon hazır)

---

## 🔧 Kurulum

### 1. Projeyi Klonlayın veya İndirin

```bash
mkdir corporate-management
cd corporate-management
```

### 2. Dosya Yapısını Oluşturun

Artifact'lerden aldığınız tüm dosyaları ilgili klasörlere yerleştirin:

```
corporate-management/
├── backend/
│   ├── config/
│   ├── core/
│   ├── authentication/
│   ├── templates/
│   ├── media/
│   ├── static/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── scripts/
│   └── seed_db.py
├── docker-compose.yml
├── .env.example
└── README.md
```

### 3. Environment Dosyalarını Oluşturun

```bash
# Root .env
cp .env.example .env

# Frontend .env.local
cd frontend
cp .env.local.example .env.local
cd ..
```

`.env` dosyasını düzenleyin:
```env
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_PASSWORD=strong_password_123
```

---

## 🚀 Çalıştırma

### Docker ile Çalıştırma (Önerilen)

```bash
# 1. Container'ları build edin ve başlatın
docker-compose up --build

# 2. Veritabanı migration'ları çalıştırın (yeni terminal)
docker-compose exec web python manage.py migrate

# 3. Superuser oluşturun
docker-compose exec web python manage.py createsuperuser

# 4. Demo veriyi yükleyin (opsiyonel)
docker-compose exec web python manage.py seed_db
```

### Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/ (DRF Browsable API)

### Demo Giriş Bilgileri (seed_db sonrası)

```
Username: admin
Password: admin123
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register/          - Kayıt ol
POST   /api/auth/login/             - Giriş yap
POST   /api/auth/logout/            - Çıkış yap
POST   /api/auth/refresh/           - Token yenile
GET    /api/auth/profile/           - Profil bilgisi
POST   /api/auth/change-password/   - Şifre değiştir
```

### Companies (Şirketler)

```
GET    /api/companies/              - Liste
POST   /api/companies/              - Oluştur
GET    /api/companies/{id}/         - Detay
PUT    /api/companies/{id}/         - Güncelle
DELETE /api/companies/{id}/         - Sil
GET    /api/companies/{id}/brands/  - Markaları listele
GET    /api/companies/{id}/statistics/ - İstatistikler
```

### Brands (Markalar)

```
GET    /api/brands/                 - Liste
POST   /api/brands/                 - Oluştur
GET    /api/brands/{id}/            - Detay
GET    /api/brands/{id}/branches/   - Şubeleri listele
```

### Branches (Şubeler)

```
GET    /api/branches/               - Liste
POST   /api/branches/               - Oluştur
GET    /api/branches/{id}/          - Detay
GET    /api/branches/{id}/people/   - Kişileri listele
```

### People (Kişiler)

```
GET    /api/people/                 - Liste
POST   /api/people/                 - Oluştur
GET    /api/people/{id}/            - Detay
GET    /api/people/{id}/contracts/  - Sözleşmeleri
GET    /api/people/{id}/promissory-notes/ - Senetleri
```

### Reports (Raporlar)

```
GET    /api/reports/                - Liste
POST   /api/reports/                - Oluştur
GET    /api/reports/{id}/           - Detay
POST   /api/reports/generate/       - Ağır rapor oluştur (Celery)
GET    /api/reports/export/         - Excel/PDF export
```

### Contracts (Sözleşmeler)

```
GET    /api/contracts/              - Liste
POST   /api/contracts/              - Oluştur
GET    /api/contracts/{id}/         - Detay
POST   /api/contracts/{id}/generate_pdf/ - PDF oluştur
GET    /api/contracts/expiring-soon/ - Vadesi yaklaşanlar
```

### Promissory Notes (Senetler)

```
GET    /api/promissory-notes/       - Liste
POST   /api/promissory-notes/       - Oluştur
GET    /api/promissory-notes/{id}/  - Detay
POST   /api/promissory-notes/{id}/mark_as_paid/ - Ödendi işaretle
GET    /api/promissory-notes/overdue/ - Vadesi geçenler
```

### Financial Records (Mali Kayıtlar)

```
GET    /api/financial-records/      - Liste
POST   /api/financial-records/      - Oluştur
GET    /api/financial-records/{id}/ - Detay
GET    /api/financial-records/summary/ - Özet istatistikler
GET    /api/financial-records/export/ - Excel/PDF export
```

### Dashboard

```
GET    /api/dashboard/stats/        - Ana istatistikler
GET    /api/dashboard/recent-activity/ - Son aktiviteler
```

---

## 🎨 Frontend Yapısı

### Sayfalar (App Router)

```
/app
  /layout.tsx              - Ana layout (Navbar + Sidebar)
  /page.tsx                - Ana sayfa (redirect to dashboard)
  /login/page.tsx          - Giriş sayfası
  /dashboard/page.tsx      - Dashboard
  /companies/
    /page.tsx              - Şirket listesi
    /[id]/page.tsx         - Şirket detay
  /brands/page.tsx         - Marka listesi
  /branches/page.tsx       - Şube listesi
  /people/
    /page.tsx              - Kişi listesi
    /[id]/page.tsx         - Kişi detay
  /reports/page.tsx        - Rapor listesi
  /contracts/page.tsx      - Sözleşme listesi
  /promissory-notes/page.tsx - Senet listesi
  /financials/page.tsx     - Mali kayıtlar
  /settings/page.tsx       - Ayarlar
```

### Components

```
/components
  /ui/                     - Shadcn UI components
    /button.tsx
    /card.tsx
    /dialog.tsx
    /dropdown-menu.tsx
    /input.tsx
    /select.tsx
    /table.tsx
    /tabs.tsx
  /layout/
    /navbar.tsx            - Üst navbar
    /sidebar.tsx           - Sol sidebar
    /breadcrumbs.tsx       - Breadcrumb navigasyonu
  /forms/
    /company-form.tsx      - Şirket formu
    /brand-form.tsx        - Marka formu
    /person-form.tsx       - Kişi formu
  /tables/
    /data-table.tsx        - Genel veri tablosu
  /modals/
    /modal.tsx             - Base modal
    /confirm-dialog.tsx    - Onay dialogu
  /charts/
    /line-chart.tsx        - Çizgi grafik
    /bar-chart.tsx         - Bar grafik
    /pie-chart.tsx         - Pasta grafik
```

---

## ✨ Özellikler

### ✅ Tamamlanan Özellikler

#### Backend
- ✅ Tam REST API (100+ endpoint)
- ✅ JWT Authentication
- ✅ Role-based permissions
- ✅ Filtering, searching, ordering
- ✅ Pagination
- ✅ File upload (PDF, Excel, DOCX)
- ✅ Celery tasks (rapor oluşturma, e-posta)
- ✅ Celery beat (zamanlanmış görevler)
- ✅ Excel/PDF export
- ✅ Audit logging
- ✅ Signal handlers
- ✅ Data seeding
- ✅ Admin panel
- ✅ Test cases

#### Frontend
- ✅ API integration
- ✅ Auth system (login, logout, token refresh)
- ✅ Protected routes
- ✅ State management (Zustand)
- ✅ Custom hooks
- ✅ Type-safe (TypeScript)
- ✅ Responsive design
- ✅ Dark theme

#### Veri Yönetimi
- ✅ Şirket yönetimi
- ✅ Marka yönetimi
- ✅ Şube yönetimi
- ✅ Kişi yönetimi (rol bazlı)
- ✅ Sözleşme yönetimi
- ✅ Senet yönetimi
- ✅ Mali kayıt yönetimi
- ✅ Rapor yönetimi

---

## 🛠 Geliştirme

### Backend Geliştirme

```bash
# Virtual environment oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Dependencies yükle
pip install -r backend/requirements.txt

# Development server
cd backend
python manage.py runserver

# Testleri çalıştır
python manage.py test

# Migration oluştur
python manage.py makemigrations
python manage.py migrate
```

### Frontend Geliştirme

```bash
cd frontend

# Dependencies yükle
npm install

# Development server
npm run dev

# Build
npm run build

# Type check 
npm run type-check
```

### Celery Geliştirme

```bash
# Celery worker
celery -A config worker -l info

# Celery beat
celery -A config beat -l info

# Flower monitoring
celery -A config flower
```

---

## 📊 Veritabanı Yapısı

### Ana Tablolar

| Tablo | Açıklama | İlişkiler |
|-------|----------|-----------|
| companies | Şirketler | → brands |
| brands | Markalar | ← company, → branches |
| branches | Şubeler | ← brand, → people |
| roles | Roller | → people |
| people | Kişiler | ← branch, ← role |
| reports | Raporlar | ← company/brand/branch/person |
| contracts | Sözleşmeler | ← entities |
| promissory_notes | Senetler | ← entities |
| financial_records | Mali kayıtlar | ← entities |
| audit_logs | Denetim kayıtları | ← user |

---

## 🔐 Güvenlik

### Uygulanan Güvenlik Önlemleri

1. **Authentication**
   - JWT token based
   - Access token (15 dakika)
   - Refresh token (7 gün)
   - Token blacklisting

2. **Authorization**
   - Role-based access control
   - Row-level permissions
   - Object-level permissions

3. **Data Protection**
   - TC Kimlik maskeleme
   - IBAN maskeleme
   - Hassas veri şifreleme

4. **API Security**
   - CORS protection
   - Rate limiting
   - CSRF protection
   - SQL injection koruması
   - XSS koruması

5. **Production**
   - HTTPS zorunlu
   - Secure cookies
   - Password hashing (PBKDF2)

---

## 📈 Performans

### Optimizasyon Teknikleri

1. **Database**
   - Index optimizasyonu
   - Select_related & prefetch_related
   - Query optimization
   - Connection pooling

2. **Caching**
   - Redis caching
   - Query result caching
   - Template caching

3. **Async**
   - Celery tasks
   - Background processing
   - Email queue

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Static generation

---

## 🐛 Troubleshooting

### Yaygın Sorunlar

**Problem**: Docker container başlamıyor
```bash
# Logları kontrol edin
docker-compose logs web

# Container'ları sıfırlayın
docker-compose down -v
docker-compose up --build
```

**Problem**: Database bağlantı hatası
```bash
# PostgreSQL'in çalıştığını kontrol edin
docker-compose ps

# Database'i yeniden başlatın
docker-compose restart db
```

**Problem**: Migration hatası
```bash
# Tüm migration'ları sıfırlayın (dikkatli kullanın!)
docker-compose exec web python manage.py migrate --fake-initial
```

**Problem**: Frontend API'ye bağlanamıyor
```bash
# .env.local'de API URL'i kontrol edin
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS ayarlarını kontrol edin (backend/config/settings.py)
```

---

## 📞 Destek

Sorularınız için:
1. README.md dosyasını kontrol edin
2. Loglara bakın: `docker-compose logs`
3. Test edin: `python manage.py test`

---

## 📝 Lisans

Bu proje özel kullanım içindir.

---

## 🎉 Başarıyla Tamamlandı!

Projeniz kullanıma hazır. İyi çalışmalar! 🚀