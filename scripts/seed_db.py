#!/usr/bin/env python
"""
Demo veri oluşturma scripti
Kullanım: python manage.py seed_db
"""

import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta
import random

# Django setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import (
    Company, Brand, Branch, Person, Role,
    Report, Contract, PromissoryNote, FinancialRecord
)


def create_roles():
    """Rolleri oluştur"""
    print("📋 Roller oluşturuluyor...")
    
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
            print(f"  ✓ {role.display_name} rolü oluşturuldu")
    
    return roles


def create_users():
    """Kullanıcıları oluştur"""
    print("\n👤 Kullanıcılar oluşturuluyor...")
    
    # Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("  ✓ Admin kullanıcısı oluşturuldu (admin/admin123)")
    
    # Normal users
    users_data = [
        {'username': 'manager1', 'email': 'manager1@example.com', 'first_name': 'Ahmet', 'last_name': 'Yılmaz'},
        {'username': 'user1', 'email': 'user1@example.com', 'first_name': 'Mehmet', 'last_name': 'Demir'},
    ]
    
    for user_data in users_data:
        if not User.objects.filter(username=user_data['username']).exists():
            User.objects.create_user(
                password='password123',
                **user_data
            )
            print(f"  ✓ {user_data['username']} kullanıcısı oluşturuldu")


def create_companies_and_structure():
    """Şirket yapısını oluştur"""
    print("\n🏢 Şirketler oluşturuluyor...")
    
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
        company, created = Company.objects.get_or_create(
            tax_number=company_data['tax_number'],
            defaults=company_data
        )
        if created:
            print(f"  ✓ {company.title} oluşturuldu")
        
        for brand_data in brands_data:
            branches_data = brand_data.pop('branches')
            brand, created = Brand.objects.get_or_create(
                company=company,
                name=brand_data['name'],
                defaults=brand_data
            )
            if created:
                print(f"    ✓ {brand.name} markası oluşturuldu")
            
            for branch_data in branches_data:
                branch, created = Branch.objects.get_or_create(
                    brand=brand,
                    name=branch_data['name'],
                    defaults=branch_data
                )
                branches.append(branch)
                if created:
                    print(f"      ✓ {branch.name} şubesi oluşturuldu")
    
    return branches


def create_people(branches, roles):
    """Kişileri oluştur"""
    print("\n👥 Kişiler oluşturuluyor...")
    
    # İsim havuzu
    first_names = ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Ahmet', 'Zeynep', 'Mustafa', 'Elif', 
                   'Can', 'Selin', 'Cem', 'Deniz', 'Berk', 'Yasemin', 'Kerem', 'Büşra']
    last_names = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Arslan', 'Aydın',
                  'Özdemir', 'Aksoy', 'Koç', 'Erdoğan', 'Güneş', 'Polat', 'Doğan', 'Kurt']
    
    employee_role = Role.objects.get(name='employee')
    investor_role = Role.objects.get(name='investor')
    partner_role = Role.objects.get(name='partner')
    manager_role = Role.objects.get(name='manager')
    
    people = []
    
    for branch in branches:
        # Her şubeye 5 çalışan
        for i in range(5):
            person = Person.objects.create(
                full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                national_id=f"{random.randint(10000000000, 99999999999)}",
                phone=f"+90 5{random.randint(300000000, 599999999)}",
                email=f"employee{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                iban=f"TR{random.randint(10, 99)}{random.randint(1000000000000000000000, 9999999999999999999999)}",
                role=employee_role,
                branch=branch,
                address=f"{branch.address} yakını",
                is_active=True
            )
            people.append(person)
        
        # Her şubeye 5 yatırımcı
        for i in range(5):
            person = Person.objects.create(
                full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                phone=f"+90 5{random.randint(300000000, 599999999)}",
                email=f"investor{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                iban=f"TR{random.randint(10, 99)}{random.randint(1000000000000000000000, 9999999999999999999999)}",
                role=investor_role,
                branch=branch,
                is_active=True
            )
            people.append(person)
        
        # Her şubeye 3 ortak
        for i in range(3):
            person = Person.objects.create(
                full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                phone=f"+90 5{random.randint(300000000, 599999999)}",
                email=f"partner{i}@{branch.brand.name.lower().replace(' ', '')}.com",
                iban=f"TR{random.randint(10, 99)}{random.randint(1000000000000000000000, 9999999999999999999999)}",
                role=partner_role,
                branch=branch,
                is_active=True
            )
            people.append(person)
        
        # Her şubeye 1 yönetici
        person = Person.objects.create(
            full_name=f"{random.choice(first_names)} {random.choice(last_names)}",
            phone=f"+90 5{random.randint(300000000, 599999999)}",
            email=f"manager@{branch.brand.name.lower().replace(' ', '')}.com",
            iban=f"TR{random.randint(10, 99)}{random.randint(1000000000000000000000, 9999999999999999999999)}",
            role=manager_role,
            branch=branch,
            is_active=True
        )
        people.append(person)
    
    print(f"  ✓ {len(people)} kişi oluşturuldu")
    return people


def create_financial_records(branches):
    """Mali kayıtlar oluştur"""
    print("\n💰 Mali kayıtlar oluşturuluyor...")
    
    admin_user = User.objects.get(username='admin')
    records = []
    
    for branch in branches:
        # Son 6 ay için rastgele mali kayıtlar
        for i in range(30):
            record_date = date.today() - timedelta(days=random.randint(0, 180))
            record_type = random.choice(['income', 'expense', 'turnover'])
            
            record = FinancialRecord.objects.create(
                title=f"{branch.name} - {record_type.title()} Kaydı",
                type=record_type,
                amount=Decimal(random.randint(1000, 100000)),
                currency='TRY',
                date=record_date,
                description=f"Otomatik oluşturulmuş {record_type} kaydı",
                related_branch=branch,
                related_brand=branch.brand,
                related_company=branch.brand.company,
                created_by=admin_user
            )
            records.append(record)
    
    print(f"  ✓ {len(records)} mali kayıt oluşturuldu")
    return records


def create_contracts(people):
    """Sözleşmeler oluştur"""
    print("\n📄 Sözleşmeler oluşturuluyor...")
    
    admin_user = User.objects.get(username='admin')
    contracts = []
    
    # Sadece çalışanlar için iş sözleşmesi
    employees = [p for p in people if p.role.name == 'employee']
    
    for i, person in enumerate(employees[:20]):  # İlk 20 çalışan
        start_date = date.today() - timedelta(days=random.randint(30, 365))
        end_date = start_date + timedelta(days=365)
        
        contract = Contract.objects.create(
            title=f"{person.full_name} - İş Sözleşmesi",
            contract_number=f"SZL-{2024}-{i+1:04d}",
            template_name='employment_contract',
            file='contracts/dummy.pdf',  # Dummy file
            related_person=person,
            related_branch=person.branch,
            related_brand=person.branch.brand,
            related_company=person.branch.brand.company,
            start_date=start_date,
            end_date=end_date,
            status='active',
            created_by=admin_user,
            versioning={'version': 1, 'changes': []}
        )
        contracts.append(contract)
    
    print(f"  ✓ {len(contracts)} sözleşme oluşturuldu")
    return contracts


def create_promissory_notes(people):
    """Senetler oluştur"""
    print("\n📝 Senetler oluşturuluyor...")
    
    admin_user = User.objects.get(username='admin')
    notes = []
    
    # Sadece yatırımcılar için senet
    investors = [p for p in people if p.role.name == 'investor']
    
    for i, person in enumerate(investors[:15]):  # İlk 15 yatırımcı
        due_date = date.today() + timedelta(days=random.randint(30, 180))
        
        note = PromissoryNote.objects.create(
            title=f"{person.full_name} - Yatırım Senedi",
            note_number=f"SNT-{2024}-{i+1:04d}",
            amount=Decimal(random.randint(10000, 500000)),
            due_date=due_date,
            payment_status=random.choice(['pending', 'paid']),
            related_person=person,
            related_branch=person.branch,
            related_brand=person.branch.brand,
            related_company=person.branch.brand.company,
            created_by=admin_user
        )
        notes.append(note)
    
    print(f"  ✓ {len(notes)} senet oluşturuldu")
    return notes


def create_reports(branches):
    """Raporlar oluştur"""
    print("\n📊 Raporlar oluşturuluyor...")
    
    admin_user = User.objects.get(username='admin')
    reports = []
    
    for branch in branches[:5]:  # İlk 5 şube
        for report_type in ['daily', 'weekly', 'monthly']:
            report_date = date.today() - timedelta(days=random.randint(1, 60))
            
            report = Report.objects.create(
                title=f"{branch.name} - {report_type.title()} Rapor",
                content=f"{branch.name} için {report_type} raporu",
                report_type=report_type,
                scope='branch',
                report_date=report_date,
                branch=branch,
                brand=branch.brand,
                company=branch.brand.company,
                tags=['otomatik', report_type],
                created_by=admin_user
            )
            reports.append(report)
    
    print(f"  ✓ {len(reports)} rapor oluşturuldu")
    return reports


def run():
    """Ana çalıştırma fonksiyonu"""
    print("=" * 60)
    print("🚀 Demo Veri Oluşturma Başlıyor...")
    print("=" * 60)
    
    try:
        # 1. Roller
        roles = create_roles()
        
        # 2. Kullanıcılar
        create_users()
        
        # 3. Şirket yapısı
        branches = create_companies_and_structure()
        
        # 4. Kişiler
        people = create_people(branches, roles)
        
        # 5. Mali kayıtlar
        create_financial_records(branches)
        
        # 6. Sözleşmeler
        create_contracts(people)
        
        # 7. Senetler
        create_promissory_notes(people)
        
        # 8. Raporlar
        create_reports(branches)
        
        print("\n" + "=" * 60)
        print("✅ Demo veri başarıyla oluşturuldu!")
        print("=" * 60)
        print("\n📊 Özet:")
        print(f"  • Şirket: {Company.objects.count()}")
        print(f"  • Marka: {Brand.objects.count()}")
        print(f"  • Şube: {Branch.objects.count()}")
        print(f"  • Kişi: {Person.objects.count()}")
        print(f"  • Mali Kayıt: {FinancialRecord.objects.count()}")
        print(f"  • Sözleşme: {Contract.objects.count()}")
        print(f"  • Senet: {PromissoryNote.objects.count()}")
        print(f"  • Rapor: {Report.objects.count()}")
        print("\n🔐 Admin Girişi:")
        print("  Username: admin")
        print("  Password: admin123")
        print("  URL: http://localhost:8000/admin")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Hata: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    run()
