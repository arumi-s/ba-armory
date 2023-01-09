import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabElephsComponent } from './tab-elephs.component';

describe('TabElephsComponent', () => {
	let component: TabElephsComponent;
	let fixture: ComponentFixture<TabElephsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TabElephsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TabElephsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
