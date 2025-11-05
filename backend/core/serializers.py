from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Company, Brand, Branch, Person, Role, Report,
    Contract, PromissoryNote, FinancialRecord, AuditLog
)
from django.utils import timezone


# ============================================
# USER SERIALIZERS
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """Kullanıcı serializer"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ============================================
# ROLE SERIALIZERS
# ============================================

class RoleSerializer(serializers.ModelSerializer):
    """Rol serializer"""
    person_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'display_name', 'description', 'permissions', 
                  'person_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'person_count']

    def get_person_count(self, obj):
        return obj.people.count()


# ============================================
# COMPANY SERIALIZERS
# ============================================

class CompanyListSerializer(serializers.ModelSerializer):
    """Şirket liste serializer (hafif)"""
    brand_count = serializers.IntegerField(read_only=True)
    total_branches = serializers.IntegerField(read_only=True)
    total_people = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'title', 'tax_number', 'email', 'iban', 'is_active',
                  'brand_count', 'total_branches', 'total_people', 'created_at']
        read_only_fields = ['id', 'created_at']


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Şirket detay serializer"""
    brand_count = serializers.IntegerField(read_only=True)
    total_branches = serializers.IntegerField(read_only=True)
    total_people = serializers.IntegerField(read_only=True)
    brands = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'title', 'tax_number', 'email', 'iban', 'description',
                  'is_active', 'metadata', 'brand_count', 'total_branches', 
                  'total_people', 'brands', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_brands(self, obj):
        """İlişkili markaları getir"""
        brands = obj.brands.all()[:10]  # İlk 10 marka
        return BrandListSerializer(brands, many=True).data

    def validate_tax_number(self, value):
        """Vergi numarası doğrulama"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Vergi numarası 10 haneli olmalıdır")
        return value

    def validate_iban(self, value):
        """IBAN doğrulama"""
        if value and not value.startswith('TR'):
            raise serializers.ValidationError("IBAN TR ile başlamalıdır")
        if value and len(value) != 26:
            raise serializers.ValidationError("Geçerli bir TR IBAN giriniz")
        return value


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Şirket oluşturma serializer"""
    
    class Meta:
        model = Company
        fields = ['title', 'tax_number', 'email', 'iban', 'description', 
                  'is_active', 'metadata']

    def validate_tax_number(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Vergi numarası 10 haneli olmalıdır")
        return value


# ============================================
# BRAND SERIALIZERS
# ============================================

class BrandListSerializer(serializers.ModelSerializer):
    """Marka liste serializer"""
    company_name = serializers.CharField(source='company.title', read_only=True)
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Brand
        fields = ['id', 'name', 'email', 'phone', 'branch_count', 
                  'company_id', 'company_name', 'created_at']
        read_only_fields = ['id', 'branch_count', 'created_at']


class BrandDetailSerializer(serializers.ModelSerializer):
    """Marka detay serializer"""
    company_name = serializers.CharField(source='company.title', read_only=True)
    company = CompanyListSerializer(read_only=True)
    company_id = serializers.UUIDField(write_only=True)
    branches = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'tax_number', 'phone', 'email', 'branch_count',
                  'company', 'company_id', 'company_name', 'branches', 
                  'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'branch_count', 'created_at', 'updated_at']

    def get_branches(self, obj):
        """İlişkili şubeleri getir"""
        branches = obj.branches.all()[:10]
        return BranchListSerializer(branches, many=True).data

    def create(self, validated_data):
        company_id = validated_data.pop('company_id')
        company = Company.objects.get(id=company_id)
        validated_data['company'] = company
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'company_id' in validated_data:
            company_id = validated_data.pop('company_id')
            instance.company = Company.objects.get(id=company_id)
        return super().update(instance, validated_data)


class BrandCreateSerializer(serializers.ModelSerializer):
    """Marka oluşturma serializer"""
    
    class Meta:
        model = Brand
        fields = ['name', 'tax_number', 'phone', 'email', 'company', 'metadata']


# ============================================
# BRANCH SERIALIZERS
# ============================================

class BranchListSerializer(serializers.ModelSerializer):
    """Şube liste serializer"""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    company_name = serializers.CharField(source='brand.company.title', read_only=True)
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone', 'email', 'sgk_number',
                  'brand_name', 'company_name', 'employee_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class BranchDetailSerializer(serializers.ModelSerializer):
    """Şube detay serializer"""
    brand = BrandListSerializer(read_only=True)
    brand_id = serializers.UUIDField(write_only=True)
    company_name = serializers.CharField(source='brand.company.title', read_only=True)
    employee_count = serializers.IntegerField(read_only=True)
    people_by_role = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone', 'email', 'sgk_number',
                  'brand', 'brand_id', 'company_name', 'employee_count',
                  'people_by_role', 'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_people_by_role(self, obj):
        """Role göre kişi sayıları"""
        from django.db.models import Count
        result = obj.people.values('role__name', 'role__display_name').annotate(
            count=Count('id')
        )
        return {item['role__display_name']: item['count'] for item in result}

    def create(self, validated_data):
        brand_id = validated_data.pop('brand_id')
        brand = Brand.objects.get(id=brand_id)
        validated_data['brand'] = brand
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'brand_id' in validated_data:
            brand_id = validated_data.pop('brand_id')
            instance.brand = Brand.objects.get(id=brand_id)
        return super().update(instance, validated_data)


class BranchCreateSerializer(serializers.ModelSerializer):
    """Şube oluşturma serializer"""
    
    class Meta:
        model = Branch
        fields = ['name', 'address', 'phone', 'email', 'sgk_number', 'brand', 'metadata']


# ============================================
# PERSON SERIALIZERS
# ============================================

class PersonListSerializer(serializers.ModelSerializer):
    """Kişi liste serializer"""
    role_name = serializers.CharField(source='role.display_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    company_name = serializers.CharField(source='branch.brand.company.title', read_only=True)
    masked_national_id = serializers.CharField(read_only=True)

    class Meta:
        model = Person
        fields = ['id', 'full_name', 'masked_national_id', 'phone', 'email',
                  'role_name', 'branch_name', 'company_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PersonDetailSerializer(serializers.ModelSerializer):
    """Kişi detay serializer"""
    role = RoleSerializer(read_only=True)
    role_id = serializers.UUIDField(write_only=True)
    branch = BranchListSerializer(read_only=True)
    branch_id = serializers.UUIDField(write_only=True)
    masked_national_id = serializers.CharField(read_only=True)
    masked_iban = serializers.CharField(read_only=True)
    
    # İlişkili dokümanlar
    contracts_count = serializers.SerializerMethodField()
    promissory_notes_count = serializers.SerializerMethodField()
    financial_records_count = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = ['id', 'full_name', 'national_id', 'masked_national_id',
                  'address', 'phone', 'email', 'iban', 'masked_iban',
                  'description', 'role', 'role_id', 'branch', 'branch_id',
                  'is_active', 'contracts_count', 'promissory_notes_count',
                  'financial_records_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'national_id': {'write_only': True},
            'iban': {'write_only': True},
        }

    def get_contracts_count(self, obj):
        return obj.contracts.count()

    def get_promissory_notes_count(self, obj):
        return obj.promissory_notes.count()

    def get_financial_records_count(self, obj):
        return obj.financial_records.count()

    def create(self, validated_data):
        role_id = validated_data.pop('role_id')
        branch_id = validated_data.pop('branch_id')
        validated_data['role'] = Role.objects.get(id=role_id)
        validated_data['branch'] = Branch.objects.get(id=branch_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'role_id' in validated_data:
            instance.role = Role.objects.get(id=validated_data.pop('role_id'))
        if 'branch_id' in validated_data:
            instance.branch = Branch.objects.get(id=validated_data.pop('branch_id'))
        return super().update(instance, validated_data)

    def validate_national_id(self, value):
        """TC Kimlik doğrulama"""
        if value and (not value.isdigit() or len(value) != 11):
            raise serializers.ValidationError("TC Kimlik numarası 11 haneli olmalıdır")
        return value


class PersonCreateSerializer(serializers.ModelSerializer):
    """Kişi oluşturma serializer"""
    
    class Meta:
        model = Person
        fields = ['full_name', 'national_id', 'address', 'phone', 'email',
                  'iban', 'description', 'role', 'branch', 'is_active']


# ============================================
# REPORT SERIALIZERS
# ============================================

class ReportListSerializer(serializers.ModelSerializer):
    """Rapor liste serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    scope_display = serializers.CharField(source='get_scope_display', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'title', 'report_type', 'report_type_display', 'scope',
                  'scope_display', 'report_date', 'file', 'tags', 
                  'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReportDetailSerializer(serializers.ModelSerializer):
    """Rapor detay serializer"""
    created_by = UserSerializer(read_only=True)
    company = CompanyListSerializer(read_only=True)
    brand = BrandListSerializer(read_only=True)
    branch = BranchListSerializer(read_only=True)
    person = PersonListSerializer(read_only=True)
    
    # Write-only ID fields
    company_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    brand_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    branch_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    person_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Report
        fields = ['id', 'title', 'content', 'file', 'report_type', 'scope',
                  'report_date', 'company', 'company_id', 'brand', 'brand_id',
                  'branch', 'branch_id', 'person', 'person_id', 'tags',
                  'metadata', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Scope'a göre ilişki doğrulama"""
        scope = data.get('scope')
        if scope == 'company' and not data.get('company_id'):
            raise serializers.ValidationError({"company_id": "Şirket seçilmelidir"})
        elif scope == 'brand' and not data.get('brand_id'):
            raise serializers.ValidationError({"brand_id": "Marka seçilmelidir"})
        elif scope == 'branch' and not data.get('branch_id'):
            raise serializers.ValidationError({"branch_id": "Şube seçilmelidir"})
        elif scope == 'person' and not data.get('person_id'):
            raise serializers.ValidationError({"person_id": "Kişi seçilmelidir"})
        return data

    def create(self, validated_data):
        # ID'lerden nesneleri çöz
        if 'company_id' in validated_data:
            validated_data['company'] = Company.objects.get(id=validated_data.pop('company_id'))
        if 'brand_id' in validated_data:
            validated_data['brand'] = Brand.objects.get(id=validated_data.pop('brand_id'))
        if 'branch_id' in validated_data:
            validated_data['branch'] = Branch.objects.get(id=validated_data.pop('branch_id'))
        if 'person_id' in validated_data:
            validated_data['person'] = Person.objects.get(id=validated_data.pop('person_id'))
        
        # created_by'ı request'ten al
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


# ============================================
# CONTRACT SERIALIZERS
# ============================================

class ContractListSerializer(serializers.ModelSerializer):
    """Sözleşme liste serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    related_entity = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = ['id', 'title', 'contract_number', 'status', 'status_display',
                  'start_date', 'end_date', 'is_active', 'related_entity', 
                  'created_at']
        read_only_fields = ['id', 'created_at']

    def get_related_entity(self, obj):
        """İlgili entity bilgisi"""
        if obj.related_person:
            return f"Kişi: {obj.related_person.full_name}"
        elif obj.related_branch:
            return f"Şube: {obj.related_branch.name}"
        elif obj.related_brand:
            return f"Marka: {obj.related_brand.name}"
        elif obj.related_company:
            return f"Şirket: {obj.related_company.title}"
        return "Belirtilmemiş"


class ContractDetailSerializer(serializers.ModelSerializer):
    """Sözleşme detay serializer"""
    created_by = UserSerializer(read_only=True)
    related_company = CompanyListSerializer(read_only=True)
    related_brand = BrandListSerializer(read_only=True)
    related_branch = BranchListSerializer(read_only=True)
    related_person = PersonListSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    # Write-only ID fields
    related_company_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_brand_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_branch_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_person_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Contract
        fields = ['id', 'title', 'contract_number', 'template_name', 'file',
                  'related_company', 'related_company_id', 'related_brand',
                  'related_brand_id', 'related_branch', 'related_branch_id',
                  'related_person', 'related_person_id', 'start_date',
                  'end_date', 'status', 'is_active', 'versioning', 'created_by',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # ID'lerden nesneleri çöz
        if 'related_company_id' in validated_data:
            validated_data['related_company'] = Company.objects.get(id=validated_data.pop('related_company_id'))
        if 'related_brand_id' in validated_data:
            validated_data['related_brand'] = Brand.objects.get(id=validated_data.pop('related_brand_id'))
        if 'related_branch_id' in validated_data:
            validated_data['related_branch'] = Branch.objects.get(id=validated_data.pop('related_branch_id'))
        if 'related_person_id' in validated_data:
            validated_data['related_person'] = Person.objects.get(id=validated_data.pop('related_person_id'))
        
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Otomatik contract_number oluştur
        if not validated_data.get('contract_number'):
            from datetime import datetime
            year = datetime.now().year
            count = Contract.objects.filter(contract_number__startswith=f'SZL-{year}').count()
            validated_data['contract_number'] = f'SZL-{year}-{count+1:04d}'
        
        return super().create(validated_data)


# ============================================
# PROMISSORY NOTE SERIALIZERS
# ============================================

class PromissoryNoteListSerializer(serializers.ModelSerializer):
    """Senet liste serializer"""
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    related_entity = serializers.SerializerMethodField()

    class Meta:
        model = PromissoryNote
        fields = ['id', 'title', 'note_number', 'amount', 'due_date',
                  'payment_status', 'payment_status_display', 'is_overdue',
                  'related_entity', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_related_entity(self, obj):
        if obj.related_person:
            return f"Kişi: {obj.related_person.full_name}"
        elif obj.related_branch:
            return f"Şube: {obj.related_branch.name}"
        return "Belirtilmemiş"


class PromissoryNoteDetailSerializer(serializers.ModelSerializer):
    """Senet detay serializer"""
    created_by = UserSerializer(read_only=True)
    related_company = CompanyListSerializer(read_only=True)
    related_brand = BrandListSerializer(read_only=True)
    related_branch = BranchListSerializer(read_only=True)
    related_person = PersonListSerializer(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    # Write-only ID fields
    related_company_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_brand_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_branch_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_person_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = PromissoryNote
        fields = ['id', 'title', 'note_number', 'file', 'amount', 'due_date',
                  'payment_status', 'is_overdue', 'related_company', 'related_company_id',
                  'related_brand', 'related_brand_id', 'related_branch',
                  'related_branch_id', 'related_person', 'related_person_id',
                  'metadata', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # ID'lerden nesneleri çöz
        if 'related_company_id' in validated_data:
            validated_data['related_company'] = Company.objects.get(id=validated_data.pop('related_company_id'))
        if 'related_brand_id' in validated_data:
            validated_data['related_brand'] = Brand.objects.get(id=validated_data.pop('related_brand_id'))
        if 'related_branch_id' in validated_data:
            validated_data['related_branch'] = Branch.objects.get(id=validated_data.pop('related_branch_id'))
        if 'related_person_id' in validated_data:
            validated_data['related_person'] = Person.objects.get(id=validated_data.pop('related_person_id'))
        
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Otomatik note_number oluştur
        if not validated_data.get('note_number'):
            from datetime import datetime
            year = datetime.now().year
            count = PromissoryNote.objects.filter(note_number__startswith=f'SNT-{year}').count()
            validated_data['note_number'] = f'SNT-{year}-{count+1:04d}'
        
        return super().create(validated_data)


# ============================================
# FINANCIAL RECORD SERIALIZERS
# ============================================

class FinancialRecordListSerializer(serializers.ModelSerializer):
    """Mali kayıt liste serializer"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)

    class Meta:
        model = FinancialRecord
        fields = ['id', 'title', 'type', 'type_display', 'amount', 'currency',
                  'currency_display', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']


class FinancialRecordDetailSerializer(serializers.ModelSerializer):
    """Mali kayıt detay serializer"""
    created_by = UserSerializer(read_only=True)
    related_company = CompanyListSerializer(read_only=True)
    related_brand = BrandListSerializer(read_only=True)
    related_branch = BranchListSerializer(read_only=True)
    related_person = PersonListSerializer(read_only=True)
    
    # Write-only ID fields
    related_company_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_brand_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_branch_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_person_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FinancialRecord
        fields = ['id', 'title', 'type', 'amount', 'currency', 'date',
                  'description', 'related_company', 'related_company_id',
                  'related_brand', 'related_brand_id', 'related_branch',
                  'related_branch_id', 'related_person', 'related_person_id',
                  'attachments', 'metadata', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # ID'lerden nesneleri çöz
        if 'related_company_id' in validated_data:
            validated_data['related_company'] = Company.objects.get(id=validated_data.pop('related_company_id'))
        if 'related_brand_id' in validated_data:
            validated_data['related_brand'] = Brand.objects.get(id=validated_data.pop('related_brand_id'))
        if 'related_branch_id' in validated_data:
            validated_data['related_branch'] = Branch.objects.get(id=validated_data.pop('related_branch_id'))
        if 'related_person_id' in validated_data:
            validated_data['related_person'] = Person.objects.get(id=validated_data.pop('related_person_id'))
        
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


# ============================================
# AUDIT LOG SERIALIZERS
# ============================================

class AuditLogSerializer(serializers.ModelSerializer):
    """Audit log serializer"""
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_name', 'action', 'object_type',
                  'object_id', 'changes', 'ip_address', 'user_agent', 'timestamp']
        read_only_fields = ['id', 'timestamp']


# ============================================
# STATISTICS SERIALIZERS
# ============================================

class DashboardStatsSerializer(serializers.Serializer):
    """Dashboard istatistikleri"""
    companies_count = serializers.IntegerField()
    brands_count = serializers.IntegerField()
    branches_count = serializers.IntegerField()
    people_count = serializers.IntegerField()
    reports_count = serializers.IntegerField()
    contracts_count = serializers.IntegerField()
    promissory_notes_count = serializers.IntegerField()
    financial_records_count = serializers.IntegerField()
    recent_companies = CompanyListSerializer(many=True)
    recent_reports = ReportListSerializer(many=True)
    overdue_notes = PromissoryNoteListSerializer(many=True)