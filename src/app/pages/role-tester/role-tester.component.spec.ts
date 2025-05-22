import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleTesterComponent } from './role-tester.component';

describe('RoleTesterComponent', () => {
  let component: RoleTesterComponent;
  let fixture: ComponentFixture<RoleTesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleTesterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
