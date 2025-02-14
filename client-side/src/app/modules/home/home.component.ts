import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NbLayoutModule} from "@nebular/theme";
import {NavbarComponent} from "../core/components/navbar/navbar.component";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

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
export class HomeComponent {

}
