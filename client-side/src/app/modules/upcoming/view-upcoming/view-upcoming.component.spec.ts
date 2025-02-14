import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUpcomingComponent } from './view-upcoming.component';

describe('ViewUpcomingComponent', () => {
  let component: ViewUpcomingComponent;
  let fixture: ComponentFixture<ViewUpcomingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUpcomingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewUpcomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
