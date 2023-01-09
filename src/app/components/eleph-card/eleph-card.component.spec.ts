import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElephCardComponent } from './eleph-card.component';

describe('ElephCardComponent', () => {
	let component: ElephCardComponent;
	let fixture: ComponentFixture<ElephCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ElephCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ElephCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
