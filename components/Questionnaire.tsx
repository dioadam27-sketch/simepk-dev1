import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { QuestionnaireQuestion } from '../types';
import { Send, CheckCircle, ArrowLeft, Loader2, Star, User, MessageSquare } from 'lucide-react';

interface QuestionnaireProps {
  onBack: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('umum');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

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

    try {
        const res = await apiService.submitQuestionnaire(name, role, answersArray);
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10"/>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h2>
                <p className="text-slate-600 mb-6">Masukan Anda sangat berharga untuk peningkatan kualitas layanan KEPK Fakultas Keperawatan UNAIR.</p>
                <button onClick={onBack} className="w-full py-3 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors">
                    Kembali ke Beranda
                </button>
            </div>
        </div>
    );
  }

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
