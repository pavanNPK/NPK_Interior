import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholesalersComponent } from './view-wholesalers.component';

describe('ViewWholesalersComponent', () => {
  let component: ViewWholesalersComponent;
  let fixture: ComponentFixture<ViewWholesalersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholesalersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholesalersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
