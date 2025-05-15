import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStockReqComponent } from './view-stock-req.component';

describe('ViewStockReqComponent', () => {
  let component: ViewStockReqComponent;
  let fixture: ComponentFixture<ViewStockReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStockReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStockReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
