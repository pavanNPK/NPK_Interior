import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { OverlaySpinnerInterceptor } from './overlay-spinner.interceptor';
import {of} from "rxjs";

describe('OverlaySpinnerInterceptor', () => {
  let interceptor: HttpInterceptor;
  let httpHandler: HttpHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OverlaySpinnerInterceptor,
        { provide: HttpHandler, useValue: {} }
      ]
    });
    interceptor = TestBed.inject(OverlaySpinnerInterceptor);
    httpHandler = TestBed.inject(HttpHandler);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should intercept the request', () => {
    const request = new HttpRequest('GET', 'https://example.com');
    const next = {
      handle: (req: HttpRequest<any>) => {
        expect(req.url).toEqual(request.url);
        return of(null);
      }
    };
    // @ts-ignore
    interceptor.intercept(request, next).subscribe();
  });
});
