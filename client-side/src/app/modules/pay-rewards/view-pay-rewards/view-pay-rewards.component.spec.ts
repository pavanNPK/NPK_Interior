import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPayRewardsComponent } from './view-pay-rewards.component';

describe('ViewPayRewardsComponent', () => {
  let component: ViewPayRewardsComponent;
  let fixture: ComponentFixture<ViewPayRewardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPayRewardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPayRewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
