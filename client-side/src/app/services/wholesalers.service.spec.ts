import { TestBed } from '@angular/core/testing';

import { WholesalersService } from './wholesalers.service';

describe('WholesalersService', () => {
  let service: WholesalersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WholesalersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
