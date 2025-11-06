from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Sum, Prefetch
from django.utils import timezone
from datetime import timedelta

from .models import (
    Company, Brand, Branch, Person, Role, Report,
    Contract, PromissoryNote, FinancialRecord, AuditLog
)
from .serializers import (
    CompanyListSerializer, CompanyDetailSerializer, CompanyCreateSerializer,
    BrandListSerializer, BrandDetailSerializer, BrandCreateSerializer,
    BranchListSerializer, BranchDetailSerializer, BranchCreateSerializer,
    PersonListSerializer, PersonDetailSerializer, PersonCreateSerializer,
    RoleSerializer, ReportListSerializer, ReportDetailSerializer,
    ContractListSerializer, ContractDetailSerializer,
    PromissoryNoteListSerializer, PromissoryNoteDetailSerializer,
    FinancialRecordListSerializer, FinancialRecordDetailSerializer,
    AuditLogSerializer, DashboardStatsSerializer
)
from .permissions import IsOwnerOrReadOnly, CanManageCompany
from .filters import (
    CompanyFilter, BrandFilter, BranchFilter, PersonFilter,
    ReportFilter, ContractFilter, PromissoryNoteFilter, FinancialRecordFilter
)


# ============================================
# COMPANY VIEWSET
# ============================================

class CompanyViewSet(viewsets.ModelViewSet):
    """Şirket ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CompanyFilter
    search_fields = ['title', 'tax_number', 'email']
    ordering_fields = ['title', 'created_at', 'tax_number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action == 'create':
            return CompanyCreateSerializer
        return CompanyDetailSerializer

    def get_queryset(self):
        """Optimize query with annotations"""
        from django.db.models import Count
        queryset = Company.objects.all()
    
    # Her durumda annotation'ları ekle
        queryset = queryset.annotate(
            brand_count=Count('brands', distinct=True),
            total_branches=Count('brands__branches', distinct=True),
            total_people=Count('brands__branches__people', distinct=True)
        )
    
        if self.action == 'retrieve':
            # Detail view için daha detaylı prefetch
            queryset = queryset.prefetch_related(
                Prefetch('brands', queryset=Brand.objects.all()[:5])
            )
    
        return queryset

    @action(detail=True, methods=['get'])
    def brands(self, request, pk=None):
        """Şirkete ait markaları listele"""
        company = self.get_object()
        brands = company.brands.all()
        serializer = BrandListSerializer(brands, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Şirket istatistikleri"""
        company = self.get_object()
        stats = {
            'brands_count': company.brands.count(),
            'branches_count': Branch.objects.filter(brand__company=company).count(),
            'people_count': Person.objects.filter(branch__brand__company=company).count(),
            'contracts_count': Contract.objects.filter(related_company=company).count(),
            'financial_records_count': FinancialRecord.objects.filter(related_company=company).count(),
            'total_income': FinancialRecord.objects.filter(
                related_company=company, type='income'
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_expense': FinancialRecord.objects.filter(
                related_company=company, type='expense'
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Şirketi aktif/pasif yap"""
        company = self.get_object()
        company.is_active = not company.is_active
        company.save()
        return Response({'is_active': company.is_active})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Toplu silme"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'ids gerekli'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = Company.objects.filter(id__in=ids).delete()[0]
        return Response({'deleted_count': deleted_count})

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export (Excel/PDF)"""
        from .utils import export_companies_to_excel, export_companies_to_pdf
        
        export_format = request.query_params.get('format', 'excel')
        queryset = self.filter_queryset(self.get_queryset())
        
        if export_format == 'excel':
            file_url = export_companies_to_excel(queryset)
            return Response({'download_url': file_url, 'format': 'excel'})
        elif export_format == 'pdf':
            file_url = export_companies_to_pdf(queryset)
            return Response({'download_url': file_url, 'format': 'pdf'})
        
        return Response({'error': 'Geçersiz format'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# BRAND VIEWSET
# ============================================

class BrandViewSet(viewsets.ModelViewSet):
    """Marka ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BrandFilter
    search_fields = ['name', 'email', 'phone', 'company__title']
    ordering_fields = ['name', 'created_at', 'branch_count']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return BrandListSerializer
        elif self.action == 'create':
            return BrandCreateSerializer
        return BrandDetailSerializer

    def get_queryset(self):
        return Brand.objects.select_related('company').prefetch_related('branches')

    @action(detail=True, methods=['get'])
    def branches(self, request, pk=None):
        """Markaya ait şubeleri listele"""
        brand = self.get_object()
        branches = brand.branches.all()
        serializer = BranchListSerializer(branches, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Marka istatistikleri"""
        brand = self.get_object()
        stats = {
            'branches_count': brand.branches.count(),
            'people_count': Person.objects.filter(branch__brand=brand).count(),
            'contracts_count': Contract.objects.filter(related_brand=brand).count(),
        }
        return Response(stats)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Toplu silme"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'ids gerekli'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = Brand.objects.filter(id__in=ids).delete()[0]
        return Response({'deleted_count': deleted_count})


# ============================================
# BRANCH VIEWSET
# ============================================

class BranchViewSet(viewsets.ModelViewSet):
    """Şube ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BranchFilter
    search_fields = ['name', 'address', 'phone', 'email', 'sgk_number']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return BranchListSerializer
        elif self.action == 'create':
            return BranchCreateSerializer
        return BranchDetailSerializer

    def get_queryset(self):
        from django.db.models import Count, Q
        queryset = Branch.objects.select_related('brand', 'brand__company')
    
        # Her durumda employee_count ekle
        queryset = queryset.annotate(
            employee_count=Count('people', filter=Q(people__role__name='employee'), distinct=True)
        )
    
        return queryset

    @action(detail=True, methods=['get'])
    def people(self, request, pk=None):
        """Şubeye ait kişileri listele"""
        branch = self.get_object()
        people = branch.people.all()
        
        # Role filtresi
        role = request.query_params.get('role', None)
        if role:
            people = people.filter(role__name=role)
        
        serializer = PersonListSerializer(people, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Şube istatistikleri"""
        branch = self.get_object()
        stats = {
            'people_count': branch.people.count(),
            'employees_count': branch.people.filter(role__name='employee').count(),
            'investors_count': branch.people.filter(role__name='investor').count(),
            'partners_count': branch.people.filter(role__name='partner').count(),
            'contracts_count': Contract.objects.filter(related_branch=branch).count(),
            'financial_records_count': FinancialRecord.objects.filter(related_branch=branch).count(),
        }
        return Response(stats)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Toplu silme"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'ids gerekli'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = Branch.objects.filter(id__in=ids).delete()[0]
        return Response({'deleted_count': deleted_count})


# ============================================
# ROLE VIEWSET
# ============================================

class RoleViewSet(viewsets.ModelViewSet):
    """Rol ViewSet"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'display_name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


# ============================================
# PERSON VIEWSET
# ============================================

class PersonViewSet(viewsets.ModelViewSet):
    """Kişi ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PersonFilter
    search_fields = ['full_name', 'phone', 'email', 'national_id']
    ordering_fields = ['full_name', 'created_at']
    ordering = ['full_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PersonListSerializer
        elif self.action == 'create':
            return PersonCreateSerializer
        return PersonDetailSerializer

    def get_queryset(self):
        return Person.objects.select_related(
            'role', 'branch', 'branch__brand', 'branch__brand__company'
        )

    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        """Kişiye ait sözleşmeleri listele"""
        person = self.get_object()
        contracts = person.contracts.all()
        serializer = ContractListSerializer(contracts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def promissory_notes(self, request, pk=None):
        """Kişiye ait senetleri listele"""
        person = self.get_object()
        notes = person.promissory_notes.all()
        serializer = PromissoryNoteListSerializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def financial_records(self, request, pk=None):
        """Kişiye ait mali kayıtları listele"""
        person = self.get_object()
        records = person.financial_records.all()
        serializer = FinancialRecordListSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Kişiyi aktif/pasif yap"""
        person = self.get_object()
        person.is_active = not person.is_active
        person.save()
        return Response({'is_active': person.is_active})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Toplu silme"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'ids gerekli'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = Person.objects.filter(id__in=ids).delete()[0]
        return Response({'deleted_count': deleted_count})


# ============================================
# REPORT VIEWSET
# ============================================

class ReportViewSet(viewsets.ModelViewSet):
    """Rapor ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ReportFilter
    search_fields = ['title', 'content']
    ordering_fields = ['title', 'report_date', 'created_at']
    ordering = ['-report_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        return ReportDetailSerializer

    def get_queryset(self):
        return Report.objects.select_related(
            'created_by', 'company', 'brand', 'branch', 'person'
        )

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Rapor oluştur (heavy operation - Celery ile)"""
        from .tasks import generate_report_task
        
        scope = request.data.get('scope')
        report_type = request.data.get('report_type')
        entity_id = request.data.get('entity_id')
        
        # Celery task başlat
        task = generate_report_task.delay(
            user_id=request.user.id,
            scope=scope,
            report_type=report_type,
            entity_id=entity_id
        )
        
        return Response({
            'task_id': task.id,
            'status': 'processing',
            'message': 'Rapor oluşturuluyor...'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Raporları export et (Excel/PDF)"""
        from .utils import export_reports_to_excel, export_reports_to_pdf
        
        export_format = request.query_params.get('format', 'excel')
        queryset = self.filter_queryset(self.get_queryset())
        
        if export_format == 'excel':
            file_path = export_reports_to_excel(queryset)
            return Response({'download_url': file_path, 'format': 'excel'})
        elif export_format == 'pdf':
            file_path = export_reports_to_pdf(queryset)
            return Response({'download_url': file_path, 'format': 'pdf'})
        
        return Response({'error': 'Geçersiz format'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# CONTRACT VIEWSET
# ============================================

class ContractViewSet(viewsets.ModelViewSet):
    """Sözleşme ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContractFilter
    search_fields = ['title', 'contract_number']
    ordering_fields = ['contract_number', 'start_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContractListSerializer
        return ContractDetailSerializer

    def get_queryset(self):
        return Contract.objects.select_related(
            'created_by', 'related_company', 'related_brand', 'related_branch', 'related_person'
        )

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Sözleşmeden PDF oluştur"""
        contract = self.get_object()
        from .tasks import generate_contract_pdf_task
        
        task = generate_contract_pdf_task.delay(str(contract.id))
        
        return Response({
            'task_id': task.id,
            'status': 'processing',
            'message': 'PDF oluşturuluyor...'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Yakında süresini dolacak sözleşmeler"""
        days = int(request.query_params.get('days', 30))
        threshold_date = timezone.now().date() + timedelta(days=days)
        
        contracts = self.get_queryset().filter(
            status='active',
            end_date__lte=threshold_date,
            end_date__gte=timezone.now().date()
        )
        
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)


# ============================================
# PROMISSORY NOTE VIEWSET
# ============================================

class PromissoryNoteViewSet(viewsets.ModelViewSet):
    """Senet ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PromissoryNoteFilter
    search_fields = ['title', 'note_number']
    ordering_fields = ['note_number', 'due_date', 'amount', 'created_at']
    ordering = ['due_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return PromissoryNoteListSerializer
        return PromissoryNoteDetailSerializer

    def get_queryset(self):
        return PromissoryNote.objects.select_related(
            'created_by', 'related_company', 'related_brand', 'related_branch', 'related_person'
        )

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Senedi ödendi olarak işaretle"""
        note = self.get_object()
        note.payment_status = 'paid'
        note.save()
        return Response({'payment_status': note.payment_status})

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Vadesi geçmiş senetler"""
        notes = self.get_queryset().filter(
            due_date__lt=timezone.now().date(),
            payment_status='pending'
        )
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Senet özeti"""
        queryset = self.get_queryset()
        
        summary = {
            'total_count': queryset.count(),
            'pending_count': queryset.filter(payment_status='pending').count(),
            'paid_count': queryset.filter(payment_status='paid').count(),
            'overdue_count': queryset.filter(
                due_date__lt=timezone.now().date(),
                payment_status='pending'
            ).count(),
            'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
            'pending_amount': queryset.filter(
                payment_status='pending'
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
        }
        
        return Response(summary)


# ============================================
# FINANCIAL RECORD VIEWSET
# ============================================

class FinancialRecordViewSet(viewsets.ModelViewSet):
    """Mali Kayıt ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FinancialRecordFilter
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_serializer_class(self):
        if self.action == 'list':
            return FinancialRecordListSerializer
        return FinancialRecordDetailSerializer

    def get_queryset(self):
        return FinancialRecord.objects.select_related(
            'created_by', 'related_company', 'related_brand', 'related_branch', 'related_person'
        )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Mali özet"""
        queryset = self.filter_queryset(self.get_queryset())
        
        summary = {
            'total_records': queryset.count(),
            'total_income': queryset.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_expense': queryset.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_turnover': queryset.filter(type='turnover').aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_profit_share': queryset.filter(type='profit_share').aggregate(Sum('amount'))['amount__sum'] or 0,
        }
        
        summary['net_profit'] = summary['total_income'] - summary['total_expense']
        
        return Response(summary)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Mali kayıtları export et"""
        from .utils import export_financial_records_to_excel, export_financial_records_to_pdf
        
        export_format = request.query_params.get('format', 'excel')
        queryset = self.filter_queryset(self.get_queryset())
        
        if export_format == 'excel':
            file_path = export_financial_records_to_excel(queryset)
            return Response({'download_url': file_path, 'format': 'excel'})
        elif export_format == 'pdf':
            file_path = export_financial_records_to_pdf(queryset)
            return Response({'download_url': file_path, 'format': 'pdf'})
        
        return Response({'error': 'Geçersiz format'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        """Grafik verileri"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Aylık bazda grupla
        from django.db.models.functions import TruncMonth
        monthly_data = queryset.annotate(
            month=TruncMonth('date')
        ).values('month', 'type').annotate(
            total=Sum('amount')
        ).order_by('month')
        
        return Response(list(monthly_data))


# ============================================
# AUDIT LOG VIEWSET
# ============================================

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit Log ViewSet (read-only)"""
    queryset = AuditLog.objects.all().select_related('actor')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'object_type', 'object_id']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


# ============================================
# DASHBOARD VIEWSET
# ============================================

class DashboardViewSet(viewsets.ViewSet):
    """Dashboard istatistikleri"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Genel istatistikler"""
        stats = {
            'companies_count': Company.objects.count(),
            'brands_count': Brand.objects.count(),
            'branches_count': Branch.objects.count(),
            'people_count': Person.objects.count(),
            'reports_count': Report.objects.count(),
            'contracts_count': Contract.objects.count(),
            'promissory_notes_count': PromissoryNote.objects.count(),
            'financial_records_count': FinancialRecord.objects.count(),
            
            # Son eklenenler
            'recent_companies': CompanyListSerializer(
                Company.objects.annotate(
                    brand_count=Count('brands'),
                    total_branches=Count('brands__branches'),
                    total_people=Count('brands__branches__people')
                ).all()[:5], many=True
            ).data,
            'recent_reports': ReportListSerializer(
                Report.objects.all()[:5], many=True
            ).data,
            'overdue_notes': PromissoryNoteListSerializer(
                PromissoryNote.objects.filter(
                    due_date__lt=timezone.now().date(),
                    payment_status='pending'
                )[:5], many=True
            ).data,
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Son aktiviteler"""
        logs = AuditLog.objects.all()[:20]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)