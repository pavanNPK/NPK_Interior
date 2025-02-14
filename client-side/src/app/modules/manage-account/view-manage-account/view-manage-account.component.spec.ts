import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewManageAccountComponent } from './view-manage-account.component';

describe('ViewManageAccountComponent', () => {
  let component: ViewManageAccountComponent;
  let fixture: ComponentFixture<ViewManageAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewManageAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewManageAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
