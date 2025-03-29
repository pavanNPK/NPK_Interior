import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponseWithError } from '../models/commonDTO';
import { ProductsDTO } from '../models/productsDTO';
import {ADD_PRODUCTS, DOMAIN_URL, GET_ALL_PRODUCTS} from "../constants/API-DTO";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}


  getProducts(): Observable<ResponseWithError<ProductsDTO[]>> {
    return this.http.get<ResponseWithError<ProductsDTO[]>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}`)
      .pipe(map(response => response));
  }

  addProducts(formData: FormData): Observable<ResponseWithError<any>> {
    return this.http.post<ResponseWithError<any>>(`${DOMAIN_URL}${ADD_PRODUCTS}`, formData)
      .pipe(map(response => response));
  }

  getProductById(slug: string): Observable<ResponseWithError<ProductsDTO>> {
    return this.http.get<ResponseWithError<ProductsDTO>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}/${slug}`)
      .pipe(map(response => response));
  }
}
