import { TestBed } from '@angular/core/testing';

import { OverlaySpinnerService } from './overlay-spinner.service';

describe('OverlaySpinnerService', () => {
  let service: OverlaySpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlaySpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
