import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('corporate_management')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'generate-daily-reports': {
        'task': 'core.tasks.generate_scheduled_reports',
        'schedule': crontab(hour=0, minute=0),  # Her gün gece yarısı
    },
}