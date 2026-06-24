import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { authApi, type UpdateProfileData, type ChangePasswordData } from '../../../api/Authapi';
import { useToast } from '../../../hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { admin, updateAdmin } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name) {
      newErrors.name = 'Nama wajib diisi';
    }
    if (!profileData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Format email salah';
    }
    if (!profileData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setProfileErrors({});
      const response = await authApi.updateProfile(profileData);
      updateAdmin(response.data);
      toast({ title: 'Sukses', description: response.message || 'Profil berhasil diperbarui' });
    } catch (err: any) {
      if (err?.response?.status === 400 && err.response.data?.errors) {
        const apiErrors = err.response.data.errors;
        const targetErrors: Record<string, string> = {};
        apiErrors.forEach((errorItem: any) => {
          targetErrors[errorItem.field] = errorItem.message;
        });
        setProfileErrors(targetErrors);
      } else {
        const errMsg = err?.response?.data?.message || 'Gagal memperbarui profil';
        if (errMsg.toLowerCase().includes('email')) {
          setProfileErrors({ email: errMsg });
        } else {
          toast({ title: 'Gagal', description: errMsg, variant: 'destructive' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    }

    const newPass = passwordData.newPassword;
    if (!newPass) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else {
      if (newPass.length < 8) {
        newErrors.newPassword = 'Password minimal 8 karakter';
      } else if (!/[A-Z]/.test(newPass)) {
        newErrors.newPassword = 'Password harus mengandung minimal 1 huruf besar';
      } else if (!/\d/.test(newPass)) {
        newErrors.newPassword = 'Password harus mengandung minimal 1 angka';
      } else if (!/[^A-Za-z0-9]/.test(newPass)) {
        newErrors.newPassword = 'Password harus mengandung minimal 1 simbol/tanda';
      } else if (newPass === passwordData.currentPassword) {
        newErrors.newPassword = 'Password baru tidak boleh sama dengan password saat ini';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (newPass !== confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setPasswordErrors({});
      await authApi.changePassword(passwordData);
      toast({ title: 'Sukses', description: 'Password berhasil diubah' });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (err: any) {
      if (err?.response?.status === 400 && err.response.data?.errors) {
        const apiErrors = err.response.data.errors;
        const targetErrors: Record<string, string> = {};
        apiErrors.forEach((errorItem: any) => {
          targetErrors[errorItem.field] = errorItem.message;
        });
        setPasswordErrors(targetErrors);
      } else {
        const errMsg = err?.response?.data?.message || 'Gagal mengubah password';
        if (errMsg === 'Password saat ini salah') {
          setPasswordErrors({ currentPassword: 'Password saat ini salah' });
        } else if (errMsg === 'Password baru tidak boleh sama dengan password saat ini') {
          setPasswordErrors({ newPassword: 'Password baru tidak boleh sama dengan password saat ini' });
        } else {
          toast({ title: 'Gagal', description: errMsg, variant: 'destructive' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] w-full flex flex-col">
      <main className="flex-1 w-full pb-10">

        {/* HEADER: POSISI NAIK MAKSIMAL & TANPA KOTAK PUTIH */}
        <header className="w-full px-6 pb-4">
          <div className="flex flex-col gap-0.5">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              <span
                className="hover:text-[hsl(var(--ocean-soft))] cursor-pointer transition-colors"
                onClick={() => navigate('/admin/dashboard')}
              >
                Dashboard
              </span>
              <span className="opacity-20">/</span>
              <span className="text-[hsl(var(--ocean-deep))]">Profile</span>
            </nav>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-1.5 rounded-lg bg-white text-[hsl(var(--ocean-deep))] hover:bg-[hsl(var(--ocean-pale))] border border-[hsl(var(--border))] shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                Profile Settings
              </h2>
            </div>
          </div>
        </header>

        {/* CONTENT AREA: FULL WIDTH DENGAN JARAK RAPAT */}
        <div className="px-6 w-full space-y-4">

          {/* USER IDENTITY CARD */}
          <div className="w-full bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--ocean-light))] rounded-full -mr-24 -mt-24 opacity-10 blur-3xl"></div>

            <div className="relative flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--ocean-soft))] to-[hsl(var(--ocean-deep))] flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-[hsl(var(--ocean-pale))]">
                {admin?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{admin?.name}</h3>
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Mail className="w-3.5 h-3.5 text-[hsl(var(--ocean-soft))]" />
                  <span className="text-sm">{admin?.email}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 uppercase">
                    <CheckCircle className="w-3 h-3" /> Active Account
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[hsl(var(--ocean-pale))] text-[hsl(var(--ocean-deep))] text-[10px] font-bold border border-[hsl(var(--ocean-light))] uppercase">
                    <Calendar className="w-3 h-3" /> Joined {admin?.created_at ? new Date(admin.created_at).toLocaleDateString() : '12/18/2025'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN FORM CARD */}
          <div className="w-full bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">

            {/* Tab Switcher: Compact size */}
            <div className="flex p-1 bg-[hsl(var(--ocean-pale))] m-4 rounded-xl border border-[hsl(var(--ocean-light))] max-w-xs">
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  activeTab === 'profile'
                    ? "bg-white text-[hsl(var(--ocean-deep))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <User className="w-3 h-3" /> Personal Info
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  activeTab === 'password'
                    ? "bg-white text-[hsl(var(--ocean-deep))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Lock className="w-3 h-3" /> Security
              </button>
            </div>

            <div className="p-6 pt-0">
              {activeTab === 'profile' ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => {
                            setProfileData({ ...profileData, name: e.target.value });
                            if (profileErrors.name) setProfileErrors({ ...profileErrors, name: '' });
                          }}
                          className={cn(
                            "w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm",
                            profileErrors.name ? "border-red-500 focus:border-red-500" : "border-transparent"
                          )}
                          placeholder="Your Name"
                        />
                      </div>
                      {profileErrors.name && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{profileErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => {
                            setProfileData({ ...profileData, email: e.target.value });
                            if (profileErrors.email) setProfileErrors({ ...profileErrors, email: '' });
                          }}
                          className={cn(
                            "w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm",
                            profileErrors.email ? "border-red-500 focus:border-red-500" : "border-transparent"
                          )}
                          placeholder="Email"
                        />
                      </div>
                      {profileErrors.email && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{profileErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 13) {
                              setProfileData({ ...profileData, phone: val });
                              if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                            }
                          }}
                          className={cn(
                            "w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm",
                            profileErrors.phone ? "border-red-500 focus:border-red-500" : "border-transparent"
                          )}
                          placeholder="Phone"
                        />
                      </div>
                      {profileErrors.phone && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{profileErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="bg-[hsl(var(--ocean-pale))] border border-[hsl(var(--ocean-light))] rounded-lg p-3 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-[hsl(var(--ocean-soft))] mt-0.5" />
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                      Update your password regularly to keep your account secure.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, currentPassword: e.target.value });
                            if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                          }}
                          className={cn(
                            "w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white transition-all outline-none text-sm",
                            passwordErrors.currentPassword ? "border-red-500 focus:border-red-500" : "border-transparent"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, newPassword: e.target.value });
                              if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                            }}
                            className={cn(
                              "w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white text-sm outline-none",
                              passwordErrors.newPassword ? "border-red-500 focus:border-red-500" : "border-transparent"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.newPassword}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Confirm New Password</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                            }}
                            className={cn(
                              "w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border rounded-lg focus:bg-white text-sm outline-none",
                              passwordErrors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-transparent"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}