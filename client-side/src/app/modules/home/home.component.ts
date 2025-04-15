import { Component, OnInit } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NbLayoutModule} from "@nebular/theme";
import {NavbarComponent} from "../core/components/navbar/navbar.component";
import {EventService} from "../../shared/services/event.service";
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
  constructor(private eventService: EventService) {
    eventService.triggerNavbar();
  }
  ngOnInit() {
    setTimeout(() => {
      this.eventService.triggerNavbar();
    }, 0);
  }
}
