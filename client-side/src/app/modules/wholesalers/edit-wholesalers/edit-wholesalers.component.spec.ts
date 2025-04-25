import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWholesalersComponent } from './edit-wholesalers.component';

describe('EditWholesalersComponent', () => {
  let component: EditWholesalersComponent;
  let fixture: ComponentFixture<EditWholesalersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWholesalersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditWholesalersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
