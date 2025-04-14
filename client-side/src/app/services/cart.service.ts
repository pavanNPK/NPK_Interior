import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";
import {CART, CART_COUNT, DOMAIN_URL} from "../constants/API-DTO";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  getCartCount(): Observable<ResponseWithError<any>>{
    return this.http.get<ResponseWithError<any>>(`${DOMAIN_URL}${CART}${CART_COUNT}`).pipe(map(response => response));
  }
}
