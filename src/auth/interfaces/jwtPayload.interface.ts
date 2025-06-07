import { UUID } from "crypto";

export interface JwtPayload {
  sub: number;
  username: string;
}
export interface IRegUser {
  id: UUID;
  email: string;
  fullName: string;
  username: string;
  password?: string;
  profile?: { photo?: string };
}
