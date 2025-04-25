import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ResponseWithError} from "../models/commonDTO";
import {DOMAIN_URL, GET_ALL_LOCATIONS} from "../constants/API-DTO";
import {LocationsDTO} from "../models/locationsDTO";
@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  constructor(private http: HttpClient ) { }

  getLocations(): Observable<ResponseWithError<LocationsDTO[]>> {
    return this.http.get<ResponseWithError<LocationsDTO[]>>(`${DOMAIN_URL}${GET_ALL_LOCATIONS}`)
      .pipe(map(response => response));
  }
}
