import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OverlaySpinnerService } from '../../../services/overlay-spinner.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class OverlaySpinnerInterceptor implements HttpInterceptor {
  private totalRequests = 0; // Track active API calls

  constructor(private loaderService: OverlaySpinnerService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.totalRequests++;
    this.loaderService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loaderService.hide();
        }
      })
    );
  }

}
