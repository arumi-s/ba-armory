import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignCardComponent } from './campaign-card.component';

describe('CampaignCardComponent', () => {
  let component: CampaignCardComponent;
  let fixture: ComponentFixture<CampaignCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
