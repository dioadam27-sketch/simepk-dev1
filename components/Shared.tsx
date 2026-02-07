import React from 'react';
import { SubmissionStatus } from '../types';
import { jsPDF } from 'jspdf';

// --- DATE FORMATTER (WIB / JAKARTA) ---
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  // Cek validitas tanggal
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
};

// --- STATUS BADGE ---
export const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-600',
    under_review: 'bg-amber-100 text-amber-700',
    revision_needed: 'bg-red-100 text-red-600',
    approved: 'bg-green-100 text-green-700',
    monitoring: 'bg-purple-100 text-purple-700',
  };

  const labels = {
    draft: 'Draft',
    submitted: 'Terkirim',
    under_review: 'Dalam Telaah',
    revision_needed: 'Perlu Revisi',
    approved: 'Disetujui (EC Terbit)',
    monitoring: 'Monitoring',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- SKELETON LOADERS ---

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 h-14"></div>
    <div className="p-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-slate-100 flex p-4 items-center">
           <div className="h-4 bg-slate-200 rounded w-1/6 mr-4"></div>
           <div className="h-4 bg-slate-200 rounded w-1/4 mr-4"></div>
           <div className="h-4 bg-slate-200 rounded w-1/4 mr-auto"></div>
           <div className="h-6 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
     <div className="bg-white rounded-xl h-40 border border-slate-200"></div>
     <div className="bg-white rounded-xl h-64 border border-slate-200"></div>
  </div>
);

// --- PDF GENERATOR (MANUAL GUIDE) ---
export const generateManualPDF = (role: 'general' | 'researcher' | 'reviewer' | 'admin') => {
  const doc = new jsPDF();
  const lineHeight = 7;
  let y = 20;

  // Helper title
  const addTitle = (text: string) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 14, y);
    y += lineHeight * 1.5;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 59, 115); // unair blue
    doc.text(text, 14, y);
    doc.setTextColor(0, 0, 0); // reset
    y += lineHeight;
  };

  const addText = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 14, y);
    y += (splitText.length * 5) + 3;
  };

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > 280) {
      doc.addPage();
      y = 20;
    }
  }

  // Header
  doc.setFontSize(10);
  doc.text("SIM KEPK - Fakultas Keperawatan Universitas Airlangga", 14, 10);
  doc.line(14, 12, 196, 12);
  y = 25;

  // --- RESEARCHER GUIDE ---
  if (role === 'general' || role === 'researcher') {
    addTitle("PANDUAN PENGGUNA: PENELITI");
    
    addSubtitle("1. Registrasi Akun");
    addText("• Buka SIM KEPK dan klik tombol 'Daftar Akun Baru'.\n• Pilih peran 'Peneliti'.\n• Isi NIP/NIM/NIK, Nama Lengkap, Institusi, Email, dan No HP dengan benar.\n• Tunggu validasi admin (maksimal 1x24 jam). Anda tidak bisa login sebelum akun diaktifkan.");

    addSubtitle("2. Pengajuan Protokol Baru");
    addText("• Login menggunakan NIP/NIM/NIK dan Password.\n• Klik menu 'Pengajuan Baru' di sidebar.\n• Tahap 1: Isi Judul, Abstrak, dan Anggota Peneliti. Upload dokumen persyaratan (Protokol & PSP).\n• Tahap 2: Isi Self-Assessment 7 Standar Etik.\n• Klik 'Kirim Pengajuan'. Status akan berubah menjadi 'Submitted'.");

    checkPageBreak(30);
    addSubtitle("3. Proses Telaah & Revisi");
    addText("• Protokol akan ditelaah oleh Reviewer.\n• Cek status secara berkala di menu 'Monitoring'.\n• Jika status 'Perlu Revisi', lihat catatan reviewer dan klik tombol 'Perbaiki Dokumen' untuk upload ulang.");

    addSubtitle("4. Penerbitan Sertifikat (Ethical Clearance)");
    addText("• Jika status berubah menjadi 'Approved', sertifikat EC telah terbit.\n• Klik tombol 'Sertifikat EC' di dashboard untuk mengunduh PDF.");
    
    addSubtitle("5. Lupa Password");
    addText("• Pada halaman login, klik 'Lupa Password'.\n• Masukkan NIP/NIM/NIK Anda.\n• Admin akan menerima notifikasi dan melakukan reset password secara manual.");
  }

  // --- REVIEWER GUIDE (Sekarang masuk juga di General) ---
  if (role === 'general' || role === 'reviewer') {
    // Jika ini adalah panduan general, tambahkan page break pemisah
    if (role === 'general') {
        doc.addPage();
        y = 20;
    }
    
    addTitle("PANDUAN PENGGUNA: REVIEWER");

    addSubtitle("1. Akses & Login");
    addText("• Buka Portal Pengguna SIM KEPK.\n• Masuk menggunakan NIM/NIP/NIK dan Password yang telah didaftarkan.\n• Pastikan memilih tab peran 'Reviewer' saat mendaftar atau login (jika akun ganda).");

    addSubtitle("2. Dashboard Telaah");
    addText("• Halaman utama menampilkan statistik protokol yang masuk.\n• Tabel 'Daftar Telaah Masuk' berisi protokol dengan status 'Submitted' atau 'Revisi' yang membutuhkan tindakan Anda.\n• Klik tombol 'Telaah' (ikon Mata) untuk mulai memeriksa.");

    addSubtitle("3. Proses Telaah Protokol");
    addText("• Periksa Detail: Baca judul, peneliti, dan abstrak.\n• Periksa Dokumen: Klik tombol 'Lihat Dokumen' untuk membuka PDF Protokol/Informed Consent di tab baru.\n• Periksa Self-Assessment: Baca jawaban peneliti terhadap 7 Standar Etik (Nilai Sosial, Nilai Ilmiah, dll).");

    checkPageBreak(60);
    addSubtitle("4. Memberikan Keputusan");
    addText("Di bagian bawah halaman detail, terdapat kolom 'Keputusan Reviewer'.\n\nOPSI A: MINTA REVISI\n• Pilih ini jika dokumen tidak lengkap atau belum memenuhi standar etik.\n• Wajib menuliskan catatan perbaikan pada kolom feedback.\n• Status pengajuan akan berubah menjadi 'Perlu Revisi' dan dikembalikan ke peneliti.\n\nOPSI B: SETUJUI (APPROVE)\n• Pilih ini jika protokol sudah memenuhi seluruh prinsip etik.\n• Sistem akan mencatat tanggal persetujuan (Approval Date).\n• Status berubah menjadi 'Approved'. Admin akan menerbitkan sertifikat EC.");

    checkPageBreak(40);
    addSubtitle("5. Monitoring & Arsip");
    addText("• Protokol yang telah disetujui akan pindah ke tabel 'Arsip Disetujui'.\n• Anda dapat melihat kembali riwayat telaah dan sertifikat yang telah diterbitkan oleh Admin.");
  }

  // --- ADMIN GUIDE ---
  if (role === 'admin') {
    if(y > 200) { doc.addPage(); y = 20; }
    addTitle("PANDUAN PENGGUNA: ADMINISTRATOR");

    addSubtitle("1. Manajemen User");
    addText("• Menu 'Manajemen User' digunakan untuk memvalidasi akun baru.\n• Klik tombol 'Check' (Hijau) untuk mengaktifkan user, atau 'Silang' (Merah) untuk menolak.\n• Gunakan icon 'Kunci' untuk mereset password user jika ada permintaan.");

    addSubtitle("2. Penerbitan Sertifikat");
    addText("• Masuk ke menu 'Data Pengajuan'.\n• Pilih protokol dengan status 'Approved'.\n• Pada halaman detail, upload file PDF sertifikat yang telah ditandatangani Ketua KEPK.\n• Setelah diupload, peneliti dapat langsung mengunduhnya.");

    addSubtitle("3. Pengaturan Dokumen");
    addText("• Menu 'Master Dokumen' digunakan untuk menambah atau menghapus syarat dokumen wajib saat pengajuan.");
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Halaman ${i} dari ${pageCount}`, 190, 290, { align: 'right' });
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 290);
  }

  const fileName = role === 'general' ? 'Panduan_Lengkap_SIM_KEPK.pdf' : `Panduan_SIM_KEPK_${role}.pdf`;
  doc.save(fileName);
};