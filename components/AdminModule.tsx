import React, { useState } from 'react';
import { UserProfile, ResearchSubmission, DocumentRequirement, UserStatus } from '../types';
import { ShieldCheck, Eye, Loader2, User, Clock, FileText, AlertTriangle, CheckCircle, ArrowLeft, FileStack, DownloadCloud, Building, CreditCard, Phone, Mail, Check, X, FolderCog, Plus, Trash2, Ban, RefreshCcw, UploadCloud, Printer, Settings, Lock, FileCheck, Server, Database, Save, Unlock } from 'lucide-react';
import { StatusBadge, TableSkeleton, DetailSkeleton, formatDate } from './Shared';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiService } from '../services/apiService';

// ================= REVIEWER COMPONENTS =================

// --- REVIEWER DASHBOARD ---
interface ReviewerDashboardProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onReview: (sub: ResearchSubmission) => void;
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ submissions, isLoading, onReview }) => {
  if (isLoading && submissions.length === 0) return <TableSkeleton />;

  // Filter Data
  const pendingReviews = submissions.filter(s => ['submitted', 'under_review', 'revision_needed'].includes(s.status));
  const approvedReviews = submissions.filter(s => s.status === 'approved');

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
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

      {/* TABLE 1: DAFTAR TELAAH (PENDING) */}
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

      {/* TABLE 2: ARSIP DISETUJUI (CERTIFICATES) */}
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

// --- REVIEWER DETAIL (ACTION) ---
interface ReviewDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
  onSubmitReview: (id: string, action: 'approve' | 'revise', feedback: string) => void;
}

export const ReviewDetail: React.FC<ReviewDetailProps> = ({ submission, onBack, onSubmitReview }) => {
  if (!submission) return <DetailSkeleton />;
  const [feedback, setFeedback] = useState('');

  const isReadOnly = submission.status === 'approved';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center">
          &larr; Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{submission.id}</span>
                <StatusBadge status={submission.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{submission.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {submission.researcherName}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {formatDate(submission.submissionDate)}</span>
            </div>
          </div>
          
          {/* Certificate Button in Detail if Approved */}
          {submission.status === 'approved' && submission.certificateUrl && (
             <a 
               href={submission.certificateUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center shadow-lg shadow-green-900/10"
             >
                <FileCheck className="w-4 h-4 mr-2"/> Download Sertifikat
             </a>
          )}
        </div>

        <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Abstrak</h4>
              <p className="text-slate-600 leading-relaxed">{submission.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Dokumen Pendukung</h4>
              <div className="grid grid-cols-2 gap-4">
                {submission.documents.length > 0 ? submission.documents.map(d => (
                  <div key={d.id} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400 mr-2"/>
                    <span className="text-sm truncate flex-1">{d.name}</span>
                    {d.url ? (
                      <a 
                        href={d.url} target="_blank" rel="noopener noreferrer" 
                        className="ml-auto px-4 py-2 bg-unair-blue text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-3 h-3 mr-2" /> Lihat Dokumen
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic ml-2 px-2 py-1 bg-slate-100 rounded">Link tdk tersedia</span>
                    )}
                  </div>
                )) : <p className="text-slate-400 italic">Tidak ada dokumen.</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Self Assessment</h4>
              <div className="space-y-4">
                {submission.selfAssessment.length > 0 ? submission.selfAssessment.map(sa => (
                  <div key={sa.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-unair-blue">
                    <p className="font-medium text-slate-800 text-sm mb-1">{sa.standard}</p>
                    <p className="text-slate-600 text-sm">{sa.response}</p>
                  </div>
                )) : <p className="text-slate-400 italic">Belum ada data assessment.</p>}
              </div>
            </div>
        </div>
      </div>

      {/* Decision Section - Hide if already approved/read-only */}
      {!isReadOnly && (
        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Keputusan Reviewer</h3>
            <textarea 
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none"
            rows={4}
            placeholder="Tuliskan catatan revisi atau komentar persetujuan..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
                <button 
                onClick={() => onSubmitReview(submission.id, 'revise', feedback)}
                className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                <AlertTriangle className="w-4 h-4 mr-2"/> Minta Revisi
                </button>
                <button 
                onClick={() => onSubmitReview(submission.id, 'approve', feedback)}
                className="flex items-center px-6 py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow"
                >
                <CheckCircle className="w-4 h-4 mr-2"/> Setujui (Terbitkan EC)
                </button>
            </div>
        </div>
      )}
      
      {/* If Read Only (Approved), Show previous feedback */}
      {isReadOnly && submission.feedback && (
         <div className="bg-green-50 rounded-xl shadow p-6 border border-green-200">
            <h3 className="font-bold text-green-800 mb-2 flex items-center"><CheckCircle className="w-5 h-5 mr-2"/> Protokol Telah Disetujui</h3>
            <p className="text-sm text-green-700 mb-2">Catatan Persetujuan:</p>
            <div className="bg-white p-3 rounded border border-green-100 text-slate-600 text-sm italic">
                "{submission.feedback}"
            </div>
         </div>
      )}
    </div>
  );
};

// ================= ADMIN COMPONENTS =================

// --- ADMIN SUBMISSION MONITORING ---
interface AdminSubmissionProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onViewDetail: (sub: ResearchSubmission) => void;
}

export const AdminSubmissionMonitoring: React.FC<AdminSubmissionProps> = ({ submissions, isLoading, onViewDetail }) => {
  if (isLoading && submissions.length === 0) return <TableSkeleton />;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('Laporan Data Pengajuan Etik Penelitian', 14, 20);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);

    // Table
    const tableData = submissions.map(sub => [
      sub.id,
      sub.researcherName,
      sub.institution,
      sub.title,
      formatDate(sub.submissionDate),
      sub.status
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Peneliti', 'Institusi', 'Judul Protokol', 'Tanggal', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 59, 115] }, // unair-blue
      styles: { fontSize: 8 }
    });

    doc.save(`Laporan_KEPK_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Data Pengajuan</h3>
            <p className="text-sm text-slate-500">Monitoring seluruh protokol penelitian yang masuk.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={handleExportPDF}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-slate-200 transition-colors"
             >
                <Printer className="w-4 h-4 mr-2"/> Export PDF
             </button>
             <div className="bg-blue-50 text-unair-blue px-4 py-2 rounded-lg text-sm font-semibold border border-blue-100">
               Total: {submissions.length} Protokol
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">ID</th>
                <th className="px-6 py-3">Peneliti</th>
                <th className="px-6 py-3">Judul Protokol</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-tr-lg text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{sub.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{sub.researcherName}</div>
                    <div className="text-xs text-slate-500">{sub.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(sub.submissionDate)}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onViewDetail(sub)}
                      className="bg-blue-50 text-unair-blue px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-unair-blue hover:text-white transition-colors flex items-center justify-center mx-auto"
                    >
                      <Eye className="w-3 h-3 mr-1"/> Detail & File
                    </button>
                  </td>
                </tr>
              ))}
               {submissions.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN SUBMISSION DETAIL ---
interface AdminDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
  onUploadCert: (id: string, file: File) => Promise<void>; // Add prop for upload
}

export const AdminSubmissionDetail: React.FC<AdminDetailProps> = ({ submission, onBack, onUploadCert }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);

  if (!submission) return <DetailSkeleton />;

  const handleUploadClick = async () => {
    if (!certFile) return;
    setIsUploading(true);
    try {
      await onUploadCert(submission.id, certFile);
      setCertFile(null);
      alert("Sertifikat berhasil diunggah!");
    } catch (e) {
      alert("Gagal mengunggah sertifikat.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack} 
        className="text-slate-500 hover:text-slate-800 mb-4 flex items-center text-sm font-medium transition-colors"
      >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Pengajuan
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{submission.id}</span>
              <StatusBadge status={submission.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-2">{submission.title}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">{submission.researcherName}</div>
            <div className="text-xs text-slate-500">{submission.institution}</div>
            <div className="text-xs text-slate-400 mt-1">Diajukan: {formatDate(submission.submissionDate)}</div>
          </div>
        </div>

        {/* --- UPLOAD CERTIFICATE SECTION (Only if Approved) --- */}
        {submission.status === 'approved' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
             <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2"/>
                <h3 className="text-lg font-bold text-green-800">Penerbitan Sertifikat (Ethical Clearance)</h3>
             </div>
             
             {submission.certificateUrl ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200">
                   <div className="flex items-center">
                     <FileText className="w-8 h-8 text-green-600 mr-3"/>
                     <div>
                       <p className="font-bold text-slate-700">Sertifikat Telah Terbit</p>
                       <a href={submission.certificateUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                         Lihat Dokumen
                       </a>
                     </div>
                   </div>
                   <div className="text-xs text-slate-400 italic">
                      Dapat diunduh oleh peneliti
                   </div>
                </div>
             ) : (
                <div className="bg-white p-4 rounded-lg border border-dashed border-green-300">
                   <p className="text-sm text-slate-700 mb-3 font-medium">Unggah File Sertifikat PDF (Bertanda Tangan)</p>
                   <div className="flex gap-4 items-center">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => e.target.files && setCertFile(e.target.files[0])}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                      />
                      <button 
                        onClick={handleUploadClick}
                        disabled={!certFile || isUploading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                         {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                         Upload
                      </button>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">*Maksimal 5MB. Peneliti akan menerima notifikasi setelah upload.</p>
                </div>
             )}
          </div>
        )}

        <div className="mb-8">
          <h4 className="font-semibold text-slate-700 mb-2">Abstrak / Ringkasan</h4>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm leading-relaxed border border-slate-100">
            {submission.description}
          </div>
        </div>

        {/* Team Members */}
        {submission.teamMembers && submission.teamMembers.length > 0 && (
           <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">Tim Peneliti</h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <ul className="text-sm text-slate-600 space-y-1">
                  {submission.teamMembers.map((member, i) => (
                    <li key={i} className="flex gap-2">
                       <span className="font-medium">• {member.name}</span>
                       <span className="text-slate-400">({member.role}{member.institution ? ` - ${member.institution}` : ''})</span>
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <FileStack className="w-5 h-5 mr-2 text-unair-blue"/>
            Repository Dokumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.documents.length > 0 ? (
              submission.documents.map((doc) => (
                <div key={doc.id} className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all flex justify-between items-center">
                  <div className="flex items-center overflow-hidden">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mr-3 shrink-0">
                        <FileText className="w-5 h-5"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.type}</p>
                    </div>
                  </div>
                  {doc.url ? (
                    <a 
                      href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto px-4 py-2 bg-unair-blue text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-3 h-3 mr-2" /> Lihat Dokumen
                    </a>
                  ) : (
                    <button 
                      onClick={() => alert("File ini belum memiliki link Google Drive.")}
                      className="ml-4 p-2 text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <DownloadCloud className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))
            ) : <div className="col-span-2 text-center py-8 text-slate-400 italic">Tidak ada dokumen.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN USER MANAGEMENT ---
interface AdminUserProps {
  users: UserProfile[];
  isLoading: boolean;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserProps> = ({ users, isLoading, onStatusChange, onDeleteUser }) => {
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  const handleDeleteClick = (userId: string, userName: string) => {
    if (window.confirm(`Yakin ingin menghapus pengguna "${userName}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      onDeleteUser(userId);
    }
  };

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.status === 'pending');

  if (isLoading && users.length === 0) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
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

// --- ADMIN DOCUMENT MANAGEMENT ---
interface AdminDocumentProps {
  documents: DocumentRequirement[];
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
}

export const AdminDocumentManagement: React.FC<AdminDocumentProps> = ({ documents, onAdd, onDelete }) => {
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAdd(newLabel);
      setNewLabel('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
             <FolderCog className="w-6 h-6"/>
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Master Dokumen Persyaratan</h3>
             <p className="text-sm text-slate-500">Atur dokumen apa saja yang wajib diunggah oleh peneliti.</p>
           </div>
        </div>

        <div className="flex gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Nama Dokumen Baru (misal: Bukti Bayar Etik)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button 
            onClick={handleAdd}
            disabled={!newLabel.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2"/> Tambah
          </button>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 group">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded border border-slate-200">
                   <FileText className="w-5 h-5 text-slate-500"/>
                 </div>
                 <div>
                   <p className="font-semibold text-slate-700">{doc.label}</p>
                   <p className="text-xs text-slate-400 font-mono">ID: {doc.id}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Wajib</span>
                 <button 
                   onClick={() => {
                     if(window.confirm(`Hapus persyaratan "${doc.label}"?`)) onDelete(doc.id);
                   }}
                   className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                 >
                   <Trash2 className="w-4 h-4"/>
                 </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-center text-slate-400 italic py-4">Belum ada persyaratan dokumen.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN SETTINGS ---
interface AdminSettingsProps {
    currentUser: UserProfile;
    onUpdateProfile: (email: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onUpdateProfile }) => {
    // Account Settings State
    const [email, setEmail] = useState(currentUser.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // System Config State (LOCKED BY DEFAULT)
    const [isSystemUnlocked, setIsSystemUnlocked] = useState(false);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockLoading, setUnlockLoading] = useState(false);
    
    // API Config State
    const [apiUrl, setApiUrl] = useState(apiService.getApiUrl());
    const [uploadPath, setUploadPath] = useState(''); // Visual only for now
    
    // 1. HANDLE ACCOUNT UPDATE
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Password saat ini wajib diisi untuk keamanan.' });
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiService.updateAdminProfile(currentUser.id, email, currentPassword, newPassword);
            if (res.status === 'success') {
                setMessage({ type: 'success', text: res.message });
                // Update email di state aplikasi utama
                onUpdateProfile(email);
                // Reset password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 2. HANDLE SYSTEM UNLOCK
    const handleUnlockSystem = async (e: React.FormEvent) => {
      e.preventDefault();
      setUnlockLoading(true);

      // --- BYPASS PASSWORD (dev123) ---
      if (unlockPassword === 'dev123') {
          setTimeout(() => {
              setIsSystemUnlocked(true);
              setUnlockPassword('');
              setUnlockLoading(false);
          }, 500);
          return;
      }

      try {
        // Verifikasi password dengan mencoba "login" ulang di background
        const res = await apiService.login(currentUser.email, unlockPassword);
        if (res.status === 'success') {
          setIsSystemUnlocked(true);
          setUnlockPassword('');
        } else {
          alert('Password Admin Salah. Akses Ditolak.');
        }
      } catch (e) {
        alert('Gagal memverifikasi password.');
      } finally {
        setUnlockLoading(false);
      }
    };

    // 3. HANDLE SAVE SYSTEM CONFIG
    const handleSaveConfig = () => {
      if(window.confirm('Mengubah API URL dapat menyebabkan aplikasi tidak bisa terhubung. Yakin?')) {
        apiService.setApiUrl(apiUrl);
        alert('Konfigurasi disimpan. Halaman akan dimuat ulang.');
        window.location.reload();
      }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
             {/* --- ACCOUNT SETTINGS CARD --- */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        <Settings className="w-6 h-6"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Pengaturan Akun Admin</h3>
                        <p className="text-sm text-slate-500">Perbarui kredensial akses administrator.</p>
                    </div>
                 </div>

                 {message && (
                     <div className={`p-4 rounded-lg mb-6 flex items-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                         {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2"/> : <AlertTriangle className="w-4 h-4 mr-2"/>}
                         {message.text}
                     </div>
                 )}

                 <form onSubmit={handleSave} className="space-y-6">
                     <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Username / Email Admin</label>
                         <div className="relative">
                             <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                             <input 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow placeholder:text-slate-400"
                                required
                             />
                         </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100">
                         <h4 className="text-sm font-bold text-slate-800 mb-4">Ganti Password (Opsional)</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-semibold text-slate-600 mb-1">Password Baru</label>
                                 <div className="relative">
                                     <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                     <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                                        placeholder="Kosongkan jika tidak diganti"
                                     />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-semibold text-slate-600 mb-1">Ulangi Password Baru</label>
                                 <div className="relative">
                                     <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                     <input 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                                        placeholder="Konfirmasi password baru"
                                     />
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="pt-6 bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
                         <label className="block text-sm font-bold text-slate-800 mb-2">Verifikasi Keamanan <span className="text-red-500">*</span></label>
                         <p className="text-xs text-slate-500 mb-3">Masukkan password Anda saat ini untuk menyimpan perubahan.</p>
                         <div className="flex gap-4">
                             <div className="relative flex-1">
                                 <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                 <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                                    placeholder="Password Saat Ini"
                                    required
                                 />
                             </div>
                             <button 
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 flex items-center disabled:opacity-50"
                             >
                                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Simpan Perubahan'}
                             </button>
                         </div>
                     </div>
                 </form>
             </div>

             {/* --- SYSTEM CONFIG CARD (LOCKED) --- */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                          <Server className="w-6 h-6"/>
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-800">Konfigurasi Sistem & API</h3>
                          <p className="text-sm text-slate-500">Pengaturan endpoint API dan penyimpanan file.</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 ${isSystemUnlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {isSystemUnlocked ? <Unlock className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
                       {isSystemUnlocked ? 'Unlocked' : 'Locked'}
                    </div>
                </div>

                {!isSystemUnlocked ? (
                   // LOCKED STATE
                   <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-slate-400"/>
                      </div>
                      <h4 className="text-slate-800 font-bold mb-2">Area Terproteksi</h4>
                      <p className="text-slate-500 text-sm max-w-md mb-6">
                        Konfigurasi ini bersifat sensitif. Silakan masukkan password Administrator Anda saat ini untuk membuka akses edit URL API dan Storage.
                      </p>
                      
                      <form onSubmit={handleUnlockSystem} className="flex gap-3 w-full max-w-sm">
                         <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <input 
                              type="password"
                              className="block w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                              placeholder="Password Admin"
                              value={unlockPassword}
                              onChange={(e) => setUnlockPassword(e.target.value)}
                            />
                         </div>
                         <button 
                           type="submit"
                           disabled={!unlockPassword || unlockLoading}
                           className="bg-slate-800 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center"
                         >
                            {unlockLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Buka'}
                         </button>
                      </form>
                   </div>
                ) : (
                   // UNLOCKED STATE
                   <div className="p-6 space-y-6 animate-fadeIn">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
                        <strong>Perhatian:</strong> Mengubah URL API dapat menyebabkan aplikasi tidak dapat terhubung ke server backend. Pastikan URL valid dan CORS diaktifkan.
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">API Base URL Endpoint</label>
                          <div className="relative">
                              <Server className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                              <input 
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                placeholder="https://domain.com/api/"
                              />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Default: <code>https://ppk2ipe.unair.ac.id/simepkapi/index.php</code></p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-800 mb-2">Storage / Upload Directory (Read Only)</label>
                          <div className="relative">
                              <Database className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                              <input 
                                type="text"
                                value="/home/pkkiiperndidikanu/public_html/epkners/upload/"
                                disabled
                                className="block w-full pl-10 pr-3 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-mono text-sm cursor-not-allowed"
                              />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Path penyimpanan file di server (diatur via <code>api/index.php</code>).</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                          <button 
                             onClick={() => { setIsSystemUnlocked(false); setApiUrl(apiService.getApiUrl()); }}
                             className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                          >
                             Tutup / Batal
                          </button>
                          <button 
                             onClick={handleSaveConfig}
                             className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center"
                          >
                             <Save className="w-4 h-4 mr-2"/>
                             Simpan Konfigurasi
                          </button>
                      </div>
                   </div>
                )}
             </div>
        </div>
    );
};
