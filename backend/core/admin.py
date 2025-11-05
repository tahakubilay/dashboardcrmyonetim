from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Company, Brand, Branch, Person, Role, Report, 
    Contract, PromissoryNote, FinancialRecord, AuditLog
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['title', 'tax_number', 'email', 'is_active', 'brand_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'tax_number', 'email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('title', 'tax_number', 'email', 'iban')
        }),
        ('Detaylar', {
            'fields': ('description', 'is_active', 'metadata')
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def brand_count(self, obj):
        return obj.brand_count
    brand_count.short_description = 'Marka Sayısı'


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'branch_count', 'email', 'created_at']
    list_filter = ['company', 'created_at']
    search_fields = ['name', 'email', 'company__title']
    readonly_fields = ['branch_count', 'created_at', 'updated_at']
    autocomplete_fields = ['company']
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('name', 'company', 'tax_number', 'email', 'phone')
        }),
        ('İstatistikler', {
            'fields': ('branch_count',)
        }),
        ('Detaylar', {
            'fields': ('metadata',)
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'get_company', 'phone', 'email', 'created_at']
    list_filter = ['brand__company', 'brand', 'created_at']
    search_fields = ['name', 'address', 'phone', 'email', 'brand__name']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['brand']
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('name', 'brand', 'address')
        }),
        ('İletişim', {
            'fields': ('phone', 'email', 'sgk_number')
        }),
        ('Detaylar', {
            'fields': ('metadata',)
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_company(self, obj):
        return obj.company.title
    get_company.short_description = 'Şirket'


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'created_at']
    search_fields = ['name', 'display_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('name', 'display_name', 'description')
        }),
        ('Yetkiler', {
            'fields': ('permissions',)
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'role', 'branch', 'phone', 'email', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'branch__brand__company', 'created_at']
    search_fields = ['full_name', 'national_id', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at', 'masked_national_id', 'masked_iban']
    autocomplete_fields = ['branch', 'role']
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('full_name', 'role', 'branch', 'is_active')
        }),
        ('Kimlik Bilgileri', {
            'fields': ('national_id', 'masked_national_id')
        }),
        ('İletişim', {
            'fields': ('phone', 'email', 'address')
        }),
        ('Mali Bilgiler', {
            'fields': ('iban', 'masked_iban')
        }),
        ('Detaylar', {
            'fields': ('description',)
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'scope', 'report_date', 'created_by', 'created_at']
    list_filter = ['report_type', 'scope', 'report_date', 'created_at']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['company', 'brand', 'branch', 'person', 'created_by']
    date_hierarchy = 'report_date'
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('title', 'report_type', 'scope', 'report_date')
        }),
        ('İçerik', {
            'fields': ('content', 'file', 'tags')
        }),
        ('İlişkiler', {
            'fields': ('company', 'brand', 'branch', 'person')
        }),
        ('Detaylar', {
            'fields': ('metadata', 'created_by')
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['contract_number', 'title', 'status', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['status', 'start_date', 'created_at']
    search_fields = ['contract_number', 'title', 'template_name']
    readonly_fields = ['created_at', 'updated_at', 'is_active']
    autocomplete_fields = ['related_company', 'related_brand', 'related_branch', 'related_person', 'created_by']
    date_hierarchy = 'start_date'
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('title', 'contract_number', 'template_name', 'status')
        }),
        ('Tarihler', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Dosya', {
            'fields': ('file',)
        }),
        ('İlişkiler', {
            'fields': ('related_company', 'related_brand', 'related_branch', 'related_person')
        }),
        ('Versiyon', {
            'fields': ('versioning', 'created_by')
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def is_active(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Aktif</span>')
        return format_html('<span style="color: red;">✗ Pasif</span>')
    is_active.short_description = 'Durum'


@admin.register(PromissoryNote)
class PromissoryNoteAdmin(admin.ModelAdmin):
    list_display = ['note_number', 'title', 'amount', 'due_date', 'payment_status', 'is_overdue', 'created_at']
    list_filter = ['payment_status', 'due_date', 'created_at']
    search_fields = ['note_number', 'title']
    readonly_fields = ['created_at', 'updated_at', 'is_overdue']
    autocomplete_fields = ['related_company', 'related_brand', 'related_branch', 'related_person', 'created_by']
    date_hierarchy = 'due_date'
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('title', 'note_number', 'amount', 'due_date', 'payment_status')
        }),
        ('Dosya', {
            'fields': ('file',)
        }),
        ('İlişkiler', {
            'fields': ('related_company', 'related_brand', 'related_branch', 'related_person')
        }),
        ('Detaylar', {
            'fields': ('metadata', 'created_by')
        }),
        ('Durum', {
            'fields': ('is_overdue',)
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red; font-weight: bold;">⚠ Vadesi Geçti</span>')
        return format_html('<span style="color: green;">✓ Vadesi Gelmedi</span>')
    is_overdue.short_description = 'Vade Durumu'


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'amount', 'currency', 'date', 'created_by', 'created_at']
    list_filter = ['type', 'currency', 'date', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['related_company', 'related_brand', 'related_branch', 'related_person', 'created_by']
    date_hierarchy = 'date'
    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('title', 'type', 'amount', 'currency', 'date')
        }),
        ('Açıklama', {
            'fields': ('description', 'attachments')
        }),
        ('İlişkiler', {
            'fields': ('related_company', 'related_brand', 'related_branch', 'related_person')
        }),
        ('Detaylar', {
            'fields': ('metadata', 'created_by')
        }),
        ('Zaman Damgaları', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['actor', 'action', 'object_type', 'object_id', 'timestamp', 'ip_address']
    list_filter = ['action', 'object_type', 'timestamp']
    search_fields = ['actor__username', 'object_type', 'object_id', 'ip_address']
    readonly_fields = ['actor', 'action', 'object_type', 'object_id', 'changes', 'ip_address', 'user_agent', 'timestamp']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Sadece superuser silebilir
        return request.user.is_superuser