import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabArenaComponent } from './tab-arena.component';

describe('TabArenaComponent', () => {
	let component: TabArenaComponent;
	let fixture: ComponentFixture<TabArenaComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TabArenaComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TabArenaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
