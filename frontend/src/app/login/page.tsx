'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      
      if (loginMethod === 'email') {
        response = await authService.loginWithEmail(formData.username, formData.password)
      } else {
        response = await authService.login(formData.username, formData.password)
      }

      setUser(response.user)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-3xl font-bold">Kurumsal Yönetim</h1>
          <p className="text-muted-foreground mt-2">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>
              Kullanıcı adı veya e-posta ile giriş yapabilirsiniz
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Method Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={loginMethod === 'username' ? 'default' : 'ghost'}
                  className="flex-1"
                  size="sm"
                  onClick={() => setLoginMethod('username')}
                >
                  Kullanıcı Adı
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'email' ? 'default' : 'ghost'}
                  className="flex-1"
                  size="sm"
                  onClick={() => setLoginMethod('email')}
                >
                  E-posta
                </Button>
              </div>

              {/* Username/Email Field */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  {loginMethod === 'username' ? 'Kullanıcı Adı' : 'E-posta'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type={loginMethod === 'email' ? 'email' : 'text'}
                    placeholder={loginMethod === 'username' ? 'kullaniciadi' : 'ornek@email.com'}
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    autoComplete={loginMethod === 'email' ? 'email' : 'username'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-muted"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Beni hatırla
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>

              {/* Demo Credentials */}
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-1">Demo hesap:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  admin / admin123
                </code>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 Kurumsal Yönetim Paneli. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
