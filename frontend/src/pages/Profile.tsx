import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi, type UpdateProfileData, type ChangePasswordData } from '../api/Authapi';
import { useToast } from '../hooks/use-toast';
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
import { cn } from '../lib/utils';

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await authApi.updateProfile(profileData);
      updateAdmin(response.data);
      toast({ title: 'Success', description: response.message || 'Profile updated successfully' });
    } catch (err: unknown) {
      const error = err as ApiError;
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords mismatch', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      await authApi.changePassword(passwordData);
      toast({ title: 'Success', description: 'Password changed' });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as ApiError;
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', variant: 'destructive' });
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
                onClick={() => navigate('/')}
              >
                Dashboard
              </span>
              <span className="opacity-20">/</span>
              <span className="text-[hsl(var(--ocean-deep))]">Profile</span>
            </nav>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="p-1.5 rounded-lg bg-white text-[hsl(var(--ocean-deep))] hover:bg-[hsl(var(--ocean-pale))] border border-[hsl(var(--border))] shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
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
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
                          placeholder="Email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-bold text-sm shadow-md"
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
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white transition-all outline-none text-sm"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white text-sm outline-none"
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Confirm New Password</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white text-sm outline-none"
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-bold text-sm shadow-md"
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