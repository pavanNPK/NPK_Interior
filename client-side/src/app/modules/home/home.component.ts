import { Component, OnInit } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NbLayoutModule} from "@nebular/theme";
import {NavbarComponent} from "../core/components/navbar/navbar.component";
import {EventService} from "../../shared/services/event.service";
import {LocationsService} from "../../services/locations.service";
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    NbLayoutModule,
    NavbarComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private eventService: EventService, private locationS: LocationsService) {
    eventService.triggerNavbar();
  }
  ngOnInit() {
    setTimeout(() => {
      this.eventService.triggerNavbar();
    }, 0);
    this.getLocations();
  }
  getLocations() {
    // this.locationS.getLocations().subscribe(res => {
    //   console.log(res);
    // })
  }
}
