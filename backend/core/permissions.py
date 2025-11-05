from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Nesneyi sadece oluşturan kullanıcı düzenleyebilir
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return True


class CanManageCompany(permissions.BasePermission):
    """
    Şirket yönetimi yetkisi
    """
    def has_permission(self, request, view):
        # Authenticated kullanıcılar okuyabilir
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Sadece staff kullanıcılar oluşturabilir/düzenleyebilir
        return request.user.is_staff

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_staff


class CanViewSensitiveData(permissions.BasePermission):
    """
    Hassas verileri görüntüleme yetkisi
    TC Kimlik, IBAN gibi
    """
    def has_permission(self, request, view):
        # Sadece yöneticiler ve partner rolündeki kullanıcılar
        if request.user.is_staff:
            return True
        
        # Kullanıcının rolünü kontrol et (eğer Person modeline bağlıysa)
        # Bu kısım uygulamaya göre özelleştirilebilir
        return False


class CanManageFinancials(permissions.BasePermission):
    """
    Mali kayıtları yönetme yetkisi
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Sadece yöneticiler ve muhasebe ekibi oluşturabilir
        return request.user.is_staff or request.user.groups.filter(name='accounting').exists()


class CanGenerateReports(permissions.BasePermission):
    """
    Rapor oluşturma yetkisi
    """
    def has_permission(self, request, view):
        # Herkes rapor görebilir
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Rapor oluşturma yetkisi
        if view.action == 'generate':
            return request.user.is_staff or request.user.groups.filter(name='managers').exists()
        
        return request.user.is_authenticated


class CanManageContracts(permissions.BasePermission):
    """
    Sözleşme yönetimi yetkisi
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Sadece yöneticiler ve HR sözleşme oluşturabilir
        return request.user.is_staff or request.user.groups.filter(name='hr').exists()

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Sözleşmeyi oluşturan veya yönetici düzenleyebilir
        return obj.created_by == request.user or request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin olmayan kullanıcılar sadece okuyabilir
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        return request.user.is_staff


class CanDeleteOnlyOwn(permissions.BasePermission):
    """
    Sadece kendi oluşturduğu kayıtları silebilir
    """
    def has_object_permission(self, request, view, obj):
        if request.method != 'DELETE':
            return True
        
        # Silme işlemi için kendi oluşturduğu veya admin olmalı
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user or request.user.is_staff
        
        return request.user.is_staff


# Row-level permission helper
class RowLevelPermissionMixin:
    """
    Row-level yetkilendirme için mixin
    """
    def get_queryset(self):
        """
        Kullanıcının sadece erişebileceği kayıtları döndür
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_staff or user.is_superuser:
            # Admin tüm kayıtları görebilir
            return queryset
        
        # Normal kullanıcılar sadece kendi şirketlerinin kayıtlarını görebilir
        # Bu kısım uygulamaya göre özelleştirilebilir
        # Örnek: Kullanıcının Person kaydından company'yi al
        try:
            person = user.person  # Eğer User-Person ilişkisi varsa
            company = person.branch.brand.company
            
            # Model'e göre filtreleme
            if hasattr(queryset.model, 'company'):
                return queryset.filter(company=company)
            elif hasattr(queryset.model, 'brand'):
                return queryset.filter(brand__company=company)
            elif hasattr(queryset.model, 'branch'):
                return queryset.filter(branch__brand__company=company)
            elif hasattr(queryset.model, 'related_company'):
                return queryset.filter(related_company=company)
        except:
            pass
        
        return queryset