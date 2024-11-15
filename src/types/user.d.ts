export interface User {
  sub: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}
