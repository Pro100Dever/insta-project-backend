export interface JwtPl {
  sub: string;
  username: string;
}
export interface IRegUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  password?: string;
  profile?: { photo?: string };
}
