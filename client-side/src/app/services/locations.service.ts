import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ResponseWithError } from "../models/commonDTO";
import { DOMAIN_URL, GET_ALL_LOCATIONS } from "../constants/API-DTO";
import { LocationsDTO } from "../models/locationsDTO";

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  locations = signal<LocationsDTO[]>([]); // Signal to hold locations

  constructor(private http: HttpClient) {}

  loadLocations() {
    this.http.get<ResponseWithError<LocationsDTO[]>>(`${DOMAIN_URL}${GET_ALL_LOCATIONS}`)
      .subscribe(response => {
        if (response.success) {
          // @ts-ignore
          this.locations.set(response.response); // Set signal data
        }
      });
  }
}
