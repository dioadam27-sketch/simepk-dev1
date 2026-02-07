import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { QuestionnaireQuestion, UserProfile, ResearchSubmission } from '../types';
import { Send, CheckCircle, ArrowLeft, Loader2, Star, User, MessageSquare, ClipboardList, AlertCircle } from 'lucide-react';

interface QuestionnaireProps {
  onBack?: () => void;
  currentUser?: UserProfile | null;
  userSubmissions?: ResearchSubmission[];
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onBack, currentUser, userSubmissions }) => {
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('umum');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const isPortalMode = !!currentUser;

  useEffect(() => {
    fetchQuestions();
    if (currentUser) {
        setName(currentUser.name);
        setRole(currentUser.role === 'researcher' ? 'peneliti' : currentUser.role === 'reviewer' ? 'dosen' : 'umum');
    }
  }, [currentUser]);

  const fetchQuestions = async () => {
    try {
      const res = await apiService.getQuestions(true); // true = public only
      if (res.status === 'success') {
        setQuestions(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Convert object answers to array
    const answersArray = Object.keys(answers).map(key => ({
        question_id: parseInt(key),
        answer: answers[parseInt(key)]
    }));

    // If portal mode and protocol selected, append to role
    let finalRole = role;
    if (isPortalMode && selectedProtocol) {
        finalRole = `${role} - ${selectedProtocol}`;
    }

    try {
        const res = await apiService.submitQuestionnaire(name, finalRole, answersArray);
        if (res.status === 'success') {
            setSubmitted(true);
        } else {
            alert('Gagal mengirim data: ' + res.message);
        }
    } catch (e) {
        alert('Terjadi kesalahan koneksi.');
    } finally {
        setSubmitting(false);
    }
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  if (submitted) {
    return (
        <div className={`${isPortalMode ? 'h-full flex flex-col justify-center' : 'min-h-screen bg-slate-50 flex items-center justify-center p-4'}`}>
            <div className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn ${isPortalMode ? 'mx-auto border border-slate-200 shadow-sm' : ''}`}>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10"/>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h2>
                <p className="text-slate-600 mb-6">Evaluasi dan masukan Anda telah tersimpan. Data ini sangat berharga untuk pengembangan layanan kami.</p>
                
                {isPortalMode ? (
                    <button onClick={() => setSubmitted(false)} className="text-unair-blue font-bold hover:underline">
                        Isi Evaluasi Lainnya
                    </button>
                ) : (
                    <button onClick={onBack} className="w-full py-3 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors">
                        Kembali ke Beranda
                    </button>
                )}
            </div>
        </div>
    );
  }

  // PORTAL MODE VIEW
  if (isPortalMode) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <ClipboardList className="w-6 h-6 text-unair-blue"/>
                    Kuesioner & Evaluasi Berkala
                </h2>
                <p className="text-slate-500 text-sm">
                    Silakan isi formulir evaluasi berikut terkait perkembangan penelitian atau kepuasan layanan Ethical Clearance.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                {/* Identity Section (Auto-filled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Peneliti</label>
                        <div className="font-bold text-slate-800 flex items-center">
                            <User className="w-4 h-4 mr-2 text-slate-400"/> {name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peran</label>
                        <div className="font-bold text-slate-800 capitalize">{role}</div>
                    </div>
                    
                    {/* Protocol Selector */}
                    {userSubmissions && userSubmissions.length > 0 && (
                        <div className="col-span-1 md:col-span-2 mt-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Protokol yang Dievaluasi <span className="text-red-500">*</span>
                            </label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none bg-white"
                                value={selectedProtocol}
                                onChange={e => setSelectedProtocol(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Judul Protokol --</option>
                                {userSubmissions.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.id} - {sub.title.substring(0, 50)}...
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1"/> Pilih protokol yang relevan dengan evaluasi ini.
                            </p>
                        </div>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-10 text-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
                            Memuat pertanyaan...
                        </div>
                    ) : questions.length === 0 ? (
                        <p className="text-center text-slate-500 italic py-8">Belum ada pertanyaan evaluasi yang aktif saat ini.</p>
                    ) : (
                        questions.map((q, idx) => (
                            <div key={q.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                <label className="block font-medium text-slate-800 mb-3">
                                    <span className="inline-block bg-slate-100 text-slate-600 rounded px-2 py-0.5 text-xs mr-2 font-bold">#{idx + 1}</span>
                                    {q.question_text} <span className="text-red-500">*</span>
                                </label>
                                
                                {q.question_type === 'rating' && (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleAnswerChange(q.id, star.toString())}
                                                className={`p-2 rounded-lg transition-all ${
                                                    answers[q.id] === star.toString() 
                                                    ? 'bg-unair-yellow text-slate-900 shadow-md transform scale-110' 
                                                    : 'bg-white border border-slate-200 text-slate-400 hover:bg-yellow-50 hover:text-yellow-500'
                                                }`}
                                            >
                                                <Star className={`w-6 h-6 ${answers[q.id] === star.toString() ? 'fill-current' : ''}`}/>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === 'likert' && (
                                    <div className="grid grid-cols-5 gap-2 text-center mt-3">
                                        {[
                                            { val: '1', label: 'STS', title: 'Sangat Tidak Setuju' },
                                            { val: '2', label: 'TS', title: 'Tidak Setuju' },
                                            { val: '3', label: 'N', title: 'Netral' },
                                            { val: '4', label: 'S', title: 'Setuju' },
                                            { val: '5', label: 'SS', title: 'Sangat Setuju' }
                                        ].map((opt) => (
                                            <label key={opt.val} className={`cursor-pointer rounded-lg p-2 transition-colors border ${answers[q.id] === opt.val ? 'bg-unair-blue text-white border-unair-blue' : 'bg-slate-50 hover:bg-blue-50 border-transparent text-slate-600'}`}>
                                                <input 
                                                    type="radio" 
                                                    name={`q-${q.id}`} 
                                                    value={opt.val}
                                                    checked={answers[q.id] === opt.val}
                                                    onChange={() => handleAnswerChange(q.id, opt.val)}
                                                    className="hidden"
                                                />
                                                <span className="block text-sm font-bold">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === 'yesno' && (
                                    <div className="flex gap-4">
                                        {['Ya', 'Tidak'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-unair-blue transition-colors">
                                                <input 
                                                    type="radio" 
                                                    name={`q-${q.id}`} 
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={() => handleAnswerChange(q.id, opt)}
                                                    className="text-unair-blue focus:ring-unair-blue"
                                                    required
                                                />
                                                <span className="text-sm font-medium text-slate-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === 'text' && (
                                    <textarea
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none text-sm"
                                        rows={3}
                                        placeholder="Jawaban Anda..."
                                        value={answers[q.id] || ''}
                                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                                        required
                                    ></textarea>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                        type="submit"
                        disabled={submitting || loading || questions.length === 0}
                        className="px-8 py-3 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                        Kirim Evaluasi
                    </button>
                </div>
            </form>
        </div>
      );
  }

  // PUBLIC MODE VIEW (Existing Design)
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-unair-blue text-white py-12 px-4 relative overflow-hidden">
         {/* Decorative BG */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
         
         <div className="max-w-3xl mx-auto relative z-10">
            <button onClick={onBack} className="flex items-center text-blue-200 hover:text-white mb-6 font-medium transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2"/> Kembali
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Survei Kepuasan Layanan</h1>
            <p className="text-blue-100">Bantu kami meningkatkan kualitas layanan dengan mengisi kuesioner singkat ini.</p>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20 pb-20">
         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-8">
            
            {/* Identity Section */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <User className="w-5 h-5 mr-2 text-unair-yellow"/> Identitas Responden
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap (Opsional)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none"
                            placeholder="Anonim"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Peran Anda</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="umum">Umum / Tamu</option>
                            <option value="peneliti">Peneliti / Mahasiswa</option>
                            <option value="dosen">Dosen / Reviewer</option>
                            <option value="staf">Staf Tendik</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-10 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
                        Memuat pertanyaan...
                    </div>
                ) : questions.length === 0 ? (
                    <p className="text-center text-slate-500 italic py-8">Belum ada pertanyaan survei yang aktif.</p>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q.id} className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                            <label className="block font-medium text-slate-800 mb-3">
                                {idx + 1}. {q.question_text} <span className="text-red-500">*</span>
                            </label>
                            
                            {q.question_type === 'rating' && (
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleAnswerChange(q.id, star.toString())}
                                            className={`p-2 rounded-lg transition-all ${
                                                answers[q.id] === star.toString() 
                                                ? 'bg-unair-yellow text-slate-900 shadow-md transform scale-110' 
                                                : 'bg-white border border-slate-200 text-slate-400 hover:bg-yellow-50 hover:text-yellow-500'
                                            }`}
                                        >
                                            <Star className={`w-6 h-6 ${answers[q.id] === star.toString() ? 'fill-current' : ''}`}/>
                                        </button>
                                    ))}
                                    <span className="text-xs text-slate-500 self-center ml-2">
                                        (1 = Buruk, 5 = Sangat Baik)
                                    </span>
                                </div>
                            )}

                            {q.question_type === 'likert' && (
                                <div className="grid grid-cols-5 gap-2 text-center mt-3 bg-white p-3 rounded-lg border border-slate-200">
                                     {[
                                        { val: '1', label: 'STS', title: 'Sangat Tidak Setuju' },
                                        { val: '2', label: 'TS', title: 'Tidak Setuju' },
                                        { val: '3', label: 'N', title: 'Netral' },
                                        { val: '4', label: 'S', title: 'Setuju' },
                                        { val: '5', label: 'SS', title: 'Sangat Setuju' }
                                     ].map((opt) => (
                                        <label key={opt.val} className={`cursor-pointer rounded-lg p-2 transition-colors border ${answers[q.id] === opt.val ? 'bg-unair-blue text-white border-unair-blue' : 'hover:bg-blue-50 border-transparent'}`}>
                                            <input 
                                                type="radio" 
                                                name={`q-${q.id}`} 
                                                value={opt.val}
                                                checked={answers[q.id] === opt.val}
                                                onChange={() => handleAnswerChange(q.id, opt.val)}
                                                className="hidden"
                                            />
                                            <span className="block text-sm font-bold">{opt.label}</span>
                                            <span className="hidden md:block text-[10px] opacity-80 mt-1">{opt.title}</span>
                                        </label>
                                     ))}
                                </div>
                            )}

                            {q.question_type === 'yesno' && (
                                <div className="flex gap-4">
                                    {['Ya', 'Tidak'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-unair-blue transition-colors">
                                            <input 
                                                type="radio" 
                                                name={`q-${q.id}`} 
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleAnswerChange(q.id, opt)}
                                                className="text-unair-blue focus:ring-unair-blue"
                                                required
                                            />
                                            <span className="text-sm font-medium text-slate-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.question_type === 'text' && (
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-blue outline-none text-sm"
                                    rows={3}
                                    placeholder="Tulis jawaban Anda di sini..."
                                    value={answers[q.id] || ''}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                    required
                                ></textarea>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button 
                    type="submit"
                    disabled={submitting || loading || questions.length === 0}
                    className="w-full md:w-auto px-8 py-3 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                    Kirim Jawaban
                </button>
            </div>
         </form>
      </div>
    </div>
  );
};