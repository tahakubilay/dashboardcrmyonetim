from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import (
    Brand, Branch, Person, Company, Report, Contract, 
    PromissoryNote, FinancialRecord, AuditLog
)
import json


@receiver([post_save, post_delete], sender=Branch)
def update_brand_branch_count(sender, instance, **kwargs):
    """Şube eklendiğinde/silindiğinde marka şube sayısını güncelle"""
    if instance.brand:
        instance.brand.update_branch_count()


@receiver(post_save, sender=Company)
def log_company_changes(sender, instance, created, **kwargs):
    """Şirket değişikliklerini logla"""
    if created:
        AuditLog.objects.create(
            action='create',
            object_type='Company',
            object_id=str(instance.id),
            changes={'title': instance.title}
        )


@receiver(post_save, sender=Brand)
def log_brand_changes(sender, instance, created, **kwargs):
    """Marka değişikliklerini logla"""
    if created:
        AuditLog.objects.create(
            action='create',
            object_type='Brand',
            object_id=str(instance.id),
            changes={'name': instance.name, 'company': str(instance.company.id)}
        )


@receiver(post_save, sender=Branch)
def log_branch_changes(sender, instance, created, **kwargs):
    """Şube değişikliklerini logla"""
    if created:
        AuditLog.objects.create(
            action='create',
            object_type='Branch',
            object_id=str(instance.id),
            changes={'name': instance.name, 'brand': str(instance.brand.id)}
        )


@receiver(post_save, sender=Person)
def log_person_changes(sender, instance, created, **kwargs):
    """Kişi değişikliklerini logla"""
    if created:
        AuditLog.objects.create(
            action='create',
            object_type='Person',
            object_id=str(instance.id),
            changes={
                'full_name': instance.full_name,
                'role': instance.role.name if instance.role else None,
                'branch': str(instance.branch.id)
            }
        )


@receiver(post_delete, sender=Company)
def log_company_deletion(sender, instance, **kwargs):
    """Şirket silinmesini logla"""
    AuditLog.objects.create(
        action='delete',
        object_type='Company',
        object_id=str(instance.id),
        changes={'title': instance.title}
    )


@receiver(post_delete, sender=Brand)
def log_brand_deletion(sender, instance, **kwargs):
    """Marka silinmesini logla"""
    AuditLog.objects.create(
        action='delete',
        object_type='Brand',
        object_id=str(instance.id),
        changes={'name': instance.name}
    )
