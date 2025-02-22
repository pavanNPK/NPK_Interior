import { Injectable } from '@angular/core';
import {CategoriesDTO} from "../models/categoriesDTO";
import {ResponseWithError} from "../models/commonDTO";
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import * as http from "node:http";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private http: HttpClient) {
  }

  getCategories(type: string, search: string): Observable<ResponseWithError<CategoriesDTO[]>> {
    return this.http.get<ResponseWithError<CategoriesDTO[]>>('http://localhost:3000/categories', {
      params: {
        type,
        search
      }
    })
      .pipe(map(response => response));
  }

  addCategory(category: CategoriesDTO[]): Observable<ResponseWithError<CategoriesDTO[]>> {
    return this.http.post<ResponseWithError<CategoriesDTO[]>>('http://localhost:3000/categories', category)
      .pipe(map(response => response));
  }

  getCategoryById(id: string): Observable<ResponseWithError<CategoriesDTO>>{
    return this.http.get<ResponseWithError<CategoriesDTO>>('http://localhost:3000/categories/'+ id)
  }

  deleteCategory(id: string, type: string): Observable<ResponseWithError<any>>{
    return this.http.delete<ResponseWithError<any>>(`http://localhost:3000/categories/${id}?type=${type}`)
  }

  updateCategory(data: any, type: string): Observable<ResponseWithError<CategoriesDTO>> {
    return this.http.put<ResponseWithError<CategoriesDTO>>(`http://localhost:3000/categories/${type}`, data)
  }
}
