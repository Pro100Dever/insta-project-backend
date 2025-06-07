import { UUID } from "crypto";
import { Request as ExpressRequest } from "express";

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

export interface AuthRequest extends ExpressRequest {
  user: IRegUser;
}
