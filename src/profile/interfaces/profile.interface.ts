export interface IProfile {
  id: string;
  fullName: string;
  username: string;
  profile?: {
    photo?: string;
    website?: string | null;
    about?: string | null;
  };
  followersCount: number; // число подписчиков
  followingCount: number; // число подписок
  postsCount: number; // число постов
}

export interface IUpdateProfile {
  username?: string;
  profile?: {
    photo?: string;
    website?: string | null;
    about?: string | null;
  };
}
