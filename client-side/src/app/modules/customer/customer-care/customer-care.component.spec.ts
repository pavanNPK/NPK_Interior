import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCareComponent } from './customer-care.component';

describe('CustomerCareComponent', () => {
  let component: CustomerCareComponent;
  let fixture: ComponentFixture<CustomerCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
