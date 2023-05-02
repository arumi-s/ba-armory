import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabGearsComponent } from './tab-gears.component';

describe('TabGearsComponent', () => {
	let component: TabGearsComponent;
	let fixture: ComponentFixture<TabGearsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TabGearsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TabGearsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
