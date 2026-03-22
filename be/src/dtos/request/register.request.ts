import { Addresses } from "@ctypes/address";
import { OauthProvider } from "@ctypes/oauth_provider";

export interface registerRequest {
  firstName: string;
  lastName: string;
  email: string;
  emailVerificationToken: string;
  password: string;
  confirmPassword: string;
  gender: "male" | "female" | "not_specified";
  role: "user" | "admin";
  status?: string | "active" | "banned";
  oauthProviders?: OauthProvider[];
  addresses?: Addresses[];
}
