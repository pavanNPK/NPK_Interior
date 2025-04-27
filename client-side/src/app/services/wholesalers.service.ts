import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";
import {WHOLESALERS, DOMAIN_URL} from "../constants/API-DTO";
import { WholesalersDTO } from '../models/wholesalersDTO';

@Injectable({
  providedIn: 'root'
})
export class WholesalersService {

  constructor(private http: HttpClient ) { }

  addWholesalers(formData: FormData): Observable<ResponseWithError<any>> {
    return this.http.post<ResponseWithError<any>>(`${DOMAIN_URL}${WHOLESALERS}`, formData)
      .pipe(map(response => response));
  }

  getWholesalers(): Observable<ResponseWithError<WholesalersDTO[]>> {
    return this.http.get<ResponseWithError<WholesalersDTO[]>>(`${DOMAIN_URL}${WHOLESALERS}`)
      .pipe(map(response => response));
  }
}
