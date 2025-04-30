
import { Profile } from './profile';
import { Portfolio } from './portfolio';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Modified to handle error response profiles more explicitly
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Profile | null;
}

// Modified to handle error response profiles more explicitly
export interface GroupPortfolio {
  id: string;
  group_id: string;
  portfolio_id: string;
  shared_by: string;
  shared_at: string;
  portfolios: Portfolio;
  profiles?: Profile | null;
}

// Modified to handle error response profiles more explicitly
export interface GroupComment {
  id: string;
  group_id: string;
  portfolio_id: string | null;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
}
