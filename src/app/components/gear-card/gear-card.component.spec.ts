import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GearCardComponent } from './gear-card.component';

describe('GearCardComponent', () => {
	let component: GearCardComponent;
	let fixture: ComponentFixture<GearCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GearCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(GearCardComponent);
		component = fixture.componentInstance;
		fixture.markForCheck();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
