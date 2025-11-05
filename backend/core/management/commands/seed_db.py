"""
Django management command for seeding database
Usage: python manage.py seed_db
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Company, Brand, Branch, Person, Role,
    Report, Contract, PromissoryNote, FinancialRecord
)
from decimal import Decimal
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seeds the database with demo data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('⚠️  Mevcut veriler temizleniyor...'))
            self.clear_data()
        
        self.stdout.write(self.style.SUCCESS('🚀 Demo veri oluşturma başlıyor...\n'))
        
        # Create data
        roles = self.create_roles()
        self.create_users()
        branches = self.create_companies_and_structure()
        people = self.create_people(branches, roles)
        self.create_financial_records(branches)
        self.create_contracts(people)
        self.create_promissory_notes(people)
        self.create_reports(branches)
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('✅ Demo veri başarıyla oluşturuldu!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.print_summary()

    def clear_data(self):
        """Clear existing data"""
        FinancialRecord.objects.all().delete()
        PromissoryNote.objects.all().delete()
        Contract.objects.all().delete()
        Report.objects.all().delete()
        Person.objects.all().delete()
        Branch.objects.all().delete()
        Brand.objects.all().delete()
        Company.objects.all().delete()
        Role.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS('✓ Veriler temizlendi\n'))

    def create_roles(self):
        """Create roles"""
        self.stdout.write('📋 Roller oluşturuluyor...')
        
        roles_data = [
            {
                'name': 'employee',
                'display_name': 'Çalışan',
                'description': 'Şirket çalışanı',
                'permissions': {'can_view': True, 'can_edit': False}
            },
            {
                'name': 'manager',
                'display_name': 'Yönetici',
                'description': 'Şube yöneticisi',
                'permissions': {'can_view': True, 'can_edit': True, 'can_delete': False}
            },
            {
                'name': 'investor',
                'display_name': 'Yatırımcı',
                'description': 'Şirket yatırımcısı',
                'permissions': {'can_view': True, 'can_view_financials': True}
            },
            {
                'name': 'partner',
                'display_name': 'Ortak',
                'description': 'Şirket ortağı',
                'permissions': {'can_view': True, 'can_edit': True, 'can_view_financials': True}
            },
            {
                'name': 'contractor',
                'display_name': 'Taşeron',
                'description': 'Hizmet sağlayıcı',
                'permissions': {'can_view': False}
            },
        ]
        
        roles = []
        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            roles.append(role)
            if created:
                self.stdout.write(f"  ✓ {role.display_name}")
        
        return roles

    def create_users(self):
        """Create users"""
        self.stdout.write('\n👤 Kullanıcılar oluşturuluyor...')
        
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write('  ✓ admin (password: admin123)')

    def create_companies_and_structure(self):
        """Create company structure"""
        self.stdout.write('\n🏢 Şirket yapısı oluşturuluyor...')
        
        companies_data = [
            {
                'title': 'ABC Teknoloji A.Ş.',
                'tax_number': '1234567890',
                'email': 'info@abcteknoloji.com',
                'iban': 'TR330006100519786457841326',
                'description': 'Teknoloji ve yazılım çözümleri',
                'brands': [
                    {
                        'name': 'ABC Yazılım',
                        'email': 'yazilim@abcteknoloji.com',
                        'phone': '+90 212 555 0101',
                        'branches': [
                            {
                                'name': 'Merkez Şube',
                                'address': 'Maslak, Sarıyer, İstanbul',
                                'phone': '+90 212 555 0101',
                                'email': 'merkez@abcyazilim.com',
                                'sgk_number': 'SGK-001',
                            },
                        ]
                    },
                    {
                        'name': 'ABC Danışmanlık',
                        'email': 'danismanlik@abcteknoloji.com',
                        'phone': '+90 212 555 0102',
                        'branches': [
                            {
                                'name': 'Levent Ofis',
                                'address': 'Levent, Beşiktaş, İstanbul',
                                'phone': '+90 212 555 0102',
                                'email': 'levent@abcdanismanlik.com',
                                'sgk_number': 'SGK-002',
                            },
                        ]
                    },
                    {
                        'name': 'ABC Dijital',
                        'email': 'dijital@abcteknoloji.com',
                        'phone': '+90 212 555 0103',
                        'branches': [
                            {
                                'name': 'Kadıköy Şube',
                                'address': 'Kadıköy, İstanbul',
                                'phone': '+90 216 555 0103',
                                'email': 'kadikoy@abcdijital.com',
                                'sgk_number': 'SGK-003',
                            },
                        ]
                    },
                ]
            },
            {
                'title': 'XYZ Holding A.Ş.',
                'tax_number': '9876543210',
                'email': 'info@xyzholding.com',
                'iban': 'TR330006100519786457841327',
                'description': 'Çok sektörlü holding',
                'brands': [
                    {
                        'name': 'XYZ İnşaat',
                        'email': 'insaat@xyzholding.com',
                        'phone': '+90 212 555 0201',
                        'tax_number': '1111222233',
                        'branches': [
                            {
                                'name': 'Proje Merkezi',
                                'address': 'Ataşehir, İstanbul',
                                'phone': '+90 216 555 0201',
                                'email': 'projemerkezi@xyzinsaat.com',
                                'sgk_number': 'SGK-101',
                            },
                        ]
                    },
                    {
                        'name': 'XYZ Enerji',
                        'email': 'enerji@xyzholding.com',
                        'phone': '+90 212 555 0202',
                        'tax_number': '2222333344',
                        'branches': [
                            {
                                'name': 'Santral',
                                'address': 'Kocaeli',
                                'phone': '+90 262 555 0202',
                                'email': 'santral@xyzenerji.com',
                                'sgk_number': 'SGK-102',
                            },
                        ]
                    },
                    {
                        'name': 'XYZ Gıda',
                        'email': 'gida@xyzholding.com',
                        'phone': '+90 212 555 0203',
                        'tax_number': '3333444455',
                        'branches': [
                            {
                                'name': 'Üretim Tesisi',
                                'address': 'Bursa',
                                'phone': '+90 224 555 0203',
                                'email': 'uretim@xyzgida.com',
                                'sgk_number': 'SGK-103',
                            },
                        ]
                    },
                ]
            },
        ]
        
        branches = []
        for company_data in companies_data:
            brands_data = company_data.pop('brands')
            company, _ = Company.objects.get_or_create(
                tax_number=company_data['tax_number'],
                defaults=company_data
            )
            self.stdout.write(f'  ✓ {company.title}')
            
            for brand_data in brands_data:
                branches_data = brand_data.pop('branches')
                brand, _ = Brand.objects.get_or_create(
                    company=company,
                    name=brand_data['name'],
                    defaults=brand_data
                )
                
                for branch_data in branches_data:
                    branch, _ = Branch.objects.get_or_create(
                        brand=brand,
                        name=branch_data['name'],
                        defaults=branch_data
                    )
                    branches.append(branch)
        
        return branches

    def create_people(self, branches, roles):
        """Create people"""
        self.stdout.write('\n👥 Kişiler oluşturuluyor...')
        
        first_names = ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Ahmet', 'Zeynep', 
                      'Mustafa', 'Elif', 'Can', 'Selin', 'Cem', 'Deniz']
        last_names = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk']
        
        employee_role = Role.objects.get(name='employee')
        investor_role = Role.objects.get(name='investor')
        partner_role = Role.objects.get(name='partner')
        
        people = []
        for branch in branches:
            # 5 employees
            for i in range(5):
                person = Person.objects.create(
                    full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    phone=f"+90 5{random.randint(300000000, 599999999)}",
                    email=f"emp{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                    role=employee_role,
                    branch=branch
                )
                people.append(person)
            
            # 5 investors
            for i in range(5):
                person = Person.objects.create(
                    full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    phone=f"+90 5{random.randint(300000000, 599999999)}",
                    email=f"inv{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                    role=investor_role,
                    branch=branch
                )
                people.append(person)
            
            # 3 partners
            for i in range(3):
                person = Person.objects.create(
                    full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    phone=f"+90 5{random.randint(300000000, 599999999)}",
                    email=f"partner{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                    role=partner_role,
                    branch=branch
                )
                people.append(person)
        
        self.stdout.write(f'  ✓ {len(people)} kişi oluşturuldu')
        return people

    def create_financial_records(self, branches):
        """Create financial records"""
        self.stdout.write('\n💰 Mali kayıtlar oluşturuluyor...')
        
        admin = User.objects.get(username='admin')
        count = 0
        
        for branch in branches:
            for _ in range(20):
                FinancialRecord.objects.create(
                    title=f"{branch.name} Kaydı",
                    type=random.choice(['income', 'expense', 'turnover']),
                    amount=Decimal(random.randint(1000, 100000)),
                    currency='TRY',
                    date=date.today() - timedelta(days=random.randint(0, 180)),
                    related_branch=branch,
                    created_by=admin
                )
                count += 1
        
        self.stdout.write(f'  ✓ {count} mali kayıt oluşturuldu')

    def create_contracts(self, people):
        """Create contracts"""
        self.stdout.write('\n📄 Sözleşmeler oluşturuluyor...')
        
        admin = User.objects.get(username='admin')
        employees = [p for p in people if p.role.name == 'employee']
        count = 0
        
        for i, person in enumerate(employees[:20]):
            Contract.objects.create(
                title=f"{person.full_name} İş Sözleşmesi",
                contract_number=f"SZL-2024-{i+1:04d}",
                file='contracts/dummy.pdf',
                related_person=person,
                start_date=date.today() - timedelta(days=random.randint(30, 365)),
                end_date=date.today() + timedelta(days=365),
                status='active',
                created_by=admin
            )
            count += 1
        
        self.stdout.write(f'  ✓ {count} sözleşme oluşturuldu')

    def create_promissory_notes(self, people):
        """Create promissory notes"""
        self.stdout.write('\n📝 Senetler oluşturuluyor...')
        
        admin = User.objects.get(username='admin')
        investors = [p for p in people if p.role.name == 'investor']
        count = 0
        
        for i, person in enumerate(investors[:15]):
            PromissoryNote.objects.create(
                title=f"{person.full_name} Yatırım Senedi",
                note_number=f"SNT-2024-{i+1:04d}",
                amount=Decimal(random.randint(10000, 500000)),
                due_date=date.today() + timedelta(days=random.randint(30, 180)),
                payment_status=random.choice(['pending', 'paid']),
                related_person=person,
                created_by=admin
            )
            count += 1
        
        self.stdout.write(f'  ✓ {count} senet oluşturuldu')

    def create_reports(self, branches):
        """Create reports"""
        self.stdout.write('\n📊 Raporlar oluşturuluyor...')
        
        admin = User.objects.get(username='admin')
        count = 0
        
        for branch in branches[:5]:
            for report_type in ['daily', 'weekly', 'monthly']:
                Report.objects.create(
                    title=f"{branch.name} {report_type} Rapor",
                    content=f"Özet rapor",
                    report_type=report_type,
                    scope='branch',
                    report_date=date.today() - timedelta(days=random.randint(1, 60)),
                    branch=branch,
                    created_by=admin
                )
                count += 1
        
        self.stdout.write(f'  ✓ {count} rapor oluşturuldu')

    def print_summary(self):
        """Print summary"""
        self.stdout.write('\n📊 Özet:')
        self.stdout.write(f'  • Şirket: {Company.objects.count()}')
        self.stdout.write(f'  • Marka: {Brand.objects.count()}')
        self.stdout.write(f'  • Şube: {Branch.objects.count()}')
        self.stdout.write(f'  • Kişi: {Person.objects.count()}')
        self.stdout.write(f'  • Mali Kayıt: {FinancialRecord.objects.count()}')
        self.stdout.write(f'  • Sözleşme: {Contract.objects.count()}')
        self.stdout.write(f'  • Senet: {PromissoryNote.objects.count()}')
        self.stdout.write(f'  • Rapor: {Report.objects.count()}')
        self.stdout.write('\n🔐 Admin: admin / admin123')
        self.stdout.write('='*60)