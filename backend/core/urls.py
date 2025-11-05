from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, BrandViewSet, BranchViewSet, PersonViewSet,
    RoleViewSet, ReportViewSet, ContractViewSet,
    PromissoryNoteViewSet, FinancialRecordViewSet,
    AuditLogViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'people', PersonViewSet, basename='person')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'promissory-notes', PromissoryNoteViewSet, basename='promissory-note')
router.register(r'financial-records', FinancialRecordViewSet, basename='financial-record')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
