import {Component, inject} from '@angular/core';
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
export class OverlaySpinnerComponent {
  private loadingService = inject(OverlaySpinnerService);
  loading$: Observable<boolean> = this.loadingService.loading$;
}
