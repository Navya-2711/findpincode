const ADMIN_FLAG = 'pf_admin';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123';

export function isAdminAuthenticated(): boolean {
  return typeof window !== 'undefined' && window.sessionStorage.getItem(ADMIN_FLAG) === '1';
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    window.sessionStorage.setItem(ADMIN_FLAG, '1');
    return true;
  }
  return false;
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ADMIN_FLAG);
}
