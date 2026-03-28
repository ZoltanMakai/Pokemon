export interface ProfilePublicRow {
  id: string;
  nickname: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilePrivateRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}
