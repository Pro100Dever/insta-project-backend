import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private config: ConfigService) {}

  getJwtSecret() {
    return this.config.get<string>("JWT_SECRET");
  }
  getPort() {
    return this.config.get<number>("PORT", 3000);
    // если PORT не задан, вернётся 3000
  }
}
