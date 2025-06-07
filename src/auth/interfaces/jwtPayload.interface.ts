import { UUID } from "crypto";
import { Request } from "express";

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

export interface AuthReq extends Request {
  user: IRegUser;
}
