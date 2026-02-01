
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { SubmissionForm } from './components/SubmissionForm';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { ResearchSubmission, UserRole, SubmissionStatus, UserProfile, DocumentRequirement, UserStatus } from './types';
import { apiService } from './services/apiService';
import { FolderCog, Key, Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// Import New Modular Components
import { ResearcherDashboard, ResearcherSubmissionDetail, MonitoringView } from './components/ResearcherModule';
import { 
  AdminUserManagement, 
  AdminSubmissionMonitoring, 
  AdminDocumentManagement, 
  AdminSubmissionDetail,
  AdminSettings,
  ReviewerDashboard,
  ReviewDetail
} from './components/AdminModule';

// --- DEFAULT STATE JIKA API KOSONG ---
const DEFAULT_DOC_REQS: DocumentRequirement[] = [
  { id: 'protocol', label: 'Protokol Lengkap (PDF)', isRequired: true },
  { id: 'consent', label: 'Informed Consent / PSP', isRequired: true },
];

// Custom Hook untuk State Persistence (Simulasi MPA)
function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage`, error);
      return defaultValue;
    }
  });

  // Gunakan ref untuk melacak apakah ini render pertama agar tidak menimpa storage jika state awal 'defaultValue'
  const isFirstRender = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// --- NEW COMPONENT: RESET PASSWORD VIEW ---
const ResetPasswordView = ({ token, onDone }: { token: string, onDone: () => void }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        if (password.length < 5) return setStatus({ type: 'error', msg: 'Password minimal 5 karakter.' });
        if (password !== confirm) return setStatus({ type: 'error', msg: 'Konfirmasi password tidak cocok.' });

        setLoading(true);
        try {
            const res = await apiService.resetPassword(token, password);
            if (res.status === 'success') {
                setStatus({ type: 'success', msg: res.message });
                setTimeout(() => {
                    onDone();
                }, 3000);
            } else {
                setStatus({ type: 'error', msg: res.message });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Terjadi kesalahan sistem.' });
        } finally {
            setLoading(false);
        }
    };

    if (status?.type === 'success') {
         return (
             <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                 <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                         <CheckCircle className="w-8 h-8"/>
                     </div>
                     <h2 className="text-xl font-bold text-slate-800">Password Berhasil Diubah!</h2>
                     <p className="text-slate-500 mt-2 mb-6">Silakan login kembali dengan password baru Anda.</p>
                     <button onClick={onDone} className="w-full py-2 bg-unair-blue text-white rounded-lg font-bold">
                         Ke Halaman Login
                     </button>
                 </div>
             </div>
         );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-50 text-unair-blue rounded-full flex items-center justify-center mx-auto mb-3">
                        <Key className="w-6 h-6"/>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Reset Password Baru</h2>
                    <p className="text-slate-500 text-sm">Masukkan password baru untuk akun Anda.</p>
                </div>

                {status?.type === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2"/> {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <input 
                                type="password" 
                                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <input 
                                type="password" 
                                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Simpan Password Baru'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function App() {
  // --- STATE WITH PERSISTENCE ---
  const [showLanding, setShowLanding] = usePersistedState<boolean>('app_showLanding', true);
  const [isLoggedIn, setIsLoggedIn] = usePersistedState<boolean>('app_isLoggedIn', false);
  const [currentUser, setCurrentUser] = usePersistedState<UserProfile | null>('app_currentUser', null);
  const [activeView, setActiveView] = usePersistedState<string>('app_activeView', 'dashboard');
  const [selectedSubmission, setSelectedSubmission] = usePersistedState<ResearchSubmission | null>('app_selectedSubmission', null);
  
  // Non-persisted UI states
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [submissions, setSubmissions] = useState<ResearchSubmission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [docRequirements, setDocRequirements] = useState<DocumentRequirement[]>(DEFAULT_DOC_REQS);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Reset Password Flow
  const [resetToken, setResetToken] = useState<string | null>(null);

  // --- CHECK URL PARAMS ON MOUNT (FOR RESET PASSWORD LINK) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const tokenParam = params.get('token');

    if (viewParam === 'reset' && tokenParam) {
        setResetToken(tokenParam);
        setShowLanding(false); // Bypass landing
        setIsLoggedIn(false); // Ensure logged out context
    }
  }, []);

  // --- FETCH DATA LOGIC ---
  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // 1. Fetch Submissions (Filtered by backend based on role)
      const subRes = await apiService.getSubmissions(currentUser.role, currentUser.email);
      if (subRes.status === 'success') {
        setSubmissions(subRes.data);
      }

      // 2. Fetch Config (Master Documents)
      const configRes = await apiService.getConfig();
      if (configRes.status === 'success' && configRes.data.length > 0) {
        // PATCH: Sanitize IDs to prevent collision (Bug fix for empty IDs/Labels in Google Sheet)
        const sanitizedDocs = configRes.data.map((doc: any, index: number) => ({
          ...doc,
          id: (doc.id && String(doc.id).trim() !== '') 
            ? doc.id 
            : `${doc.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`
        }));
        setDocRequirements(sanitizedDocs);
      }

      // 3. Admin Only: Fetch Users
      if (currentUser.role === 'admin') {
        const usersRes = await apiService.getUsers();
        if (usersRes.status === 'success') {
          setUsers(usersRes.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch ONLY on login or user change
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchData();
    }
  }, [isLoggedIn, currentUser]); 


  const handleEnterSystem = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setAuthView('login');
  };

  // Login Handler
  const handleLogin = async (email: string, password: string, roleType: 'user' | 'admin', selectedRole?: UserRole) => {
    
    // --- DEVELOPER BACKDOOR ---
    if (password === 'dev123') {
      console.log("⚡ DEVELOPER MODE ACTIVATED ⚡");
      let targetRole: UserRole = 'researcher';
      if (roleType === 'admin') targetRole = 'admin';
      else if (selectedRole) targetRole = selectedRole;

      const devUser: UserProfile = {
        id: 'dev-' + Math.random().toString(36).substr(2, 5),
        name: `Developer (${targetRole.toUpperCase()})`,
        email: email || 'dev@local.test',
        role: targetRole,
        institution: 'Developer Mode Institution',
        status: 'active',
        joinedAt: new Date().toISOString(),
        identityNumber: 'DEV-123456',
        phone: '08123456789'
      };

      setCurrentUser(devUser);
      setIsLoggedIn(true);
      if (targetRole === 'researcher') setActiveView('dashboard');
      else if (targetRole === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-users');
      return { success: true };
    }
    // --- END BACKDOOR ---

    const response = await apiService.login(email, password);
    
    if (response.status === 'success') {
      const userData = response.data;
      if (roleType === 'user') {
        if (userData.role === 'admin') return { success: false, message: 'Akun Administrator harus login melalui Portal Admin.' };
        if (selectedRole && userData.role !== selectedRole) {
           const roleName = userData.role === 'researcher' ? 'Peneliti' : 'Reviewer';
           return { success: false, message: `Akun Anda terdaftar sebagai ${roleName}. Silakan ganti tab login.` };
        }
      }
      if (roleType === 'admin' && userData.role !== 'admin') return { success: false, message: 'Akun ini tidak memiliki akses Administrator.' };

      setCurrentUser(userData);
      setIsLoggedIn(true);
      if (userData.role === 'researcher') setActiveView('dashboard');
      else if (userData.role === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-users');

      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const handleRegister = async (data: any) => {
    await apiService.register(data);
  };

  const handleLogout = () => {
    // Clear State & Storage
    localStorage.removeItem('app_isLoggedIn');
    localStorage.removeItem('app_currentUser');
    localStorage.removeItem('app_activeView');
    localStorage.removeItem('app_selectedSubmission');
    localStorage.removeItem('app_showLanding');

    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthView('login');
    setSelectedSubmission(null);
    setSubmissions([]); 
    setShowLanding(true);
    setActiveView('dashboard');
  };

  // --- ACTIONS ---

  const handleCreateOrUpdateSubmission = async (newSub: Omit<ResearchSubmission, 'id' | 'status' | 'submissionDate' | 'progressReports'>) => {
    
    // Check if we are updating existing submission (Edit Mode)
    if (selectedSubmission) {
      const payload = {
         ...newSub,
         id: selectedSubmission.id, // Keep original ID
         status: 'submitted' as SubmissionStatus // Reset status to submitted after edit? Or keep previous? Let's reset to allow review.
      };
      
      const res = await apiService.editSubmission(payload);
      
      if (res.status === 'success') {
        setSubmissions(prev => prev.map(s => s.id === payload.id ? { ...s, ...payload, documents: res.documents } : s));
        setActiveView('dashboard');
        setSelectedSubmission(null);
      } else {
        throw new Error(res.message);
      }
    } else {
      // Create New Submission
      const tempId = `EC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
      const submissionPayload = {
        ...newSub,
        id: tempId,
        researcherEmail: currentUser?.email, 
        status: 'submitted' as SubmissionStatus,
        submissionDate: new Date().toISOString().split('T')[0],
        progressReports: []
      };

      const res = await apiService.createSubmission(submissionPayload);
      
      if (res.status === 'success') {
        const finalSubmission = {
          ...submissionPayload,
          documents: res.documents || submissionPayload.documents 
        };
        setSubmissions(prev => [finalSubmission, ...prev]); 
        setActiveView('dashboard'); 
      } else {
        throw new Error(res.message); 
      }
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'revise', feedback?: string) => {
    const status = action === 'approve' ? 'approved' : 'revision_needed';
    const approvalDate = action === 'approve' ? new Date().toISOString().split('T')[0] : undefined;
    
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === id) {
        return { ...sub, status, feedback, approvalDate };
      }
      return sub;
    }));
    
    setSelectedSubmission(null);
    if (currentUser?.role === 'reviewer') setActiveView('admin-dashboard');
    else setActiveView('admin-submissions');

    apiService.updateSubmissionStatus(id, status, feedback, approvalDate).catch(err => {
      console.error("Background sync failed:", err);
    });
  };

  const handleCertificateUpload = async (id: string, file: File) => {
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
      
      const rawBase64 = base64String.split(',')[1];
      const res = await apiService.uploadCertificate(id, rawBase64, file.name);

      if (res.status === 'success') {
         // Update local state
         setSubmissions(prev => prev.map(sub => 
           sub.id === id ? { ...sub, certificateUrl: res.url } : sub
         ));
         
         // Jika sedang melihat detail, update juga
         if (selectedSubmission && selectedSubmission.id === id) {
           setSelectedSubmission(prev => prev ? { ...prev, certificateUrl: res.url } : null);
         }
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      console.error("Upload cert error", error);
      throw error;
    }
  };

  const handleUserStatusChange = async (userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    apiService.updateUserStatus(userId, status).catch(err => console.error("Sync failed", err));
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    apiService.deleteUser(userId).catch(err => console.error("Sync failed", err));
  };

  const handleAddDocRequirement = async (label: string) => {
    const tempId = label.toLowerCase().replace(/\s+/g, '-');
    const newItem: DocumentRequirement = { id: tempId, label, isRequired: true };
    setDocRequirements(prev => [...prev, newItem]);
    apiService.addConfig(tempId, label, true).catch(err => console.error("Sync failed", err));
  };

  const handleDeleteDocRequirement = async (id: string) => {
    setDocRequirements(prev => prev.filter(d => d.id !== id));
    apiService.deleteConfig(id).catch(err => console.error("Sync failed", err));
  };

  // --- RENDER LOGIC ---

  // 1. Check for Reset Token Flow first
  if (resetToken) {
    return <ResetPasswordView token={resetToken} onDone={() => { setResetToken(null); setAuthView('login'); setShowLanding(true); }} />;
  }

  if (showLanding) return <LandingPage onEnterSystem={handleEnterSystem} />;
  
  if (!isLoggedIn) {
    if (authView === 'register') return <Register onRegister={handleRegister} onLoginClick={() => setAuthView('login')} />;
    return <Login onLogin={handleLogin} onRegisterClick={() => setAuthView('register')} onBackToHome={handleBackToLanding} />;
  }

  // --- ROUTING BERDASARKAN activeView ---
  const renderContent = () => {
    switch (activeView) {
      // RESEARCHER VIEWS
      case 'dashboard':
        return (
          <ResearcherDashboard 
            submissions={submissions} 
            isLoading={isLoading} 
            onViewDetail={(sub) => { setSelectedSubmission(sub); setActiveView('submission-detail'); }}
            onCreateNew={() => { setSelectedSubmission(null); setActiveView('submission'); }}
            onEdit={(sub) => { setSelectedSubmission(sub); setActiveView('submission'); }} // Handle Edit
          />
        );
      case 'submission-detail':
        return <ResearcherSubmissionDetail submission={selectedSubmission} onBack={() => { setSelectedSubmission(null); setActiveView('dashboard'); }} />;
      case 'submission':
        return (
          <SubmissionForm 
             onSubmit={handleCreateOrUpdateSubmission} 
             onCancel={() => { setSelectedSubmission(null); setActiveView('dashboard'); }} 
             documentRequirements={docRequirements} 
             initialData={selectedSubmission} // Pass selected data for edit mode
          />
        );
      case 'monitoring':
        return (
          <MonitoringView 
            submissions={submissions} 
            onRevise={(sub) => { setSelectedSubmission(sub); setActiveView('submission'); }} 
          />
        );
      
      // REVIEWER VIEWS
      case 'admin-dashboard':
      case 'admin-review': // Fallback alias
        return (
          <ReviewerDashboard 
            submissions={submissions} 
            isLoading={isLoading} 
            onReview={(sub) => { setSelectedSubmission(sub); setActiveView('review-detail'); }}
          />
        );
      case 'review-detail':
        return (
          <ReviewDetail 
            submission={selectedSubmission} 
            onBack={() => { setSelectedSubmission(null); setActiveView('admin-dashboard'); }}
            onSubmitReview={handleReviewAction}
          />
        );

      // ADMIN VIEWS
      case 'admin-users':
        return (
          <AdminUserManagement 
            users={users} 
            isLoading={isLoading} 
            onStatusChange={handleUserStatusChange}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'admin-submissions':
        return (
           <AdminSubmissionMonitoring 
             submissions={submissions} 
             isLoading={isLoading} 
             onViewDetail={(sub) => { setSelectedSubmission(sub); setActiveView('admin-submission-detail'); }}
           />
        );
      case 'admin-submission-detail':
        return (
          <AdminSubmissionDetail 
            submission={selectedSubmission}
            onBack={() => { setSelectedSubmission(null); setActiveView('admin-submissions'); }}
            onUploadCert={handleCertificateUpload}
          />
        );
      case 'admin-documents':
        return (
          <AdminDocumentManagement 
            documents={docRequirements}
            onAdd={handleAddDocRequirement}
            onDelete={handleDeleteDocRequirement}
          />
        );
      
      // SETTINGS & DEFAULT
      case 'admin-settings':
        return (
          currentUser ? (
              <AdminSettings 
                currentUser={currentUser} 
                onUpdateProfile={(newEmail) => setCurrentUser(prev => prev ? { ...prev, email: newEmail } : null)}
              />
          ) : <div>Loading...</div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p>Halaman tidak ditemukan</p>
            <button onClick={() => setActiveView('dashboard')} className="mt-4 text-blue-500 hover:underline">Kembali ke Dashboard</button>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentRole={currentUser?.role || 'researcher'} 
      currentUser={currentUser}
      onLogout={handleLogout}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
}
