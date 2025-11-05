from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import uuid


class TimeStampedModel(models.Model):
    """Abstract base model with timestamp fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(TimeStampedModel):
    """Şirket modeli"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        verbose_name=_("Şirket Ünvanı"),
        help_text=_("Resmi şirket ünvanı")
    )
    tax_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Vergi Numarası"),
        validators=[RegexValidator(
            regex=r'^\d{10}$',
            message=_("Vergi numarası 10 haneli olmalıdır")
        )]
    )
    email = models.EmailField(verbose_name=_("E-posta"))
    iban = models.CharField(
        max_length=34,
        blank=True,
        null=True,
        verbose_name=_("IBAN"),
        validators=[RegexValidator(
            regex=r'^TR\d{24}$',
            message=_("Geçerli bir TR IBAN giriniz")
        )]
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Açıklama")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Aktif")
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Ek Bilgiler")
    )

    class Meta:
        db_table = 'companies'
        verbose_name = _("Şirket")
        verbose_name_plural = _("Şirketler")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tax_number']),
            models.Index(fields=['title']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title

    @property
    def brand_count(self):
        return self.brands.count()

    @property
    def total_branches(self):
        return Branch.objects.filter(brand__company=self).count()

    @property
    def total_people(self):
        return Person.objects.filter(branch__brand__company=self).count()


class Brand(TimeStampedModel):
    """Marka modeli"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=255,
        verbose_name=_("Marka Adı")
    )
    tax_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Vergi Numarası")
    )
    phone = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        verbose_name=_("Telefon")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("E-posta")
    )
    branch_count = models.IntegerField(
        default=0,
        verbose_name=_("Şube Sayısı"),
        help_text=_("Otomatik hesaplanır")
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='brands',
        verbose_name=_("Şirket")
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Ek Bilgiler")
    )

    class Meta:
        db_table = 'brands'
        verbose_name = _("Marka")
        verbose_name_plural = _("Markalar")
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'name'],
                name='unique_brand_per_company'
            )
        ]
        indexes = [
            models.Index(fields=['company', 'name']),
        ]

    def __str__(self):
        return f"{self.company.title} - {self.name}"

    def update_branch_count(self):
        """Şube sayısını güncelle"""
        self.branch_count = self.branches.count()
        self.save(update_fields=['branch_count', 'updated_at'])


class Branch(TimeStampedModel):
    """Şube modeli"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=255,
        verbose_name=_("Şube Adı")
    )
    address = models.TextField(verbose_name=_("Adres"))
    phone = models.CharField(
        max_length=30,
        verbose_name=_("Telefon")
    )
    email = models.EmailField(verbose_name=_("E-posta"))
    sgk_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("SGK Numarası")
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='branches',
        verbose_name=_("Marka")
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Ek Bilgiler")
    )

    class Meta:
        db_table = 'branches'
        verbose_name = _("Şube")
        verbose_name_plural = _("Şubeler")
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['brand', 'name'],
                name='unique_branch_per_brand'
            )
        ]
        indexes = [
            models.Index(fields=['brand', 'name']),
        ]

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

    @property
    def company(self):
        return self.brand.company

    @property
    def employee_count(self):
        return self.people.filter(role__name='employee').count()


class Role(TimeStampedModel):
    """Rol modeli - Dinamik roller için"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Rol Adı")
    )
    display_name = models.CharField(
        max_length=100,
        verbose_name=_("Görünen Ad")
    )
    permissions = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Yetkiler"),
        help_text=_("JSON formatında yetki seti")
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Açıklama")
    )

    class Meta:
        db_table = 'roles'
        verbose_name = _("Rol")
        verbose_name_plural = _("Roller")
        ordering = ['name']

    def __str__(self):
        return self.display_name


class Person(TimeStampedModel):
    """Kişi modeli - Çalışan, Yatırımcı, Ortak vb."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(
        max_length=255,
        verbose_name=_("Ad Soyad")
    )
    national_id = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        verbose_name=_("TC Kimlik No"),
        validators=[RegexValidator(
            regex=r'^\d{11}$',
            message=_("TC Kimlik numarası 11 haneli olmalıdır")
        )]
    )
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Adres")
    )
    phone = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        verbose_name=_("Telefon")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("E-posta")
    )
    iban = models.CharField(
        max_length=34,
        blank=True,
        null=True,
        verbose_name=_("IBAN"),
        validators=[RegexValidator(
            regex=r'^TR\d{24}$',
            message=_("Geçerli bir TR IBAN giriniz")
        )]
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Açıklama")
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='people',
        verbose_name=_("Rol")
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='people',
        verbose_name=_("Şube")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Aktif")
    )

    class Meta:
        db_table = 'people'
        verbose_name = _("Kişi")
        verbose_name_plural = _("Kişiler")
        ordering = ['full_name']
        indexes = [
            models.Index(fields=['branch', 'full_name']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.role.display_name})"

    @property
    def masked_national_id(self):
        """TC Kimlik numarasını maskele"""
        if self.national_id and len(self.national_id) == 11:
            return f"{self.national_id[:3]}****{self.national_id[-2:]}"
        return None

    @property
    def masked_iban(self):
        """IBAN'ı maskele"""
        if self.iban and len(self.iban) >= 10:
            return f"{self.iban[:6]}****{self.iban[-4:]}"
        return None


class Report(TimeStampedModel):
    """Rapor modeli"""
    REPORT_TYPE_CHOICES = [
        ('daily', _('Günlük')),
        ('weekly', _('Haftalık')),
        ('monthly', _('Aylık')),
        ('yearly', _('Yıllık')),
        ('custom', _('Özel')),
    ]

    SCOPE_CHOICES = [
        ('company', _('Şirket')),
        ('brand', _('Marka')),
        ('branch', _('Şube')),
        ('person', _('Kişi')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        verbose_name=_("Başlık")
    )
    content = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("İçerik Özeti")
    )
    file = models.FileField(
        upload_to='reports/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_("Dosya")
    )
    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPE_CHOICES,
        verbose_name=_("Rapor Türü")
    )
    scope = models.CharField(
        max_length=20,
        choices=SCOPE_CHOICES,
        verbose_name=_("Kapsam")
    )
    report_date = models.DateField(verbose_name=_("Rapor Tarihi"))
    
    # İlişkiler (nullable - scope'a göre doldurulur)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )
    person = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )
    
    tags = models.JSONField(
        blank=True,
        null=True,
        default=list,
        verbose_name=_("Etiketler")
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Meta Veri")
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_reports',
        verbose_name=_("Oluşturan")
    )

    class Meta:
        db_table = 'reports'
        verbose_name = _("Rapor")
        verbose_name_plural = _("Raporlar")
        ordering = ['-report_date', '-created_at']
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['report_date']),
            models.Index(fields=['scope']),
            models.Index(fields=['company']),
            models.Index(fields=['brand']),
            models.Index(fields=['branch']),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_report_type_display()}"

    def clean(self):
        """Scope'a göre ilişki doğrulaması"""
        if self.scope == 'company' and not self.company:
            raise ValidationError(_("Şirket seçilmelidir"))
        elif self.scope == 'brand' and not self.brand:
            raise ValidationError(_("Marka seçilmelidir"))
        elif self.scope == 'branch' and not self.branch:
            raise ValidationError(_("Şube seçilmelidir"))
        elif self.scope == 'person' and not self.person:
            raise ValidationError(_("Kişi seçilmelidir"))


class Contract(TimeStampedModel):
    """Sözleşme modeli"""
    STATUS_CHOICES = [
        ('draft', _('Taslak')),
        ('active', _('Aktif')),
        ('expired', _('Süresi Dolmuş')),
        ('terminated', _('Feshedilmiş')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        verbose_name=_("Başlık")
    )
    contract_number = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Sözleşme Numarası")
    )
    template_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Şablon Adı")
    )
    file = models.FileField(
        upload_to='contracts/%Y/%m/',
        verbose_name=_("Dosya")
    )
    
    # İlişkiler
    related_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='contracts',
        null=True,
        blank=True
    )
    related_brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='contracts',
        null=True,
        blank=True
    )
    related_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='contracts',
        null=True,
        blank=True
    )
    related_person = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='contracts',
        null=True,
        blank=True
    )
    
    start_date = models.DateField(verbose_name=_("Başlangıç Tarihi"))
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Bitiş Tarihi")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_("Durum")
    )
    versioning = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Versiyon Geçmişi")
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contracts',
        verbose_name=_("Oluşturan")
    )

    class Meta:
        db_table = 'contracts'
        verbose_name = _("Sözleşme")
        verbose_name_plural = _("Sözleşmeler")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['contract_number']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
        ]

    def __str__(self):
        return f"{self.contract_number} - {self.title}"

    @property
    def is_active(self):
        from django.utils import timezone
        if self.status != 'active':
            return False
        if self.end_date and self.end_date < timezone.now().date():
            return False
        return True


class PromissoryNote(TimeStampedModel):
    """Senet modeli"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', _('Beklemede')),
        ('paid', _('Ödendi')),
        ('overdue', _('Vadesi Geçti')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        verbose_name=_("Başlık")
    )
    note_number = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Senet Numarası")
    )
    file = models.FileField(
        upload_to='promissory_notes/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_("Dosya")
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Tutar")
    )
    due_date = models.DateField(verbose_name=_("Vade Tarihi"))
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        verbose_name=_("Ödeme Durumu")
    )
    
    # İlişkiler
    related_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='promissory_notes',
        null=True,
        blank=True
    )
    related_brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='promissory_notes',
        null=True,
        blank=True
    )
    related_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='promissory_notes',
        null=True,
        blank=True
    )
    related_person = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='promissory_notes',
        null=True,
        blank=True
    )
    
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Meta Veri")
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_notes',
        verbose_name=_("Oluşturan")
    )

    class Meta:
        db_table = 'promissory_notes'
        verbose_name = _("Senet")
        verbose_name_plural = _("Senetler")
        ordering = ['due_date', '-created_at']
        indexes = [
            models.Index(fields=['note_number']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.note_number} - {self.amount} TL"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.payment_status == 'pending'


class FinancialRecord(TimeStampedModel):
    """Mali kayıt modeli"""
    TYPE_CHOICES = [
        ('income', _('Gelir')),
        ('expense', _('Gider')),
        ('turnover', _('Ciro')),
        ('profit_share', _('Kar Payı')),
    ]

    CURRENCY_CHOICES = [
        ('TRY', _('Türk Lirası')),
        ('USD', _('Amerikan Doları')),
        ('EUR', _('Euro')),
        ('GBP', _('İngiliz Sterlini')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        verbose_name=_("Başlık")
    )
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name=_("Tür")
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Tutar")
    )
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='TRY',
        verbose_name=_("Para Birimi")
    )
    date = models.DateField(verbose_name=_("Tarih"))
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Açıklama")
    )
    
    # İlişkiler
    related_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='financial_records',
        null=True,
        blank=True
    )
    related_brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='financial_records',
        null=True,
        blank=True
    )
    related_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='financial_records',
        null=True,
        blank=True
    )
    related_person = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='financial_records',
        null=True,
        blank=True
    )
    
    attachments = models.FileField(
        upload_to='financial_records/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_("Ekler")
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        verbose_name=_("Meta Veri")
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_financial_records',
        verbose_name=_("Oluşturan")
    )

    class Meta:
        db_table = 'financial_records'
        verbose_name = _("Mali Kayıt")
        verbose_name_plural = _("Mali Kayıtlar")
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['date']),
            models.Index(fields=['currency']),
        ]

    def __str__(self):
        return f"{self.title} - {self.amount} {self.currency}"


class AuditLog(models.Model):
    """Denetim kayıtları modeli"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("Kullanıcı")
    )
    action = models.CharField(
        max_length=50,
        verbose_name=_("Eylem"),
        help_text=_("create, update, delete, view")
    )
    object_type = models.CharField(
        max_length=100,
        verbose_name=_("Nesne Tipi")
    )
    object_id = models.CharField(
        max_length=100,
        verbose_name=_("Nesne ID")
    )
    changes = models.JSONField(
        blank=True,
        null=True,
        verbose_name=_("Değişiklikler")
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Adresi")
    )
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("User Agent")
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Zaman")
    )

    class Meta:
        db_table = 'audit_logs'
        verbose_name = _("Denetim Kaydı")
        verbose_name_plural = _("Denetim Kayıtları")
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['actor']),
            models.Index(fields=['action']),
            models.Index(fields=['object_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        actor_name = self.actor.username if self.actor else "Anonymous"
        return f"{actor_name} - {self.action} - {self.object_type} - {self.timestamp}"