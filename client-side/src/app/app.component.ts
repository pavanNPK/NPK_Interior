import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {OverlaySpinnerComponent} from "./modules/core/components/overlay-spinner/overlay-spinner.component";
import {LocationsService} from "./services/locations.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OverlaySpinnerComponent],
  providers: [

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'NPK Interior';
  constructor(private locationsService: LocationsService) {}

  ngOnInit() {
    this.locationsService.loadLocations(); // Load once when app starts
  }
}
