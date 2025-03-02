import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [
    Button,
    RouterLink
  ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {

  constructor(private as: AuthService) {
  }
  reloadPage() {
    window.location.reload();
  }

  logout() {
    this.as.logout()
  }
}
