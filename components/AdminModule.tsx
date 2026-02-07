import React, { useState, useEffect } from 'react';
import { UserProfile, ResearchSubmission, DocumentRequirement, UserStatus, AdminLog, QuestionnaireQuestion, QuestionnaireResponse } from '../types';
import { ShieldCheck, Eye, Loader2, User, Clock, FileText, AlertTriangle, CheckCircle, ArrowLeft, FileStack, DownloadCloud, Building, CreditCard, Phone, Mail, Check, X, FolderCog, Plus, Trash2, Ban, RefreshCcw, UploadCloud, Printer, Settings, Lock, FileCheck, Server, Database, Save, Unlock, History, XCircle, Key, Send, Copy, MessageSquare, BarChart3, ListChecks } from 'lucide-react';
import { StatusBadge, TableSkeleton, DetailSkeleton, formatDate } from './Shared';
import { apiService } from '../services/apiService';

// --- INTERFACES ---

interface ReviewerDashboardProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onReview: (sub: ResearchSubmission) => void;
}

interface ReviewDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
  onSubmitReview: (id: string, action: 'approve' | 'revise', feedback?: string) => void;
}

interface AdminSubmissionProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onViewDetail: (sub: ResearchSubmission) => void;
}

interface AdminDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
  onUploadCert: (id: string, file: File) => Promise<void>;
}

interface AdminUserProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  isLoading: boolean;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string, adminName?: string) => void;
  onRefresh: () => void;
}

interface AdminDocumentProps {
  documents: DocumentRequirement[];
  onAdd: (label: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface AdminSettingsProps {
  currentUser: UserProfile;
  onUpdateProfile: (name: string, email: string) => void;
}

// --- COMPONENTS ---

export const AdminQuestionnaireManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
    const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
    const [results, setResults] = useState<QuestionnaireResponse[]>([]);
    const [loading, setLoading] = useState(false);
    
    // State Modal Delete
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    // Form Add Question
    const [newQText, setNewQText] = useState('');
    const [newQType, setNewQType] = useState<'text' | 'rating' | 'yesno' | 'likert'>('rating');

    useEffect(() => {
        if(activeTab === 'questions') fetchQuestions();
        else fetchResults();
    }, [activeTab]);

    const fetchQuestions = async () => {
        setLoading(true);
        const res = await apiService.getQuestions(false); // Admin mode
        if(res.status === 'success') setQuestions(res.data);
        setLoading(false);
    };

    const fetchResults = async () => {
        setLoading(true);
        const res = await apiService.getQuestionnaireResults();
        if(res.status === 'success') setResults(res.data);
        setLoading(false);
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newQText) return;
        
        await apiService.addQuestion(newQText, newQType);
        setNewQText('');
        fetchQuestions();
    };

    const confirmDelete = async () => {
        if(deleteId !== null) {
            await apiService.deleteQuestion(deleteId);
            setDeleteId(null);
            fetchQuestions();
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* MODAL KONFIRMASI HAPUS */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 transform scale-100 transition-transform">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Hapus Pertanyaan?</h3>
                            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                Pertanyaan yang dihapus tidak dapat dipulihkan kembali.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setDeleteId(null)} 
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDelete} 
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 border-b border-slate-200 pb-1">
                <button 
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'questions' ? 'border-unair-blue text-unair-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <ListChecks className="w-4 h-4 inline mr-2"/>
                    Daftar Pertanyaan
                </button>
                <button 
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'results' ? 'border-unair-blue text-unair-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-2"/>
                    Hasil Respon User
                </button>
            </div>

            {activeTab === 'questions' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Pertanyaan Baru</h2>
                    <form onSubmit={handleAddQuestion} className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <input 
                            type="text" 
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none"
                            placeholder="Tulis pertanyaan..."
                            value={newQText}
                            onChange={e => setNewQText(e.target.value)}
                        />
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none bg-white"
                            value={newQType}
                            onChange={e => setNewQType(e.target.value as any)}
                        >
                            <option value="rating">Rating (Bintang 1-5)</option>
                            <option value="likert">Skala Likert (5 Poin)</option>
                            <option value="yesno">Pilihan Ya / Tidak</option>
                            <option value="text">Esai / Teks Bebas</option>
                        </select>
                        <button type="submit" className="px-6 py-2 bg-unair-blue text-white font-bold rounded-lg hover:bg-blue-800">
                            + Tambah
                        </button>
                    </form>

                    <h3 className="font-bold text-slate-700 mb-4">Daftar Pertanyaan Aktif</h3>
                    <div className="space-y-3">
                        {loading ? <TableSkeleton/> : questions.length === 0 ? <p className="text-slate-400 italic">Belum ada pertanyaan.</p> : (
                            questions.map((q) => (
                                <div key={q.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            q.question_type === 'rating' ? 'bg-yellow-100 text-yellow-700' :
                                            q.question_type === 'yesno' ? 'bg-blue-100 text-blue-700' : 
                                            q.question_type === 'likert' ? 'bg-purple-100 text-purple-700' : 
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {q.question_type}
                                        </span>
                                        <span className="font-medium text-slate-800">{q.question_text}</span>
                                    </div>
                                    <button onClick={() => setDeleteId(q.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="px-6 py-3">Waktu</th>
                                    <th className="px-6 py-3">Responden</th>
                                    <th className="px-6 py-3">Jawaban</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> : 
                                 results.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-slate-400">Belum ada respon masuk.</td></tr> : (
                                    results.map((res) => (
                                        <tr key={res.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap align-top">{formatDate(res.created_at)}</td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-bold text-slate-800">{res.respondent_name || 'Anonim'}</div>
                                                <div className="text-xs text-slate-500 capitalize">{res.respondent_role}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <ul className="space-y-1">
                                                    {res.answers.map((ans, idx) => (
                                                        <li key={idx} className="text-xs">
                                                            <span className="text-slate-400 mr-2">Q{ans.question_id}:</span>
                                                            <span className="font-medium text-slate-700">"{ans.answer}"</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ submissions, isLoading, onReview }) => {
  if (isLoading && submissions.length === 0) return <TableSkeleton />;

  const pendingReviews = submissions.filter(s => ['submitted', 'under_review', 'revision_needed'].includes(s.status));
  const approvedReviews = submissions.filter(s => s.status === 'approved');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-unair-blue to-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-lg font-semibold mb-2">Selamat Datang, Reviewer</h3>
             <p className="text-blue-100 text-sm">Anda memiliki <span className="font-bold text-unair-yellow text-lg">{pendingReviews.length}</span> protokol aktif yang perlu ditelaah.</p>
           </div>
           <ShieldCheck className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10" />
         </div>
         
         <div className="bg-white border border-slate-200 text-slate-700 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
               <h3 className="text-lg font-semibold mb-1">Total Disetujui</h3>
               <p className="text-slate-500 text-sm">Protokol yang telah mendapatkan Ethical Clearance.</p>
            </div>
            <div className="text-4xl font-bold text-green-600">{approvedReviews.length}</div>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded text-unair-blue">
            <Eye className="w-4 h-4"/>
          </div>
          <h3 className="font-bold text-slate-800">Daftar Telaah Masuk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Peneliti</th>
                <th className="px-6 py-3 font-semibold">Judul</th>
                <th className="px-6 py-3 font-semibold">Institusi</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingReviews.map(sub => (
                <tr key={sub.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{sub.researcherName}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{sub.institution}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onReview(sub)}
                      className="bg-unair-blue text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1.5"/> Telaah
                    </button>
                  </td>
                </tr>
              ))}
              {pendingReviews.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Tidak ada antrean telaah saat ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-green-50 flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded text-green-700">
             <FileCheck className="w-4 h-4"/>
          </div>
          <div>
            <h3 className="font-bold text-green-900">Arsip Disetujui & Sertifikat</h3>
            <p className="text-xs text-green-700">Daftar protokol yang telah selesai (Approved) beserta sertifikatnya.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">ID Protokol</th>
                <th className="px-6 py-3 font-semibold">Peneliti</th>
                <th className="px-6 py-3 font-semibold">Judul</th>
                <th className="px-6 py-3 font-semibold">Tanggal Setuju</th>
                <th className="px-6 py-3 font-semibold">Sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedReviews.map(sub => (
                <tr key={sub.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sub.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{sub.researcherName}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(sub.approvalDate)}</td>
                  <td className="px-6 py-4">
                    {sub.certificateUrl ? (
                        <a 
                          href={sub.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors border border-green-200"
                        >
                           <FileText className="w-3 h-3 mr-1.5"/> Lihat Sertifikat
                        </a>
                    ) : (
                        <span className="inline-flex items-center text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                           <Clock className="w-3 h-3 mr-1"/> Menunggu Admin
                        </span>
                    )}
                    <button 
                       onClick={() => onReview(sub)}
                       className="ml-2 text-xs text-slate-400 hover:text-unair-blue hover:underline"
                    >
                       Detail
                    </button>
                  </td>
                </tr>
              ))}
              {approvedReviews.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada protokol yang disetujui.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ReviewDetail: React.FC<ReviewDetailProps> = ({ submission, onBack, onSubmitReview }) => {
  const [feedback, setFeedback] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'revise' | null>(null);

  if (!submission) return <DetailSkeleton />;

  const handleAction = () => {
    if (confirmAction) {
      onSubmitReview(submission.id, confirmAction, feedback);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </button>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
             <h3 className="font-bold text-lg mb-2 capitalize text-slate-800">Konfirmasi {confirmAction === 'approve' ? 'Persetujuan' : 'Revisi'}</h3>
             <p className="text-slate-600 text-sm mb-6">
                {confirmAction === 'approve' 
                  ? 'Anda yakin menyetujui protokol ini? Sertifikat EC akan diterbitkan.' 
                  : 'Pastikan Anda telah memberikan catatan revisi yang jelas.'}
             </p>
             <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
                <button onClick={handleAction} className={`flex-1 px-4 py-2 text-white rounded-lg font-bold ${confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                   Ya, Lanjutkan
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Detail Content reused or simplified */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
         <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-slate-100 pb-6 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-800">{submission.title}</h1>
               <div className="flex gap-2 mt-2 items-center">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{submission.id}</span>
                  <StatusBadge status={submission.status} />
               </div>
            </div>
            <div className="text-right">
               <div className="font-bold text-slate-800">{submission.researcherName}</div>
               <div className="text-xs text-slate-500">{submission.institution}</div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <h4 className="font-bold text-slate-700 mb-2">Abstrak</h4>
               <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed mb-6">
                  {submission.description}
               </p>

               <h4 className="font-bold text-slate-700 mb-3 flex items-center"><FileStack className="w-4 h-4 mr-2"/> Dokumen Pendukung</h4>
               <div className="space-y-3">
                  {submission.documents.map(doc => (
                     <div key={doc.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="p-2 bg-blue-50 text-blue-500 rounded">
                              <FileText className="w-5 h-5"/>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{doc.type}</p>
                           </div>
                        </div>
                        {doc.url && (
                           <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100">
                              <Eye className="w-3 h-3 mr-1"/> Lihat
                           </a>
                        )}
                     </div>
                  ))}
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-slate-700 mb-2">Self Assessment (7 Standar Etik)</h4>
               <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {submission.selfAssessment.map(sa => (
                     <div key={sa.id} className="bg-white p-4 rounded-lg border-l-4 border-slate-300 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">{sa.standard}</p>
                        <p className="text-sm text-slate-700 italic">"{sa.response}"</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Review Action Area */}
      <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 border border-slate-700">
         <h3 className="font-bold text-lg mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-unair-yellow"/> Keputusan Reviewer</h3>
         
         <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-slate-300">Catatan / Masukan Revisi</label>
            <textarea 
               className="w-full p-4 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-unair-yellow outline-none placeholder:text-slate-600"
               rows={4}
               placeholder="Tuliskan catatan detail untuk peneliti jika perlu revisi..."
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
         </div>

         <div className="flex gap-4">
            <button 
               onClick={() => setConfirmAction('revise')}
               disabled={!feedback && confirmAction !== 'approve'}
               className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-amber-900/20"
            >
               <AlertTriangle className="w-4 h-4 mr-2"/> Minta Revisi
            </button>
            <button 
               onClick={() => setConfirmAction('approve')}
               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors flex justify-center items-center shadow-lg shadow-green-900/20"
            >
               <CheckCircle className="w-4 h-4 mr-2"/> Setujui (Approve)
            </button>
         </div>
         {!feedback && <p className="text-xs text-slate-500 mt-2 italic">* Wajib mengisi catatan jika meminta revisi.</p>}
      </div>
    </div>
  );
};

export const AdminUserManagement: React.FC<AdminUserProps> = ({ users, currentUser, isLoading, onStatusChange, onDeleteUser, onRefresh }) => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [tab, setTab] = useState<'users' | 'logs'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Fetch logs on mount or when users change
    useEffect(() => {
        apiService.getAdminLogs().then(res => {
            if(res.status === 'success') setLogs(res.data);
        });
    }, [users]); 

    // Filter Users
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.identityNumber && u.identityNumber.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-end">
                 {/* Tabs */}
                 <div className="flex gap-6 border-b border-slate-200">
                    <button onClick={() => setTab('users')} className={`pb-3 border-b-2 px-2 font-bold transition-colors ${tab === 'users' ? 'border-unair-blue text-unair-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Daftar User</button>
                    <button onClick={() => setTab('logs')} className={`pb-3 border-b-2 px-2 font-bold transition-colors ${tab === 'logs' ? 'border-unair-blue text-unair-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Log Aktivitas</button>
                 </div>
                 
                 {tab === 'users' && (
                     <div className="relative w-64">
                         <input 
                            type="text" 
                            placeholder="Cari user..." 
                            className="w-full pl-3 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-unair-blue"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                     </div>
                 )}
             </div>

             {tab === 'users' ? (
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-100 text-slate-700">
                               <tr>
                                   <th className="px-6 py-3">Nama / Identitas</th>
                                   <th className="px-6 py-3">Role</th>
                                   <th className="px-6 py-3">Institusi</th>
                                   <th className="px-6 py-3">Status</th>
                                   <th className="px-6 py-3">Aksi</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : 
                                filteredUsers.map(u => (
                                   <tr key={u.id} className="hover:bg-slate-50">
                                       <td className="px-6 py-4">
                                           <div className="font-bold text-slate-800">{u.name}</div>
                                           <div className="text-xs text-slate-500">{u.email}</div>
                                           <div className="text-xs text-slate-400 font-mono mt-0.5">{u.identityNumber}</div>
                                       </td>
                                       <td className="px-6 py-4 capitalize">
                                           <span className={`px-2 py-0.5 rounded text-xs border ${u.role === 'researcher' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{u.role}</span>
                                       </td>
                                       <td className="px-6 py-4 text-slate-600">{u.institution}</td>
                                       <td className="px-6 py-4">
                                           <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                               u.status === 'active' ? 'bg-green-100 text-green-700' : 
                                               u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                           }`}>{u.status}</span>
                                       </td>
                                       <td className="px-6 py-4 flex gap-2">
                                           {u.status === 'pending' && (
                                               <>
                                               <button onClick={() => onStatusChange(u.id, 'active')} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 border border-green-200" title="Aktifkan">
                                                   <Check className="w-4 h-4"/>
                                               </button>
                                               <button onClick={() => onStatusChange(u.id, 'rejected')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 border border-red-200" title="Tolak">
                                                   <X className="w-4 h-4"/>
                                               </button>
                                               </>
                                           )}
                                           <button 
                                              onClick={() => { if(window.confirm('Hapus user ini?')) onDeleteUser(u.id, currentUser?.name); }} 
                                              className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200" 
                                              title="Hapus User"
                                           >
                                               <Trash2 className="w-4 h-4"/>
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                               {!isLoading && filteredUsers.length === 0 && (
                                   <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada user ditemukan.</td></tr>
                               )}
                           </tbody>
                        </table>
                    </div>
                 </div>
             ) : (
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="px-6 py-3">Waktu</th>
                                    <th className="px-6 py-3">Admin</th>
                                    <th className="px-6 py-3">Aksi</th>
                                    <th className="px-6 py-3">Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{log.admin_name}</td>
                                        <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono border border-slate-200">{log.action_type}</span></td>
                                        <td className="px-6 py-4 text-slate-600">{log.description}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                   <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada log aktivitas.</td></tr>
                               )}
                            </tbody>
                        </table>
                     </div>
                 </div>
             )}
        </div>
    );
};

export const AdminSubmissionMonitoring: React.FC<AdminSubmissionProps> = ({ submissions, isLoading, onViewDetail }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
                    <p className="text-slate-500 text-sm font-medium">Total Masuk</p>
                    <p className="text-3xl font-bold text-slate-800">{submissions.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-unair-yellow">
                    <p className="text-slate-500 text-sm font-medium">Proses Review</p>
                    <p className="text-3xl font-bold text-slate-800">{submissions.filter(s => ['submitted', 'under_review'].includes(s.status)).length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-600">
                    <p className="text-slate-500 text-sm font-medium">Selesai (Approved)</p>
                    <p className="text-3xl font-bold text-slate-800">{submissions.filter(s => s.status === 'approved').length}</p>
                 </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Monitoring Semua Pengajuan</h3>
                    <button className="text-unair-blue text-sm font-bold hover:underline flex items-center">
                        <Printer className="w-4 h-4 mr-1"/> Cetak Laporan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Peneliti</th>
                                <th className="px-6 py-3">Judul</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> :
                             submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{sub.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{sub.researcherName}</div>
                                        <div className="text-xs text-slate-500">{sub.institution}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-slate-600">{sub.title}</td>
                                    <td className="px-6 py-4"><StatusBadge status={sub.status}/></td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onViewDetail(sub)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-xs">
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                             ))}
                             {!isLoading && submissions.length === 0 && (
                                   <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data pengajuan.</td></tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AdminSubmissionDetail: React.FC<AdminDetailProps> = ({ submission, onBack, onUploadCert }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if(!submission) return <DetailSkeleton/>;

    const handleUpload = async () => {
        if(file && submission) {
            setUploading(true);
            try {
                await onUploadCert(submission.id, file);
                alert('Sertifikat berhasil diupload!');
                setFile(null);
            } catch (error) {
                alert('Gagal upload sertifikat.');
            } finally {
                setUploading(false);
            }
        }
    }

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1"/> Kembali
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{submission.title}</h1>
                        <div className="flex gap-2 mt-2">
                             <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{submission.id}</span>
                             <StatusBadge status={submission.status}/>
                        </div>
                    </div>
                    {submission.status === 'approved' && (
                        <div className="text-right">
                             <span className="text-xs text-slate-500">Tanggal Approval</span>
                             <p className="font-bold text-green-700">{formatDate(submission.approvalDate)}</p>
                        </div>
                    )}
                </div>
                
                {/* Admin Actions: Upload Certificate if Approved */}
                {submission.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-green-800 mb-2 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2"/> Penerbitan Sertifikat EC
                        </h3>
                        <p className="text-sm text-green-700 mb-4">
                            Protokol ini telah disetujui. Silakan unggah file sertifikat digital (PDF) yang telah ditandatangani Ketua KEPK.
                        </p>
                        
                        <div className="flex items-end gap-4">
                             <div className="flex-1">
                                 <label className="block text-xs font-bold text-green-800 mb-1">File Sertifikat (PDF)</label>
                                 <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
                                 />
                             </div>
                             <button 
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center shadow-md shadow-green-900/10"
                             >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                                Upload
                             </button>
                        </div>
                        {submission.certificateUrl && (
                            <div className="mt-4 pt-4 border-t border-green-200 flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2"/>
                                <span className="text-sm font-bold text-green-800 mr-2">Sertifikat Aktif:</span>
                                <a href={submission.certificateUrl} target="_blank" className="text-green-700 underline text-sm flex items-center hover:text-green-900">
                                    <FileText className="w-4 h-4 mr-1"/> Lihat Dokumen
                                </a>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Basic Info */}
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Informasi Peneliti</h4>
                <div className="grid grid-cols-2 gap-6 text-sm text-slate-700 mb-8">
                    <div>
                        <p className="font-bold text-slate-500 uppercase text-xs mb-1">Nama Peneliti</p>
                        <p className="font-medium text-slate-800">{submission.researcherName}</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-500 uppercase text-xs mb-1">Institusi</p>
                        <p className="font-medium text-slate-800">{submission.institution}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="font-bold text-slate-500 uppercase text-xs mb-1">Abstrak</p>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{submission.description}</p>
                    </div>
                </div>

                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Dokumen Pendukung</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                             <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-slate-400"/>
                                <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                             </div>
                             {doc.url && <a href={doc.url} target="_blank" className="text-xs text-blue-600 font-bold hover:underline">Lihat</a>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdminDocumentManagement: React.FC<AdminDocumentProps> = ({ documents, onAdd, onDelete }) => {
    const [newDoc, setNewDoc] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newDoc) {
            setLoading(true);
            await onAdd(newDoc);
            setNewDoc('');
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderCog className="w-8 h-8 text-slate-600"/>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Master Dokumen Persyaratan</h2>
                <p className="text-slate-500 mt-2">Atur jenis dokumen wajib yang harus diunggah peneliti saat pengajuan protokol.</p>
            </div>
            
            <form onSubmit={handleAdd} className="flex gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input 
                    type="text" 
                    value={newDoc} 
                    onChange={e => setNewDoc(e.target.value)}
                    placeholder="Nama dokumen baru (misal: Surat Pengantar Institusi)"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none bg-white"
                />
                <button 
                    type="submit" 
                    disabled={loading || !newDoc}
                    className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5 mr-1"/>}
                    Tambah
                </button>
            </form>

            <div className="space-y-3">
                <h3 className="font-bold text-slate-700 mb-2 ml-1">Daftar Dokumen Aktif</h3>
                {documents.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <FileText className="w-5 h-5"/>
                            </div>
                            <span className="font-medium text-slate-700">{doc.label}</span>
                            {doc.isRequired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Wajib</span>}
                        </div>
                        <button 
                            onClick={() => { if(window.confirm('Hapus dokumen ini dari persyaratan?')) onDelete(doc.id); }}
                            className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400 italic">
                        Belum ada dokumen persyaratan yang diatur.
                    </div>
                )}
            </div>
        </div>
    );
};

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onUpdateProfile }) => {
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // States for Database Connection
    const [apiUrl, setApiUrl] = useState(apiService.getApiUrl());
    const [isDefaultUrl, setIsDefaultUrl] = useState(apiService.getApiUrl().includes('ppk2ipe.unair.ac.id'));
    
    // Developer Lock State
    const [isDevUnlocked, setIsDevUnlocked] = useState(false);
    const [devPass, setDevPass] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiService.updateAdminProfile(currentUser.id, name, email, currentPassword, newPassword);
            if(res.status === 'success') {
                alert('Profil berhasil diperbarui!');
                onUpdateProfile(name, email);
                setCurrentPassword('');
                setNewPassword('');
            } else {
                alert('Gagal: ' + res.message);
            }
        } catch(e) {
            alert('Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const saveApiConfig = () => {
       apiService.setApiUrl(apiUrl);
       setIsDefaultUrl(false);
       alert('Konfigurasi API Tersimpan. Silakan refresh halaman.');
    };
    
    const resetApiConfig = () => {
       apiService.resetApiUrl();
       setApiUrl(apiService.getApiUrl());
       setIsDefaultUrl(true);
       alert('Konfigurasi API dikembalikan ke Default.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <Settings className="w-6 h-6 mr-2 text-slate-600"/>
                        Profil Administrator
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Tampilan</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><Lock className="w-4 h-4 mr-2"/> Ganti Password</h3>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    placeholder="Password Saat Ini (Wajib)" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 outline-none placeholder:text-slate-400"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <input 
                                    type="password" 
                                    placeholder="Password Baru (Opsional)" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 outline-none placeholder:text-slate-400"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors disabled:opacity-70"
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <Server className="w-6 h-6 mr-2 text-blue-600"/>
                            Koneksi Database & API
                         </h2>
                         
                         {!isDevUnlocked ? (
                             <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Lock className="w-6 h-6 text-slate-500" />
                                </div>
                                <h3 className="font-bold text-slate-700 mb-1">Konfigurasi Terkunci</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Area ini khusus untuk Developer teknis. Masukkan password untuk mengakses konfigurasi.
                                </p>
                                <div className="flex gap-2 max-w-[250px] mx-auto">
                                    <input 
                                        type="password" 
                                        placeholder="Dev Password"
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                                        value={devPass}
                                        onChange={(e) => setDevPass(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if(devPass === 'dev123') setIsDevUnlocked(true);
                                            else alert('Password Developer Salah');
                                        }}
                                        className="bg-slate-700 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-slate-800"
                                    >
                                        Buka
                                    </button>
                                </div>
                             </div>
                         ) : (
                             <div className="animate-fadeIn">
                                 <p className="text-sm text-slate-600 mb-4">
                                    Konfigurasi endpoint API untuk menghubungkan frontend dengan backend PHP/MySQL.
                                 </p>
                                 
                                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Endpoint URL</label>
                                     <div className="flex gap-2">
                                        <input 
                                           type="text" 
                                           value={apiUrl} 
                                           onChange={e => setApiUrl(e.target.value)}
                                           className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded font-mono bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 outline-none"
                                        />
                                        <button onClick={saveApiConfig} className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                                           <Save className="w-4 h-4"/>
                                        </button>
                                     </div>
                                     {isDefaultUrl && <p className="text-xs text-green-600 mt-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Menggunakan Default Server UNAIR</p>}
                                     {!isDefaultUrl && (
                                        <div className="mt-2 flex justify-between items-center">
                                           <p className="text-xs text-amber-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Custom Endpoint</p>
                                           <button onClick={resetApiConfig} className="text-xs text-slate-500 underline hover:text-slate-800">Reset Default</button>
                                        </div>
                                     )}
                                 </div>
                                 
                                 <div className="flex items-center gap-3 text-sm text-slate-500">
                                     <Database className="w-4 h-4"/>
                                     <span>Status: <span className="text-green-600 font-bold">Connected</span></span>
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Informasi Sistem</h3>
                        <div className="space-y-2 text-sm opacity-80">
                            <p>Versi Aplikasi: <span className="font-mono">v2.1.0 (Stable)</span></p>
                            <p>Build Date: <span className="font-mono">Feb 2025</span></p>
                            <p>Lisensi: Fakultas Keperawatan UNAIR</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};