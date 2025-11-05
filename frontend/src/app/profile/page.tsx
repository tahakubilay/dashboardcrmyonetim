'use client'

import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { getInitials, formatDate } from '@/lib/utils'
import { Mail, User as UserIcon, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profilim</h1>
          <p className="text-muted-foreground mt-1">
            Hesap bilgilerinizi görüntüleyin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {getInitials(user.first_name + ' ' + user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-muted-foreground mt-1">@{user.username}</p>
                <div className="flex gap-2 mt-4">
                  {user.is_staff && (
                    <Badge variant="default">Yönetici</Badge>
                  )}
                  {user.is_superuser && (
                    <Badge variant="destructive">Süper Kullanıcı</Badge>
                  )}
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/settings">Profili Düzenle</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details Cards */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Hesap Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">E-posta</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Kullanıcı Adı</p>
                    <p className="font-medium">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Üye Olma</p>
                    <p className="font-medium">
                      {user.date_joined ? formatDate(user.date_joined) : 'Bilinmiyor'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Yetkilendirme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-sm">Yönetici Yetkisi</span>
                    <Badge variant={user.is_staff ? 'default' : 'secondary'}>
                      {user.is_staff ? 'Var' : 'Yok'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-sm">Süper Kullanıcı</span>
                    <Badge variant={user.is_superuser ? 'destructive' : 'secondary'}>
                      {user.is_superuser ? 'Evet' : 'Hayır'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aktivite geçmişi yakında eklenecek
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}