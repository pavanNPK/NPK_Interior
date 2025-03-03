export class ResponseWithError<T>{
  response?: T;
  message?: string;
  role?: string;
  success?: boolean;
}
