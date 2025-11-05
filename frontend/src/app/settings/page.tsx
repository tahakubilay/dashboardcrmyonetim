'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/lib/store'
import { authService } from '@/lib/auth'
import { useToast } from '@/hooks/useToast'
import { Loader2, User, Lock, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement profile update API call
      success('Profil başarıyla güncellendi')
    } catch (err) {
      error('Profil güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.new_password2) {
      error('Yeni şifreler eşleşmiyor')
      return
    }

    setLoading(true)

    try {
      await authService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password2
      )
      success('Şifre başarıyla değiştirildi')
      setPasswordData({ old_password: '', new_password: '', new_password2: '' })
    } catch (err: any) {
      error(err.response?.data?.detail || 'Şifre değiştirilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground mt-1">
            Hesap ayarlarınızı ve tercihlerinizi yönetin
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Gizlilik
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Ad</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) =>
                          setProfileData(prev => ({ ...prev, first_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Soyad</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) =>
                          setProfileData(prev => ({ ...prev, last_name: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData(prev => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kullanıcı Adı</Label>
                    <Input value={user?.username || ''} disabled />
                    <p className="text-sm text-muted-foreground">
                      Kullanıcı adı değiştirilemez
                    </p>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Değişiklikleri Kaydet'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için güçlü bir şifre kullanın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Mevcut Şifre</Label>
                    <Input
                      id="old_password"
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) =>
                        setPasswordData(prev => ({ ...prev, old_password: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Yeni Şifre</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData(prev => ({ ...prev, new_password: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password2">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="new_password2"
                      type="password"
                      value={passwordData.new_password2}
                      onChange={(e) =>
                        setPasswordData(prev => ({ ...prev, new_password2: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Değiştiriliyor...
                      </>
                    ) : (
                      'Şifreyi Değiştir'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oturum Bilgileri</CardTitle>
                <CardDescription>
                  Aktif oturumlarınızı görüntüleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Mevcut Oturum</p>
                      <p className="text-sm text-muted-foreground">
                        Bu cihazdan giriş yaptınız
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Aktif
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Tercihleri</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Önemli güncellemeler için e-posta alın
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Vadesi Yaklaşan Senetler</Label>
                    <p className="text-sm text-muted-foreground">
                      Senet vadeleri yaklaşınca bildirim alın
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sözleşme Süreleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Sözleşme süreleri dolmadan önce bildirim alın
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Haftalık Raporlar</Label>
                    <p className="text-sm text-muted-foreground">
                      Haftalık özet raporları e-posta ile alın
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>

                <Button>Tercihleri Kaydet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Veri ve Gizlilik</CardTitle>
                <CardDescription>
                  Verilerinizi yönetin ve gizlilik ayarlarınızı yapın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Veri İndirme</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hesabınızdaki tüm verileri indirebilirsiniz
                    </p>
                    <Button variant="outline">Verilerimi İndir</Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-destructive">Tehlikeli Bölge</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Bu işlemler geri alınamaz. Dikkatli olun.
                    </p>
                    <Button variant="destructive">Hesabı Sil</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
