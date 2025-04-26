import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";
import {WHOLESALERS, DOMAIN_URL} from "../constants/API-DTO";

@Injectable({
  providedIn: 'root'
})
export class WholesalersService {

  constructor(private http: HttpClient ) { }

  addWholesalers(formData: FormData): Observable<ResponseWithError<any>> {
    return this.http.post<ResponseWithError<any>>(`${DOMAIN_URL}${WHOLESALERS}`, formData)
      .pipe(map(response => response));
  }
}
