import { loginRequest } from "@dtos/request/login.request";
import { registerRequest } from "@dtos/request/register.request";

export interface IAuthService {
  login(credential: loginRequest): Promise<any>;
  register(credential: registerRequest): Promise<any | string>;
  logout(refreshToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<any>;

  continueWithGoogle(credential: any): Promise<any>;
  continueWithFacebook(credential: any): Promise<any>;
}
