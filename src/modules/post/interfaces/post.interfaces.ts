export interface ICreatePost {
  text?: string | null;
  mediaUrl: string;
  authorId: string;
}
export interface IUpdatePost {
  text?: string | null;
  mediaUrl?: string | undefined;
}
