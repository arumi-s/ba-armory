import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadTextComponent } from './squad-text.component';

describe('SquadTextComponent', () => {
  let component: SquadTextComponent;
  let fixture: ComponentFixture<SquadTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquadTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquadTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
