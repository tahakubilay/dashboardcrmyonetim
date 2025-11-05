# 1. Container'ları build edin ve başlatın
docker-compose up --build


# 2. Veritabanı migration'ları çalıştırın (yeni terminal)
docker-compose exec web python manage.py makemigrations core authentication

docker-compose exec web python manage.py migrate

# 3. Superuser oluşturun
docker-compose exec web python manage.py createsuperuser

# 4. Demo veriyi yükleyin (opsiyonel)
docker-compose exec web python manage.py seed_db
