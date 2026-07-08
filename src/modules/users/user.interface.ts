import { Role, User_Status } from "../../../generated/prisma/enums";

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  profileImage?: string;
}

export interface IUpdateRoleStatus {
  role?: Role;
  customer_status: User_Status;
}