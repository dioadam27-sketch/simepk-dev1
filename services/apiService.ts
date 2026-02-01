
import { ResearchSubmission, UserProfile, DocumentRequirement, UserRole } from '../types';

// ============================================================================
// KONFIGURASI API
// ============================================================================
// URL API backend di server cPanel
const API_URL = 'https://ppk2ipe.unair.ac.id/api/index.php'; 
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

  deleteUser: async (id: string) => {
    return await postData('deleteUser', { id });
  },
  
  // Method baru untuk update profil admin
  updateAdminProfile: async (id: string, email: string, currentPassword: string, newPassword?: string) => {
      return await postData('updateAdminProfile', { id, email, currentPassword, newPassword });
  },

  // NEW: Forgot Password
  forgotPassword: async (email: string) => {
    return await postData('forgot_password', { email });
  },

  // NEW: Reset Password
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
  }
};
