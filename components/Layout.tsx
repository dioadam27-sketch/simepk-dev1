import React from 'react';
import { LayoutDashboard, FileText, CheckCircle, ShieldCheck, UserCircle, LogOut, Users, Settings, FolderCog, FileStack, BookOpen, MessageSquare, ClipboardList } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  notificationCount?: number; // New optional prop for notifications
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRole, 
  currentUser,
  onLogout,
  activeView,
  setActiveView,
  notificationCount = 0
}) => {
  
  let menuItems: {id: string, label: string, icon: any}[] = [];

  if (currentRole === 'researcher') {
    menuItems = [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'submission', label: 'Pengajuan Baru', icon: FileText },
      { id: 'monitoring', label: 'Monitoring', icon: CheckCircle },
      { id: 'researcher-questionnaire', label: 'Kuesioner & Evaluasi', icon: ClipboardList }, // NEW MENU
    ];
  } else if (currentRole === 'reviewer') {
    menuItems = [
      { id: 'admin-dashboard', label: 'Dashboard Reviewer', icon: ShieldCheck },
      { id: 'admin-review', label: 'Daftar Telaah', icon: FileText },
    ];
  } else if (currentRole === 'admin') {
    menuItems = [
      { id: 'admin-users', label: 'Manajemen User', icon: Users },
      { id: 'admin-submissions', label: 'Data Pengajuan', icon: FileStack },
      { id: 'admin-documents', label: 'Master Dokumen', icon: FolderCog },
      { id: 'admin-questionnaire', label: 'Manajemen Kuesioner', icon: MessageSquare }, 
      { id: 'admin-settings', label: 'Pengaturan Sistem', icon: Settings },
    ];
  }

  // Tambahkan menu Panduan
  menuItems.push({ id: 'guide', label: 'Panduan Sistem', icon: BookOpen });

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <aside className={`w-64 flex flex-col shadow-xl z-10 transition-colors duration-300 ${currentRole === 'admin' ? 'bg-slate-900 text-white' : 'bg-unair-blue text-white'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img 
              src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
              alt="Logo UNAIR" 
              className="h-10 w-auto bg-white rounded p-1" 
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">SIM KEPK</h1>
              <p className="text-xs text-blue-200 opacity-80">Fakultas Keperawatan</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 bg-black/10">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                 {currentUser?.name?.charAt(0) || <UserCircle className="w-6 h-6"/>}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold truncate">{currentUser?.name || 'Guest'}</p>
                 <p className="text-xs text-blue-200 truncate capitalize">{currentRole}</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
               {/* Separator khusus sebelum menu Guide */}
               {item.id === 'guide' && <div className="my-2 pt-2 border-t border-white/10"></div>}
               
               <button
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  activeView === item.id 
                    ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10 font-bold' 
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-unair-yellow' : ''}`} />
                <span>{item.label}</span>
                
                {/* Notification Badge untuk Admin Users */}
                {item.id === 'admin-users' && notificationCount > 0 && (
                   <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md border border-slate-900">
                     {notificationCount > 99 ? '99+' : notificationCount}
                   </span>
                )}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white rounded-xl transition-all duration-200 font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
        {children}
      </main>
    </div>
  );
};