import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponseWithError } from '../models/commonDTO';
import { ProductsDTO } from '../models/productsDTO';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<ResponseWithError<ProductsDTO[]>> {
    return this.http.get<ResponseWithError<ProductsDTO[]>>('http://localhost:3000/products')
      .pipe(map(response => response));
  }
}
