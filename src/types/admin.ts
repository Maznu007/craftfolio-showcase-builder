
export interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  user_type: 'free' | 'premium' | 'admin';
  last_sign_in_at: string | null;
  created_at: string;
  portfolio_count: number;
}
