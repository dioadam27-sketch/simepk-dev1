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
    
    // Form Add Question
    const [newQText, setNewQText] = useState('');
    const [newQType, setNewQType] = useState<'text' | 'rating' | 'yesno'>('rating');

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

    const handleDeleteQuestion = async (id: number) => {
        if(confirm('Hapus pertanyaan ini?')) {
            await apiService.deleteQuestion(id);
            fetchQuestions();
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
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
                                            q.question_type === 'yesno' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {q.question_type}
                                        </span>
                                        <span className="font-medium text-slate-800">{q.question_text}</span>
                                    </div>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded">
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
  if (!submission) return <DetailSkeleton />;
  const [feedback, setFeedback] = useState('');
  const isReadOnly = submission.status === 'approved';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1"/> Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
         <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{submission.id}</span>
                <StatusBadge status={submission.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{submission.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {submission.researcherName} ({submission.institution})</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {formatDate(submission.submissionDate)}</span>
            </div>
          </div>
         </div>
         
         <div className="p-4 bg-slate-50 rounded border border-slate-100 mb-6">
             <h4 className="text-sm font-bold text-slate-700 mb-2">Abstrak</h4>
             <p className="text-sm text-slate-600 leading-relaxed">{submission.description}</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><FileStack className="w-4 h-4 mr-2"/> Dokumen Pendukung</h4>
                <div className="space-y-2">
                    {submission.documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded text-sm">
                            <span className="text-slate-600">{doc.name}</span>
                            {doc.url ? (
                                <a href={doc.url} target="_blank" rel="noreferrer" className="text-unair-blue hover:underline text-xs font-bold">Buka PDF</a>
                            ) : <span className="text-xs text-slate-400">Processing</span>}
                        </div>
                    ))}
                    {submission.documents.length === 0 && <p className="text-sm text-slate-400 italic">Tidak ada dokumen.</p>}
                </div>
             </div>
             <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Self Assessment</h4>
                <div className="h-48 overflow-y-auto pr-2 custom-scrollbar bg-white border border-slate-200 rounded p-3">
                    {submission.selfAssessment.map(sa => (
                        <div key={sa.id} className="mb-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <div className="text-xs font-bold text-slate-800">{sa.standard}</div>
                            <div className="text-xs text-slate-600 italic">"{sa.response}"</div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
         
         {!isReadOnly && (
             <div className="border-t border-slate-200 pt-6 mt-6">
                 <h4 className="text-lg font-bold text-slate-800 mb-4">Keputusan Reviewer</h4>
                 <div className="mb-4">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Catatan / Feedback (Wajib untuk Revisi)</label>
                     <textarea 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-unair-blue focus:border-transparent outline-none"
                        rows={3}
                        placeholder="Berikan catatan perbaikan atau alasan persetujuan..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                     />
                 </div>
                 <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => onSubmitReview(submission.id, 'revise', feedback)} 
                        disabled={!feedback}
                        className="px-5 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold disabled:opacity-50"
                    >
                        Minta Revisi
                    </button>
                    <button 
                        onClick={() => onSubmitReview(submission.id, 'approve', feedback)} 
                        className="px-5 py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 font-bold shadow-lg shadow-blue-900/20"
                    >
                        Setujui (Approve)
                    </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export const AdminSubmissionMonitoring: React.FC<AdminSubmissionProps> = ({ submissions, isLoading, onViewDetail }) => {
    if (isLoading && submissions.length === 0) return <TableSkeleton />;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Semua Data Pengajuan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Peneliti</th>
                <th className="px-6 py-3 font-semibold">Judul</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sub.id}</td>
                  <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{sub.researcherName}</div>
                      <div className="text-xs text-slate-500">{sub.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onViewDetail(sub)}
                      className="text-unair-blue hover:text-blue-800 font-semibold text-xs border border-unair-blue/30 px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data pengajuan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
};

export const AdminSubmissionDetail: React.FC<AdminDetailProps> = ({ submission, onBack, onUploadCert }) => {
    if (!submission) return <DetailSkeleton />;
    
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                await onUploadCert(submission.id, e.target.files[0]);
                alert('Sertifikat berhasil diupload!');
            } catch (err) {
                alert('Gagal upload sertifikat.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1"/> Kembali ke Daftar
            </button>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{submission.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {submission.researcherName}</span>
                            <span className="flex items-center"><Building className="w-4 h-4 mr-1"/> {submission.institution}</span>
                            <StatusBadge status={submission.status} />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded border border-slate-100 mb-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Abstrak</h4>
                    <p className="text-sm text-slate-600">{submission.description}</p>
                </div>

                {submission.status === 'approved' && (
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><FileCheck className="w-5 h-5 mr-2 text-green-600"/> Penerbitan Sertifikat EC</h3>
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                            {submission.certificateUrl ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-800">Sertifikat Telah Terbit</h4>
                                        <p className="text-xs text-green-700 mb-4">Diupload pada: {formatDate(submission.approvalDate)}</p>
                                        <a href={submission.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                                            <DownloadCloud className="w-4 h-4 mr-2"/> Download Sertifikat
                                        </a>
                                    </div>
                                    <div className="pt-4 border-t border-green-200 w-full max-w-xs mx-auto">
                                        <p className="text-xs text-green-700 mb-2">Perlu revisi file?</p>
                                        <label className="cursor-pointer text-xs font-bold text-green-800 hover:underline">
                                            Upload Ulang
                                            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                                        Protokol ini telah disetujui. Silakan upload file sertifikat Ethical Clearance (PDF) yang telah ditandatangani oleh Ketua KEPK.
                                    </p>
                                    <label className={`inline-flex items-center px-6 py-3 bg-unair-blue text-white rounded-lg font-bold cursor-pointer hover:bg-blue-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <UploadCloud className="w-5 h-5 mr-2"/>}
                                        {isUploading ? 'Mengupload...' : 'Upload Sertifikat PDF'}
                                        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AdminUserManagement: React.FC<AdminUserProps> = ({ users, currentUser, isLoading, onStatusChange, onDeleteUser, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  
  // States for Logs
  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // States for Password Reset
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [resetTab, setResetTab] = useState<'token' | 'manual'>('token');
  const [newManualPass, setNewManualPass] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{wa: string, token: string} | null>(null);

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id, currentUser?.name);
      setUserToDelete(null);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setShowLogModal(true);
    try {
        const res = await apiService.getAdminLogs();
        if(res.status === 'success') {
            setLogs(res.data);
        }
    } catch(e) {
        console.error("Gagal load log", e);
    } finally {
        setLoadingLogs(false);
    }
  };

  // --- RESET HANDLERS ---
  const handleResetToDefault = async () => {
      if(!resetModalUser) return;
      setResetLoading(true);
      try {
          // Panggil API Reset To Default
          const res = await apiService.adminResetToDefault(resetModalUser.id, currentUser?.name || 'Admin');
          if(res.status === 'success') {
              setGeneratedLink({
                  wa: res.whatsapp_link,
                  token: res.new_password // Reuse token state to store new password
              });
          } else {
              alert(res.message);
          }
      } catch (e) {
          alert('Gagal mereset password.');
      } finally {
          setResetLoading(false);
      }
  };

  const handleManualReset = async () => {
      if(!resetModalUser || !newManualPass) return;
      setResetLoading(true);
      try {
          const res = await apiService.adminResetUserPassword(resetModalUser.id, newManualPass);
          if(res.status === 'success') {
              alert('Password berhasil diubah.');
              setResetModalUser(null);
              setNewManualPass('');
          } else {
              alert(res.message);
          }
      } catch(e) {
          alert('Gagal mereset password.');
      } finally {
          setResetLoading(false);
      }
  };

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.status === 'pending');

  if (isLoading && users.length === 0) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      
      {/* --- MODAL LOG HISTORY --- */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-500"/> 
                        Riwayat Aktivitas Admin
                    </h3>
                    <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                        <XCircle className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-0 overflow-y-auto flex-1">
                    {loadingLogs ? (
                        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Waktu</th>
                                    <th className="px-6 py-3">Admin / Sistem</th>
                                    <th className="px-6 py-3">Aktivitas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => {
                                    const isResetRequest = log.action_type === 'RESET_REQUEST';
                                    return (
                                        <tr key={log.id} className={`hover:bg-slate-50 ${isResetRequest ? 'bg-amber-50' : ''}`}>
                                            <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                                            <td className="px-6 py-3 font-medium text-slate-800">{log.admin_name}</td>
                                            <td className="px-6 py-3 text-slate-600">
                                                {isResetRequest && <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded mr-1 font-bold">URGENT</span>}
                                                {log.description}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {logs.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Belum ada riwayat aktivitas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl text-right">
                    <button onClick={() => setShowLogModal(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold text-slate-700">Tutup</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL RESET PASSWORD --- */}
      {resetModalUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">Reset Password Pengguna</h3>
                        <p className="text-xs text-slate-500">{resetModalUser.name} ({resetModalUser.identityNumber})</p>
                    </div>
                    <button onClick={() => { setResetModalUser(null); setGeneratedLink(null); setNewManualPass(''); }} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setResetTab('token')}
                        className={`flex-1 py-3 text-sm font-bold ${resetTab === 'token' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Reset ke Default (NIM/NIK)
                    </button>
                    <button 
                         onClick={() => setResetTab('manual')}
                         className={`flex-1 py-3 text-sm font-bold ${resetTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Ubah Manual
                    </button>
                </div>

                <div className="p-6">
                    {resetTab === 'token' ? (
                        <div className="space-y-4">
                            {!generatedLink ? (
                                <div className="text-center">
                                    <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        <RefreshCcw className="w-8 h-8"/>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Password pengguna akan direset secara otomatis menjadi sama dengan <strong>Nomor Identitas (NIM/NIP/NIK)</strong> mereka.
                                    </p>
                                    <button 
                                        onClick={handleResetToDefault}
                                        disabled={resetLoading}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Reset Password Sekarang'}
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fadeIn">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2"/>
                                        <p className="text-sm font-bold text-green-800">Password Berhasil Direset</p>
                                        <p className="text-xs text-green-700">Notifikasi email telah dikirim otomatis.</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Kirim Info via WhatsApp</label>
                                        <a 
                                            href={generatedLink.wa} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="mt-2 flex items-center justify-center w-full py-3 bg-[#25D366] text-white rounded-lg font-bold hover:brightness-90 transition-all shadow-md"
                                        >
                                            <Send className="w-4 h-4 mr-2"/>
                                            Kirim Notifikasi WA
                                        </a>
                                    </div>
                                    
                                    <div className="text-center text-xs text-slate-500">
                                        Password saat ini: <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">{generatedLink.token}</span>
                                    </div>
                                    
                                    <button onClick={() => { setResetModalUser(null); setGeneratedLink(null); }} className="w-full mt-4 py-2 border border-slate-300 rounded text-slate-600 text-sm font-bold hover:bg-slate-50">Selesai</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <p className="text-sm text-slate-600 bg-yellow-50 p-3 rounded border border-yellow-100">
                                <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-600"/>
                                Password akan langsung diubah. Berikan password baru ini kepada pengguna secara manual.
                             </p>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                                    placeholder="Masukkan password..."
                                    value={newManualPass}
                                    onChange={e => setNewManualPass(e.target.value)}
                                />
                             </div>
                             <button 
                                onClick={handleManualReset}
                                disabled={!newManualPass || resetLoading}
                                className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 disabled:opacity-50 flex justify-center"
                             >
                                {resetLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Simpan Password Baru'}
                             </button>
                        </div>
                    )}
                </div>
            </div>
         </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 transform scale-100 transition-transform">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Hapus Pengguna?</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Apakah Anda yakin ingin menghapus user <span className="font-bold text-slate-800">{userToDelete.name}</span> secara permanen?
                </p>
             </div>
             <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setUserToDelete(null)} 
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

      {/* --- HEADER --- */}
      <div className="flex gap-4 mb-4 items-center justify-between">
        <div className="flex gap-4">
            <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
            Semua User
            </button>
            <button 
            onClick={() => setFilter('pending')}
            className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-unair-yellow text-slate-900' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
            Menunggu Validasi
            {users.filter(u => u.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
            </button>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchLogs}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                title="Lihat Riwayat Log"
            >
                <History className="w-4 h-4"/>
                Log Riwayat
            </button>
            <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                title="Muat Ulang Data User"
            >
                <RefreshCcw className="w-4 h-4"/>
                Refresh Data
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nama Lengkap</th>
                <th className="px-6 py-3">Kontak & Identitas</th>
                <th className="px-6 py-3">Peran / Institusi</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">Bergabung: {formatDate(user.joinedAt)}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center text-xs text-slate-600"><Mail className="w-3 h-3 mr-1"/> {user.email}</div>
                    <div className="flex items-center text-xs text-slate-600"><Phone className="w-3 h-3 mr-1"/> {user.phone || '-'}</div>
                    <div className="flex items-center text-xs text-slate-600"><CreditCard className="w-3 h-3 mr-1"/> {user.identityNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium capitalize text-slate-700 flex items-center gap-1">
                       {user.role === 'researcher' ? <User className="w-3 h-3"/> : <ShieldCheck className="w-3 h-3"/>}
                       {user.role}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3"/> {user.institution}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      user.status === 'suspended' ? 'bg-slate-200 text-slate-600' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {user.status === 'active' && (
                        // TOMBOL RESET PASSWORD (KUNCI)
                        <button 
                            onClick={() => { setResetModalUser(user); setGeneratedLink(null); setNewManualPass(''); setResetTab('token'); }} 
                            className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100" 
                            title="Reset Password"
                        >
                            <Key className="w-4 h-4"/>
                        </button>
                      )}
                      
                      {user.status === 'pending' && (
                        <>
                          <button onClick={() => onStatusChange(user.id, 'active')} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Aktifkan">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => onStatusChange(user.id, 'rejected')} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Tolak">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {user.status === 'active' && (
                        <button onClick={() => onStatusChange(user.id, 'suspended')} className="p-1.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200" title="Suspend Akun">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      
                      {user.status === 'suspended' && (
                        <button onClick={() => onStatusChange(user.id, 'active')} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Aktifkan Kembali">
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button onClick={() => handleDeleteClick(user.id, user.name)} className="p-1.5 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 ml-2" title="Hapus Permanen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data user.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminDocumentManagement: React.FC<AdminDocumentProps> = ({ documents, onAdd, onDelete }) => {
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newItem) return;
        setIsLoading(true);
        await onAdd(newItem);
        setNewItem('');
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <FolderCog className="w-6 h-6 mr-2 text-unair-blue"/>
                    Pengaturan Master Dokumen
                </h2>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                    Dokumen ini akan menjadi syarat wajib (mandatory) bagi peneliti saat mengajukan protokol baru.
                </div>
                
                <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                    <input 
                        type="text" 
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue focus:border-transparent outline-none"
                        placeholder="Contoh: Surat Izin Lokasi Penelitian..."
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!newItem || isLoading} 
                        className="bg-unair-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
                    >
                        {isLoading ? 'Menambah...' : '+ Tambah Dokumen'}
                    </button>
                </form>

                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                             <div className="font-medium text-slate-700">{doc.label}</div>
                             <div className="flex items-center gap-3">
                                 <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Wajib</span>
                                 <button 
                                    onClick={() => onDelete(doc.id)}
                                    className="p-2 bg-white border border-slate-200 text-red-500 rounded hover:bg-red-50"
                                    title="Hapus"
                                 >
                                    <Trash2 className="w-4 h-4"/>
                                 </button>
                             </div>
                        </div>
                    ))}
                    {documents.length === 0 && <p className="text-center text-slate-400 italic">Belum ada dokumen yang diatur.</p>}
                </div>
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
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg"/>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><Lock className="w-4 h-4 mr-2"/> Ganti Password</h3>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    placeholder="Password Saat Ini (Wajib)" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <input 
                                    type="password" 
                                    placeholder="Password Baru (Opsional)" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                                   className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-700 font-mono"
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