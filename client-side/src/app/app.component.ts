import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {OverlaySpinnerComponent} from "./modules/core/components/overlay-spinner/overlay-spinner.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OverlaySpinnerComponent],
  providers: [

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'NPK Interior';
}
