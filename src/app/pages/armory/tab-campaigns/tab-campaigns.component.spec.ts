import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCampaignsComponent } from './tab-campaigns.component';

describe('TabCampaignsComponent', () => {
  let component: TabCampaignsComponent;
  let fixture: ComponentFixture<TabCampaignsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabCampaignsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
