import { ResearchSubmission, UserProfile, DocumentRequirement, UserRole, QuestionnaireQuestion, QuestionnaireResponse } from '../types';

// ============================================================================
// KONFIGURASI API
// ============================================================================
// Default URL (Fallback)
const DEFAULT_API_URL = 'https://ppk2ipe.unair.ac.id/simepkapi/index.php'; 

// Cek LocalStorage apakah ada override URL
const getStoredApiUrl = () => {
  try {
    return localStorage.getItem('SIMKEPK_API_URL') || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
};

let API_URL = getStoredApiUrl();
// ============================================================================

// Helper untuk POST request
const postData = async (action: string, payload: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      // PHP mengharapkan JSON body
      body: JSON.stringify({ action, payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle jika return bukan JSON (misal error PHP text/html)
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Invalid JSON response:", text);
        return { status: 'error', message: 'Server Error (Invalid JSON). Cek console.' };
    }
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { status: 'error', message: 'Gagal terhubung ke server API.' };
  }
};

// Helper untuk GET request
const getData = async (action: string, params: Record<string, string> = {}) => {
  try {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString());
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Invalid JSON response:", text);
        return { status: 'error', message: 'Server Error (Invalid JSON).' };
    }
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { status: 'error', message: 'Gagal mengambil data dari server.' };
  }
};

export const apiService = {
  // --- SYSTEM CONFIG (NEW) ---
  getApiUrl: () => API_URL,
  
  setApiUrl: (url: string) => {
    localStorage.setItem('SIMKEPK_API_URL', url);
    API_URL = url;
  },

  resetApiUrl: () => {
    localStorage.removeItem('SIMKEPK_API_URL');
    API_URL = DEFAULT_API_URL;
  },

  // --- USER ---
  login: async (email: string, password: string) => {
    return await postData('login', { email, password });
  },

  register: async (userData: any) => {
    return await postData('register', userData);
  },

  getUsers: async () => {
    return await getData('getUsers');
  },

  updateUserStatus: async (id: string, status: string) => {
    return await postData('updateUserStatus', { id, status });
  },

  // UPDATE: Delete user with Admin Log info
  deleteUser: async (id: string, adminName?: string) => {
    return await postData('deleteUser', { id, adminName });
  },
  
  // NEW: Get logs
  getAdminLogs: async () => {
    return await getData('getAdminLogs');
  },
  
  // NEW: Get Notification Count (Reset Requests)
  getResetRequestCount: async () => {
    return await getData('getResetRequestCount');
  },
  
  // Method baru untuk update profil admin (Updated with Name)
  updateAdminProfile: async (id: string, name: string, email: string, currentPassword: string, newPassword?: string) => {
      return await postData('updateAdminProfile', { id, name, email, currentPassword, newPassword });
  },

  // UPDATE: Request Password Reset via NIP/NIK (Notifikasi ke Admin)
  forgotPassword: async (identityNumber: string) => {
    return await postData('forgot_password', { identityNumber });
  },

  // Manual Reset Password (By Admin - Change Password Directly)
  adminResetUserPassword: async (userId: string, newPassword: string) => {
      return await postData('adminResetUserPassword', { userId, newPassword });
  },
  
  // NEW: Reset Password to Default (Identity Number)
  adminResetToDefault: async (userId: string, adminName: string) => {
      return await postData('adminResetToDefault', { userId, adminName });
  },

  // NEW: Reset Password (via Token - Legacy/Opsional jika admin mau kirim link manual)
  resetPassword: async (token: string, newPassword: string) => {
    return await postData('reset_password', { token, newPassword });
  },

  // --- SUBMISSIONS ---
  getSubmissions: async (role: UserRole, email: string) => {
    return await getData('getSubmissions', { role, email });
  },

  createSubmission: async (submission: any) => {
    // Tidak perlu folder ID lagi, PHP yang menangani penyimpanan file
    return await postData('createSubmission', submission);
  },

  // Method baru untuk Edit Submission
  editSubmission: async (submission: any) => {
    return await postData('editSubmission', submission);
  },

  updateSubmissionStatus: async (id: string, status: string, feedback?: string, approvalDate?: string) => {
    return await postData('updateSubmissionStatus', { id, status, feedback, approvalDate });
  },

  // Baru: Upload Sertifikat
  uploadCertificate: async (id: string, fileBase64: string, fileName: string) => {
    return await postData('uploadCertificate', { id, content: fileBase64, name: fileName });
  },

  // --- CONFIG (DOCUMENTS) ---
  getConfig: async () => {
    return await getData('getConfig');
  },

  addConfig: async (id: string, label: string, isRequired: boolean) => {
    return await postData('addConfig', { id, label, isRequired });
  },

  deleteConfig: async (id: string) => {
    return await postData('deleteConfig', { id });
  },

  // --- QUESTIONNAIRE (NEW) ---
  getQuestions: async (isPublic = false) => {
    const params = isPublic ? { public: 'true' } : {};
    return await getData('getQuestions', params);
  },

  addQuestion: async (text: string, type: 'rating' | 'text' | 'yesno' | 'likert') => {
    return await postData('addQuestion', { text, type });
  },

  deleteQuestion: async (id: number) => {
    return await postData('deleteQuestion', { id });
  },

  submitQuestionnaire: async (name: string, role: string, answers: { question_id: number; answer: string }[]) => {
    return await postData('submitQuestionnaire', { name, role, answers });
  },

  getQuestionnaireResults: async () => {
    return await getData('getQuestionnaireResults');
  }
};