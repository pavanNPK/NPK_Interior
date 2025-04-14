import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponseWithError } from '../models/commonDTO';
import { ProductsDTO } from '../models/productsDTO';
import {ADD_PRODUCTS, DOMAIN_URL, GET_ALL_CATEGORIES, GET_ALL_PRODUCTS} from "../constants/API-DTO";
import {CategoriesDTO} from "../models/categoriesDTO";
import {response} from "express";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}


  getProducts(search: string): Observable<ResponseWithError<ProductsDTO[]>> {
    return this.http.get<ResponseWithError<ProductsDTO[]>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}`, {
      params: {search}
    }).pipe(map(response => response));
  }

  addProducts(formData: FormData): Observable<ResponseWithError<any>> {
    return this.http.post<ResponseWithError<any>>(`${DOMAIN_URL}${ADD_PRODUCTS}`, formData)
      .pipe(map(response => response));
  }

  getProductById(slug: string): Observable<ResponseWithError<ProductsDTO>> {
    return this.http.get<ResponseWithError<ProductsDTO>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}/${slug}`)
      .pipe(map(response => response));
  }

  updateProduct(slug: string, formData: FormData): Observable<ResponseWithError<any>> {
    return this.http.put<ResponseWithError<any>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}/${slug}`, formData)
      .pipe(map(response => response));
  }

  deleteProduct(id: string): Observable<ResponseWithError<any>> {
    return this.http.delete<ResponseWithError<any>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}/${id}`)
      .pipe(map(response => response));
  }

  addProductToCartOrWishlist(id: string, typeValue: boolean, type: string): Observable<ResponseWithError<any>> {
    return this.http.patch<ResponseWithError<any>>(`${DOMAIN_URL}${GET_ALL_PRODUCTS}/${id}`, {[type]: !typeValue})
  }
}
