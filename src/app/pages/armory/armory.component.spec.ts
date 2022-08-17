import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmoryComponent } from './armory.component';

describe('ArmoryComponent', () => {
  let component: ArmoryComponent;
  let fixture: ComponentFixture<ArmoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArmoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
