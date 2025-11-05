import django_filters
from .models import (
    Company, Brand, Branch, Person, Report,
    Contract, PromissoryNote, FinancialRecord
)


class CompanyFilter(django_filters.FilterSet):
    """Şirket filtreleri"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    tax_number = django_filters.CharFilter(lookup_expr='exact')
    email = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Company
        fields = ['title', 'tax_number', 'email', 'is_active']


class BrandFilter(django_filters.FilterSet):
    """Marka filtreleri"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    company = django_filters.UUIDFilter(field_name='company__id')
    company_name = django_filters.CharFilter(field_name='company__title', lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Brand
        fields = ['name', 'company']


class BranchFilter(django_filters.FilterSet):
    """Şube filtreleri"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    brand = django_filters.UUIDFilter(field_name='brand__id')
    company = django_filters.UUIDFilter(field_name='brand__company__id')
    brand_name = django_filters.CharFilter(field_name='brand__name', lookup_expr='icontains')
    company_name = django_filters.CharFilter(field_name='brand__company__title', lookup_expr='icontains')
    address = django_filters.CharFilter(lookup_expr='icontains')
    sgk_number = django_filters.CharFilter(lookup_expr='exact')

    class Meta:
        model = Branch
        fields = ['name', 'brand', 'company']


class PersonFilter(django_filters.FilterSet):
    """Kişi filtreleri"""
    full_name = django_filters.CharFilter(lookup_expr='icontains')
    role = django_filters.UUIDFilter(field_name='role__id')
    role_name = django_filters.CharFilter(field_name='role__name', lookup_expr='exact')
    branch = django_filters.UUIDFilter(field_name='branch__id')
    brand = django_filters.UUIDFilter(field_name='branch__brand__id')
    company = django_filters.UUIDFilter(field_name='branch__brand__company__id')
    is_active = django_filters.BooleanFilter()
    email = django_filters.CharFilter(lookup_expr='icontains')
    phone = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Person
        fields = ['full_name', 'role', 'branch', 'is_active']


class ReportFilter(django_filters.FilterSet):
    """Rapor filtreleri"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    report_type = django_filters.ChoiceFilter(choices=Report.REPORT_TYPE_CHOICES)
    scope = django_filters.ChoiceFilter(choices=Report.SCOPE_CHOICES)
    company = django_filters.UUIDFilter(field_name='company__id')
    brand = django_filters.UUIDFilter(field_name='brand__id')
    branch = django_filters.UUIDFilter(field_name='branch__id')
    person = django_filters.UUIDFilter(field_name='person__id')
    date_from = django_filters.DateFilter(field_name='report_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='report_date', lookup_expr='lte')
    created_by = django_filters.NumberFilter(field_name='created_by__id')
    tags = django_filters.CharFilter(method='filter_tags')

    class Meta:
        model = Report
        fields = ['report_type', 'scope', 'company', 'brand', 'branch', 'person']

    def filter_tags(self, queryset, name, value):
        """Tag'lere göre filtrele"""
        if value:
            return queryset.filter(tags__contains=[value])
        return queryset


class ContractFilter(django_filters.FilterSet):
    """Sözleşme filtreleri"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    contract_number = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Contract.STATUS_CHOICES)
    related_company = django_filters.UUIDFilter(field_name='related_company__id')
    related_brand = django_filters.UUIDFilter(field_name='related_brand__id')
    related_branch = django_filters.UUIDFilter(field_name='related_branch__id')
    related_person = django_filters.UUIDFilter(field_name='related_person__id')
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    is_active = django_filters.BooleanFilter(method='filter_is_active')

    class Meta:
        model = Contract
        fields = ['status', 'related_company', 'related_brand', 'related_branch', 'related_person']

    def filter_is_active(self, queryset, name, value):
        """Aktif sözleşmeleri filtrele"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                status='active',
                end_date__gte=timezone.now().date()
            )
        return queryset


class PromissoryNoteFilter(django_filters.FilterSet):
    """Senet filtreleri"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    note_number = django_filters.CharFilter(lookup_expr='icontains')
    payment_status = django_filters.ChoiceFilter(choices=PromissoryNote.PAYMENT_STATUS_CHOICES)
    related_company = django_filters.UUIDFilter(field_name='related_company__id')
    related_brand = django_filters.UUIDFilter(field_name='related_brand__id')
    related_branch = django_filters.UUIDFilter(field_name='related_branch__id')
    related_person = django_filters.UUIDFilter(field_name='related_person__id')
    due_date_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')

    class Meta:
        model = PromissoryNote
        fields = ['payment_status', 'related_company', 'related_brand', 'related_branch', 'related_person']

    def filter_is_overdue(self, queryset, name, value):
        """Vadesi geçmiş senetleri filtrele"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now().date(),
                payment_status='pending'
            )
        return queryset


class FinancialRecordFilter(django_filters.FilterSet):
    """Mali kayıt filtreleri"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    type = django_filters.ChoiceFilter(choices=FinancialRecord.TYPE_CHOICES)
    currency = django_filters.ChoiceFilter(choices=FinancialRecord.CURRENCY_CHOICES)
    related_company = django_filters.UUIDFilter(field_name='related_company__id')
    related_brand = django_filters.UUIDFilter(field_name='related_brand__id')
    related_branch = django_filters.UUIDFilter(field_name='related_branch__id')
    related_person = django_filters.UUIDFilter(field_name='related_person__id')
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')

    class Meta:
        model = FinancialRecord
        fields = ['type', 'currency', 'related_company', 'related_brand', 'related_branch', 'related_person']
