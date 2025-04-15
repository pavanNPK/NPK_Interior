import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";
import {WISHLIST, WISHLIST_COUNT, DOMAIN_URL} from "../constants/API-DTO";

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor(private http: HttpClient) { }

  getWishlistCount(): Observable<ResponseWithError<any>>{
    return this.http.get<ResponseWithError<any>>(`${DOMAIN_URL}${WISHLIST}${WISHLIST_COUNT}`).pipe(map(response => response));
  }
}
