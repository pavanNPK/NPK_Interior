import { Injectable } from '@angular/core';
import {CategoriesDTO} from "../models/categoriesDTO";
import {ResponseWithError} from "../models/commonDTO";
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private http: HttpClient) {
  }

  getCategories(type: string): Observable<ResponseWithError<CategoriesDTO[]>> {
    return this.http.get<ResponseWithError<CategoriesDTO[]>>('http://localhost:3000/categories?type=' + type)
      .pipe(map(response => response));
  }

  addCategory(category: CategoriesDTO[]): Observable<ResponseWithError<CategoriesDTO[]>> {
    return this.http.post<ResponseWithError<CategoriesDTO[]>>('http://localhost:3000/categories', category)
      .pipe(map(response => response));
  }
}
