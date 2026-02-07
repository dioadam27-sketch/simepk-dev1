import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, ChevronRight, FileText, Users, CheckCircle, ArrowRight, BookOpen, Menu, X, List, FileSignature, Microscope, Scale, Activity, Gavel, FileCheck, Brain, Lock, ExternalLink } from 'lucide-react';
import { generateManualPDF } from './Shared';

interface LandingPageProps {
  onEnterSystem: () => void;
  onOpenQuestionnaire?: () => void;
}

// --- TRANSLATION DICTIONARY ---
const translations = {
  id: {
    nav: {
      home: "Beranda",
      about: "Tentang KEPK",
      flow: "Alur Pengajuan",
      questionnaire: "Kuesioner",
      guide: "Panduan Sistem",
      downloads: "Unduh Dokumen",
      login: "Masuk SIM KEPK"
    },
    hero: {
      badge: "Komisi Etik Penelitian Kesehatan",
      title_1: "Integritas Etik untuk",
      title_2: "Kualitas Riset",
      description: "Lembaga otoritas yang berwenang melakukan kajian etik, monitoring, dan evaluasi penelitian kesehatan untuk menjamin perlindungan subjek manusia sesuai standar WHO.",
      btn_submit: "Ajukan Protokol",
      btn_learn: "Pelajari Alur",
      btn_download: "Download Dokumen KEPK",
      accredited: "Terakreditasi",
      accredited_sub: "Komite Etik Nasional",
      card_1: "3 Prinsip Etik",
      card_2: "7 Standar Etik",
      card_3: "25 Pedoman WHO"
    },
    about: {
      title: "Informasi KEPK",
      subtitle: "Pedoman, tugas, dan prinsip integritas penelitian.",
      card_1_title: "Tugas Pokok & Fungsi KEPK",
      card_1_desc: "KEPK (Komisi Etik Penelitian Kesehatan) merupakan lembaga otonom yang diberikan wewenang untuk melakukan kajian etik penelitian kesehatan melalui 3 prinsip etik, 7 standar etik dan 25 pedoman etik.",
      card_1_list: [
        "Melakukan kajian etik protokol penelitian kesehatan yang mengikutsertakan manusia dan/atau hewan percobaan.",
        "Memberikan persetujuan etik (ethical clearance) terhadap protokol penelitian.",
        "Melakukan monitoring dan evaluasi terhadap pelaksanaan penelitian yang telah memperoleh persetujuan etik.",
        "Melakukan sosialisasi pedoman etik sesuai standar dan pedoman WHO.",
        "Mengusulkan pemberhentian pelaksanaan penelitian kesehatan terhadap penelitian yang menyimpang.",
        "Mengajukan kajian ulang protokol penelitian kesehatan dari institusi lain yang bersengketa.",
        "Melakukan akreditasi kompetensi komisi etik / Lembaga kaji etik.",
        "Melakukan pelatihan Etik penelitian kesehatan.",
        "Membuat laporan kegiatan Komisi Etik kepada Fakultas Keperawatan."
      ],
      card_2_title: "Informed Consent",
      card_2_desc_1: "Informed consent adalah persetujuan yang diberikan oleh klien atau subjek penelitian tentang segala tindakan / perlakuan yang hendak dilakukan terhadap dirinya, setelah memperoleh penjelasan adekuat dari tenaga kesehatan atau pelaksana penelitian.",
      card_2_desc_2: "Harus memperoleh perhatian dan kedudukan yang lebih tinggi dibanding informed consent untuk tindakan pelayanan kesehatan, karena subyek penelitian tidak memperoleh manfaat langsung dari keikutsertaannya.",
      legal_impl: "Implikasi Hukum",
      legal_desc: "Selain mengandung aspek etik, Informed consent juga mempunyai implikasi hukum. Bila dilanggar akan berdampak sanksi hukum pidana, perdata maupun administratif.",
      mandatory_for: "Wajib Ada Untuk:",
      mandatory_list: ["Subjek Manusia", "Masyarakat", "Data Rekam Medik Klien", "Spesimen Biologik"],
      card_3_title: "Jenis Penelitian Kesehatan",
      card_3_quote: "Penelitian kesehatan sarat dengan rambu etika karena melibatkan subjek manusia yang dipaparkan pada rasa tidak enak dan resiko. Metode Penelitian yang kurang baik adalah tidak etis.",
      aspect_general: "Aspek Umum",
      aspect_nursing: "Bidang Ilmu Keperawatan",
      card_4_title: "Integritas Peneliti",
      integrity_5: "5 Pilar Integritas Akademis",
      integrity_during: "Integritas Selama Penelitian",
      integrity_during_desc: "Sesuai Deklarasi Helsinki (Paragraf 10): Tugas peneliti adalah melindungi hidup, kesehatan, privasi, dan martabat subjek manusia.",
      attention: "Perhatian Khusus:",
      attention_desc: "Subjek vulnerable (anak-anak, orang cacat, wanita hamil, lansia, dll).",
      integrity_after: "Integritas Sesudah Penelitian",
      integrity_after_1: "1. Akses Hasil Riset",
      integrity_after_1_desc: "Populasi yang ikut serta harus mendapat manfaat dari hasil penelitian (Deklarasi Helsinki No. 19 & 30).",
      integrity_after_2: "2. Pengarsipan",
      integrity_after_2_desc: "Data asli harus disimpan baik-baik untuk keperluan klarifikasi (audit trail) bila diperlukan di masa depan.",
      integrity_after_3: "3. HKI & Publikasi",
      integrity_after_3_desc: "Integritas etis terkait intelektual property (Paten, Copyrights) dan Ownership of data."
    },
    flow: {
      title: "Alur Pengajuan Etik",
      subtitle: "Proses mudah dan transparan dari awal hingga terbit sertifikat.",
      steps: [
        { title: "1. Registrasi", desc: "Buat akun peneliti menggunakan data identitas (NIM/NIK) dan tunggu validasi admin." },
        { title: "2. Submit Protokol", desc: "Isi formulir pengajuan, upload dokumen, dan lengkapi self-assessment etik." },
        { title: "3. Telaah Reviewer", desc: "Protokol diperiksa oleh reviewer. Lakukan revisi jika ada catatan perbaikan." },
        { title: "4. EC Terbit", desc: "Jika disetujui (Approved), unduh sertifikat Ethical Clearance digital." }
      ]
    },
    footer: {
      address: "Kampus C Mulyorejo, Surabaya",
      rights: "Komisi Etik Penelitian Kesehatan - Fakultas Keperawatan UNAIR. All rights reserved."
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem, onOpenQuestionnaire }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id'); // State Bahasa

  const t = translations[lang]; // Current Translation

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- INTERSECTION OBSERVER FOR SCROLL ANIMATION ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate once
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // Run on mount

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <img 
               src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
               alt="Logo UNAIR" 
               className={`h-10 w-auto transition-all ${isScrolled ? '' : 'bg-white/80 rounded p-1'}`}
             />
             <div>
                <h1 className={`font-bold tracking-tight text-lg leading-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>SIM KEPK</h1>
                <p className={`text-xs ${isScrolled ? 'text-slate-500' : 'text-slate-600 md:text-blue-100'}`}>Fakultas Keperawatan UNAIR</p>
             </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#beranda" 
                onClick={(e) => scrollToSection(e, 'beranda')}
                className={`text-sm font-medium hover:text-unair-yellow transition-colors ${isScrolled ? 'text-slate-600' : 'text-white'}`}
              >
                {t.nav.home}
              </a>
              <a 
                href="#tentang" 
                onClick={(e) => scrollToSection(e, 'tentang')}
                className={`text-sm font-medium hover:text-unair-yellow transition-colors ${isScrolled ? 'text-slate-600' : 'text-white'}`}
              >
                {t.nav.about}
              </a>
              <a 
                href="#prosedur" 
                onClick={(e) => scrollToSection(e, 'prosedur')}
                className={`text-sm font-medium hover:text-unair-yellow transition-colors ${isScrolled ? 'text-slate-600' : 'text-white'}`}
              >
                {t.nav.flow}
              </a>

              {/* Menu Kuesioner (Internal) */}
              <button 
                onClick={onOpenQuestionnaire}
                className={`text-sm font-medium hover:text-unair-yellow transition-colors relative ${isScrolled ? 'text-slate-600' : 'text-white'}`}
                title={t.nav.questionnaire}
              >
                {t.nav.questionnaire}
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </button>
              
              <div className={`h-6 w-px mx-2 ${isScrolled ? 'bg-slate-200' : 'bg-white/20'}`}></div>

              {/* Language Switcher Desktop */}
              <div className="flex items-center space-x-2">
                 <button 
                   onClick={() => setLang('id')}
                   className={`transition-transform hover:scale-110 ${lang === 'id' ? 'opacity-100 ring-2 ring-white rounded-full' : 'opacity-60 hover:opacity-100'}`}
                   title="Bahasa Indonesia"
                 >
                    <img src="https://flagcdn.com/w40/id.png" alt="Indonesia" className="w-6 h-4 object-cover rounded shadow-sm" />
                 </button>
                 <button 
                   onClick={() => setLang('en')}
                   className={`transition-transform hover:scale-110 ${lang === 'en' ? 'opacity-100 ring-2 ring-white rounded-full' : 'opacity-60 hover:opacity-100'}`}
                   title="English"
                 >
                    <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-6 h-4 object-cover rounded shadow-sm" />
                 </button>
              </div>

              <button 
                onClick={() => generateManualPDF('general')}
                className={`text-sm font-bold flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isScrolled ? 'text-slate-700 hover:bg-slate-50' : 'text-white hover:bg-white/10'}`}
                title={t.nav.guide}
              >
                <Download className="w-4 h-4" />
                {t.nav.guide}
              </button>

              <button 
                onClick={onEnterSystem}
                className="bg-unair-yellow text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-yellow-400 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {t.nav.login}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
               {/* Language Switcher Mobile */}
               <div className="flex items-center space-x-2">
                 <button onClick={() => setLang('id')} className={lang === 'id' ? 'opacity-100' : 'opacity-50'}>
                    <img src="https://flagcdn.com/w40/id.png" alt="ID" className="w-6 h-4 rounded" />
                 </button>
                 <button onClick={() => setLang('en')} className={lang === 'en' ? 'opacity-100' : 'opacity-50'}>
                    <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-6 h-4 rounded" />
                 </button>
               </div>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`} 
              >
                {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
              </button>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
           <div className="md:hidden bg-white shadow-xl border-t border-slate-100 absolute w-full top-full left-0 py-4 px-4 flex flex-col space-y-4 animate-fadeIn">
              <a href="#beranda" onClick={(e) => scrollToSection(e, 'beranda')} className="text-slate-700 font-medium py-2">{t.nav.home}</a>
              <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="text-slate-700 font-medium py-2">{t.nav.about}</a>
              <a href="#prosedur" onClick={(e) => scrollToSection(e, 'prosedur')} className="text-slate-700 font-medium py-2">{t.nav.flow}</a>
              <button onClick={onOpenQuestionnaire} className="text-left text-slate-700 font-medium py-2">{t.nav.questionnaire}</button>
              <button onClick={() => generateManualPDF('general')} className="flex items-center gap-2 text-slate-700 font-medium py-2">
                 <Download className="w-4 h-4"/> {t.nav.guide}
              </button>
              <button onClick={onEnterSystem} className="w-full bg-unair-blue text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                 <ShieldCheck className="w-4 h-4"/> {t.nav.login}
              </button>
           </div>
        )}
      </nav>

      {/* Hero Section */}
      <header 
        id="beranda" 
        className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-white overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://pkkii.pendidikan.unair.ac.id/website/VB%206.png')" }}
      >
         {/* Overlay Gradient */}
         <div className="absolute inset-0 bg-gradient-to-r from-unair-blue/90 via-unair-blue/80 to-slate-900/60 z-0"></div>

         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-unair-yellow rounded-full blur-3xl"></div>
         </div>
         
         <div className="container mx-auto px-4 md:px-8 relative z-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center">
               <div className="md:w-1/2 mb-10 md:mb-0 reveal-on-scroll">
                  <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-blue-100 text-sm font-semibold mb-6 animate-fadeIn">
                     {t.hero.badge}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
                     {t.hero.title_1} <br/>
                     <span className="text-unair-yellow">{t.hero.title_2}</span>
                  </h1>
                  <p className="text-lg text-blue-50 mb-8 max-w-xl leading-relaxed drop-shadow-md font-medium">
                     {t.hero.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start flex-wrap">
                     {/* TOMBOL 1: AJUKAN PROTOKOL */}
                     <button onClick={onEnterSystem} className="w-full sm:w-auto bg-unair-yellow text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-400/20 flex items-center justify-center">
                        {t.hero.btn_submit} <ArrowRight className="w-5 h-5 ml-2"/>
                     </button>
                     
                     {/* TOMBOL 2: PELAJARI ALUR */}
                     <button onClick={(e) => scrollToSection(e, 'prosedur')} className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center backdrop-blur-sm">
                        {t.hero.btn_learn}
                     </button>
                     
                     {/* TOMBOL 3: DOWNLOAD DOKUMEN (BARU) */}
                     <a 
                       href="https://ners.unair.ac.id/site/index.php/kepk/alur-pengajuan" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full sm:w-auto bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center"
                     >
                        <Download className="w-5 h-5 mr-2"/>
                        {t.hero.btn_download}
                     </a>
                  </div>
               </div>
               
               <div className="md:w-1/2 flex justify-center md:justify-end relative reveal-on-scroll">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-sm w-full shadow-2xl">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                           <CheckCircle className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                           <h4 className="text-2xl font-bold">{t.hero.accredited}</h4>
                           <p className="text-sm text-blue-100">{t.hero.accredited_sub}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3 border border-white/5 hover:bg-white/20 transition-colors">
                           <Gavel className="w-5 h-5 text-unair-yellow"/>
                           <span className="font-medium">{t.hero.card_1}</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3 border border-white/5 hover:bg-white/20 transition-colors">
                           <FileCheck className="w-5 h-5 text-unair-yellow"/>
                           <span className="font-medium">{t.hero.card_2}</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3 border border-white/5 hover:bg-white/20 transition-colors">
                           <BookOpen className="w-5 h-5 text-unair-yellow"/>
                           <span className="font-medium">{t.hero.card_3}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* Info Sections - STACKED LAYOUT WITH ZOOM TRANSITION */}
      <section id="tentang" className="py-20 bg-slate-50">
         <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.about.title}</h2>
               <div className="w-20 h-1.5 bg-unair-yellow mx-auto rounded-full"></div>
               <p className="text-slate-500 mt-4">{t.about.subtitle}</p>
            </div>
            
            <div className="space-y-8">
                {/* 1. TUGAS POKOK */}
                <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-unair-blue/30 relative overflow-hidden reveal-on-scroll">
                    {/* Decorative Background Effect on Hover */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <h3 className="text-xl font-bold text-slate-800 flex items-center mb-6 relative z-10">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-unair-blue group-hover:text-white transition-colors duration-300">
                        <List className="w-6 h-6 text-unair-blue group-hover:text-white"/>
                      </div>
                      {t.about.card_1_title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed relative z-10">
                        {t.about.card_1_desc}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 relative z-10">
                      {t.about.card_1_list.map((item, idx) => (
                        <div key={idx} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white group-hover:shadow-sm hover:translate-x-1 transition-all duration-300">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                </div>

                {/* 2. INFORMED CONSENT */}
                <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-unair-blue/30 relative overflow-hidden reveal-on-scroll">
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                             <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-unair-blue group-hover:text-white transition-colors duration-300">
                                <FileSignature className="w-6 h-6 text-unair-blue group-hover:text-white"/>
                             </div>
                             {t.about.card_2_title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed text-sm">
                            {t.about.card_2_desc_1}
                          </p>
                          <p className="text-slate-600 leading-relaxed text-sm mt-3">
                            {t.about.card_2_desc_2}
                          </p>
                        </div>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg group-hover:bg-red-100 hover:shadow-sm transition-all duration-300">
                          <h4 className="font-bold text-red-700 text-sm mb-1 flex items-center"><Gavel className="w-4 h-4 mr-2"/> {t.about.legal_impl}</h4>
                          <p className="text-slate-700 text-sm">
                            {t.about.legal_desc}
                          </p>
                        </div>
                      </div>
                      <div className="md:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm w-full group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{t.about.mandatory_for}</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            {t.about.mandatory_list.map((item, idx) => (
                                <li key={idx} className="flex items-start p-2 rounded hover:bg-slate-50 hover:translate-x-1 transition-all duration-200 cursor-default">
                                    <div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mt-1.5 mr-2 shrink-0"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                </div>

                {/* 3. JENIS PENELITIAN */}
                <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-unair-blue/30 relative overflow-hidden reveal-on-scroll">
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-3xl pointer-events-none"></div>

                     <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center relative z-10">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-unair-blue group-hover:text-white transition-colors duration-300">
                            <Microscope className="w-6 h-6 text-unair-blue group-hover:text-white"/>
                        </div>
                        {t.about.card_3_title}
                     </h3>
                     <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 italic relative z-10 group-hover:bg-white group-hover:shadow-sm transition-all">
                       "{t.about.card_3_quote}"
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       <div>
                         <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b pb-2">
                           <Activity className="w-4 h-4 mr-2 text-unair-blue"/> {t.about.aspect_general}
                         </h4>
                         <ul className="space-y-2 text-sm text-slate-600">
                            {[
                                "Penelitian Genetika / Genetics",
                                "Penelitian Sel Punca / Stem Cell",
                                "Bahan Biologik Tersimpan / Biobank",
                                "Uji Klinik / Clinical Trials",
                                "Penelitian Epidemiologi / Epidemiology",
                                "Hewan Percobaan / Animal Subject"
                            ].map((item,i) => (
                                <li key={i} className="flex items-center p-2 rounded-lg hover:bg-slate-50 hover:translate-x-2 transition-all duration-300 cursor-default">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3 group-hover:bg-unair-yellow transition-colors"></div>
                                    {item}
                                </li>
                            ))}
                         </ul>
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b pb-2">
                           <Users className="w-4 h-4 mr-2 text-unair-blue"/> {t.about.aspect_nursing}
                         </h4>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                            {[
                                "Pediatric Nursing", "Maternity Nursing", 
                                "Mental Health Nursing", "Medical Surgical Nursing",
                                "Oncology Nursing", "Cardiovascular Nursing",
                                "Critical Care Nursing", "Family Nursing",
                                "Community Nursing", "Gerontic Nursing",
                                "Nursing Education", "Nursing Management"
                            ].map((item,i) => (
                                <div key={i} className="flex items-center p-2 rounded-lg hover:bg-yellow-50 hover:translate-x-1 transition-all duration-300 cursor-default">
                                    <div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2 shrink-0"></div>
                                    <span className="truncate" title={item}>{item}</span>
                                </div>
                            ))}
                         </div>
                       </div>
                     </div>
                </div>

                {/* 4. INTEGRITAS */}
                <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-unair-blue/30 relative overflow-hidden reveal-on-scroll">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center relative z-10">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-unair-blue group-hover:text-white transition-colors duration-300">
                            <Scale className="w-6 h-6 text-unair-blue group-hover:text-white"/>
                        </div>
                        {t.about.card_4_title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Brain className="w-5 h-5 mr-2 text-unair-blue"/> {t.about.integrity_5}</h4>
                            <ul className="space-y-3">
                                {['Honesty (Kejujuran)', 'Trust (Kepercayaan)', 'Fairness (Keadilan)', 'Respect (Penghormatan)', 'Responsibility (Tanggung Jawab)'].map((p, i) => (
                                    <li key={i} className="flex items-center text-sm text-slate-700 p-2 rounded-lg hover:bg-blue-50 hover:translate-x-2 transition-all duration-300 cursor-default hover:text-unair-blue">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0"/> 
                                        <span className="font-medium">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-unair-blue"/> {t.about.integrity_during}</h4>
                             <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                {t.about.integrity_during_desc}
                             </p>
                             <div className="text-xs bg-white p-4 rounded border border-slate-200 text-slate-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors shadow-sm hover:shadow-md">
                                <strong className="block mb-1 text-slate-700">{t.about.attention}</strong> 
                                {t.about.attention_desc}
                             </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 relative z-10">
                        <h4 className="font-bold text-slate-800 mb-4">{t.about.integrity_after}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-4 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 cursor-default hover:shadow-lg transform hover:-translate-y-1">
                                <h5 className="font-bold mb-2">{t.about.integrity_after_1}</h5>
                                <p className="opacity-90">{t.about.integrity_after_1_desc}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 delay-75 cursor-default hover:shadow-lg transform hover:-translate-y-1">
                                <h5 className="font-bold mb-2">{t.about.integrity_after_2}</h5>
                                <p className="opacity-90">{t.about.integrity_after_2_desc}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 delay-150 cursor-default hover:shadow-lg transform hover:-translate-y-1">
                                <h5 className="font-bold mb-2">{t.about.integrity_after_3}</h5>
                                <p className="opacity-90">{t.about.integrity_after_3_desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Procedure / Flow */}
      <section id="prosedur" className="py-20 bg-white">
         <div className="container mx-auto px-4 md:px-8">
             <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.flow.title}</h2>
               <p className="text-slate-500">{t.flow.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
               {/* Connecting Line for Desktop */}
               <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-slate-100 -z-10"></div>

               {t.flow.steps.map((step, idx) => {
                  const colors = ["bg-blue-600", "bg-unair-yellow", "bg-orange-500", "bg-green-600"];
                  return (
                    <div key={idx} className="bg-white p-6 pt-0 text-center group reveal-on-scroll">
                       <div className={`w-16 h-16 ${colors[idx]} text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                          {idx + 1}
                       </div>
                       <h3 className="text-lg font-bold text-slate-800 mb-3">{step.title}</h3>
                       <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
         <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
               <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <img 
                     src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
                     alt="Logo UNAIR" 
                     className="h-10 bg-white rounded p-1" 
                  />
                  <div>
                     <h5 className="text-white font-bold">SIM KEPK</h5>
                     <p className="text-xs">Fakultas Keperawatan Universitas Airlangga</p>
                  </div>
               </div>
               <div className="text-sm text-center md:text-right">
                  <p>{t.footer.address}</p>
                  <p>Telp: (031) 5913754 | Email: kepk@fkp.unair.ac.id</p>
               </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-xs">
               &copy; {new Date().getFullYear()} {t.footer.rights}
            </div>
         </div>
      </footer>
    </div>
  );
};