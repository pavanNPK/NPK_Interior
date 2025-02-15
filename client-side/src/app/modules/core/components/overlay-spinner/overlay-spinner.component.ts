import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from "@angular/common";
import { OverlaySpinnerService } from "../../../../services/overlay-spinner.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-overlay-spinner',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './overlay-spinner.component.html',
  styleUrl: './overlay-spinner.component.scss'
})
export class OverlaySpinnerComponent implements OnInit {
  loading$: Observable<boolean> = new Observable<boolean>();
  constructor(private loaderService: OverlaySpinnerService) {}
  ngOnInit(): void {
    this.loading$ = this.loaderService.loading$;
  }
}
