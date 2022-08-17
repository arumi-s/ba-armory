import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIconComponent } from './student-icon.component';

describe('StudentIconComponent', () => {
  let component: StudentIconComponent;
  let fixture: ComponentFixture<StudentIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
