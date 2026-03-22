export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "not_specified";
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}

export interface ProfileResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  role: "user" | "admin";
  status: "active" | "banned";
  createdAt: Date | null;
  updatedAt: Date | null;
}
