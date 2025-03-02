import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: HttpInterceptorFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    interceptor = TestBed.inject(HTTP_INTERCEPTORS)[0] as unknown as HttpInterceptorFn;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
