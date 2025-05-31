import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DOMAIN_URL, GET_REQUIRED_STOCK, WHOLESALERS} from "../constants/API-DTO";
import {ResponseWithError} from "../models/commonDTO";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient ) { }

  getRequestedStock(): Observable<ResponseWithError<any>> {
    return this.http.get<ResponseWithError<any>>(`${DOMAIN_URL}${WHOLESALERS}${GET_REQUIRED_STOCK}`).pipe(map(response => response));
  }
}
