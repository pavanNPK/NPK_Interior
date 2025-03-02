import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {Button} from "primeng/button";

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    RouterLink,
    Button
  ],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss'
})
export class AccessDeniedComponent {

}
