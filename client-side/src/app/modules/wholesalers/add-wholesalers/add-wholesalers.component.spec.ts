import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWholesalersComponent } from './add-wholesalers.component';

describe('AddWholesalersComponent', () => {
  let component: AddWholesalersComponent;
  let fixture: ComponentFixture<AddWholesalersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWholesalersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWholesalersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
