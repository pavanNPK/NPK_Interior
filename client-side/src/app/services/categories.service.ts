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

  getCategories(): Observable<ResponseWithError<CategoriesDTO[]>> {
    return this.http.get<ResponseWithError<CategoriesDTO[]>>('http://localhost:3000/categories')
      .pipe(map(response => response));
  }
}
