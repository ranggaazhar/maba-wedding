// src/components/admin/AdminHeader.tsx
import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Menu, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/Authapi';
import { useToast } from '../../hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { dashboardApi } from '../../api/dashboardApi';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { admin, clearAuth } = useAuthStore();
  const { toast } = useToast();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    bookings: { id: number; code: string; name: string }[];
    projects: { id: number; slug: string; title: string }[];
    properties: { id: number; name: string }[];
  } | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsLoadingSearch(true);
        const response = await dashboardApi.globalSearch(searchQuery);
        if (response.success) {
          setSearchResults(response.data);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await dashboardApi.getNotifications();
      if (response.success) {
        const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
        
        const updatedNotifications = response.data.notifications.map((n: any) => {
          if (readIds.includes(n.id)) {
            return { ...n, unread: false };
          }
          return n;
        });

        const newUnreadCount = updatedNotifications.filter((n: any) => n.unread).length;

        setNotifications(updatedNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const handleNotificationClick = (notification: any) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!readIds.includes(notification.id)) {
      readIds.push(notification.id);
      localStorage.setItem('read_notifications', JSON.stringify(readIds));
    }

    const updatedNotifications = notifications.map((n: any) => {
      if (n.id === notification.id) {
        return { ...n, unread: false };
      }
      return n;
    });
    const newUnreadCount = updatedNotifications.filter((n: any) => n.unread).length;

    setNotifications(updatedNotifications);
    setUnreadCount(newUnreadCount);
    setActiveNotification(notification);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border/50 px-4 md:px-6">
      <div className="flex h-full items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Search */}
        <div ref={searchRef} className="flex items-center gap-3 flex-1 md:flex-none relative">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground md:hidden shrink-0"
          >
            <Menu size={20} />
          </button>
          
          {/* Search Input */}
          <div className="relative w-full max-w-[150px] sm:max-w-xs md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchResults(true);
              }}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Search Dropdown Overlay */}
          {showSearchResults && searchResults && (
            <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto p-2 space-y-3">
              {isLoadingSearch ? (
                <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                  Mencari...
                </div>
              ) : (
                <>
                  {/* Bookings */}
                  {searchResults.bookings.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Bookings</p>
                      <div className="space-y-1">
                        {searchResults.bookings.map(b => (
                          <button
                            key={b.id}
                            onClick={() => {
                              navigate(`/admin/bookings/${b.id}`);
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-sm flex items-center justify-between"
                          >
                            <span className="font-medium text-foreground">{b.code}</span>
                            <span className="text-xs text-muted-foreground">{b.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {searchResults.projects.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Projects</p>
                      <div className="space-y-1">
                        {searchResults.projects.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              navigate(`/admin/projects/${p.id}`);
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-sm truncate block"
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Properties */}
                  {searchResults.properties.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Properties</p>
                      <div className="space-y-1">
                        {searchResults.properties.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              navigate(`/admin/properties/${p.id}`);
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-sm truncate block"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.bookings.length === 0 &&
                   searchResults.projects.length === 0 &&
                   searchResults.properties.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      Tidak ada hasil ditemukan
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Dropdown Container */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell size={20} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">Notifikasi Terbaru</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary font-medium">{unreadCount} baru</span>
                  )}
                </div>
                <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          handleNotificationClick(n);
                        }}
                        className={`w-full text-left p-3.5 hover:bg-muted/50 transition-colors flex gap-3 items-start ${
                          n.unread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-full shrink-0 ${
                          n.type === 'booking' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {n.type === 'booking' ? <Calendar size={16} /> : <Star size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(n.date).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {n.unread && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{admin?.email || 'admin@example.com'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-2">
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Detail Dialog Modal */}
      <Dialog open={activeNotification !== null} onOpenChange={() => setActiveNotification(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeNotification?.type === 'booking' ? (
                <Calendar className="text-primary h-5 w-5" />
              ) : (
                <Star className="text-yellow-500 h-5 w-5" />
              )}
              {activeNotification?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Diterima pada {activeNotification && new Date(activeNotification.date).toLocaleString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-base text-foreground leading-relaxed whitespace-pre-line border-y border-border my-2">
            {activeNotification?.message}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActiveNotification(null)}>Tutup</Button>
            <Button className="gradient-ocean text-primary-foreground" onClick={() => {
              const target = activeNotification?.type === 'booking'
                ? `/admin/bookings/${activeNotification.target_id}`
                : `/admin/reviews`;
              navigate(target);
              setActiveNotification(null);
              setShowNotifications(false);
            }}>
              {activeNotification?.type === 'booking' ? 'Buka Booking Detail' : 'Kelola Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </header>
  );
}