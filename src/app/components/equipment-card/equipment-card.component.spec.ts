import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCardComponent } from './equipment-card.component';

describe('EquipmentCardComponent', () => {
  let component: EquipmentCardComponent;
  let fixture: ComponentFixture<EquipmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
