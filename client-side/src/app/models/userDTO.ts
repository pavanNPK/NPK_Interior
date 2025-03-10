export class RegisterUserDTO {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  password?: string;
  otp?: number;
  role?: string;
  code?: string;
  _id?: string;
  isVerified?: boolean;
  verifiedOn?: Date;
  createdAt?: Date;
  createdOn?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
export class UserDTO {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  role?: string;
  code?: string;
  _id?: string;
  lastLoggedIn?: any;
}
