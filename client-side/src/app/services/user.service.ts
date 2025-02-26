import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  registerUser(data: any): Observable<ResponseWithError<any>> {
    return this.http.post<ResponseWithError<any>>('http://localhost:3000/users/register', data);
  }
}
