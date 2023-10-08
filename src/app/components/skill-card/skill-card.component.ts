import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

import { DeckSkill } from '../../entities/deck-skill';
import { SkillType } from '../../entities/enum';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-skill-card',
	templateUrl: './skill-card.component.html',
	styleUrls: ['./skill-card.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillCardComponent implements OnInit, OnDestroy {
	@Input()
	model: DeckSkill;

	@Input()
	isTarget: boolean = false;

	@HostBinding('attr.skill_type')
	skillType: SkillType;
	skillTypeText: string;

	name: string;
	iconUrl: string;
	typeClass: string;

	get level() {
		return this.isTarget ? this.model.levelTarget : this.model.level;
	}

	set level(level: number) {
		if (this.isTarget) this.model.levelTarget = level;
		else this.model.level = level;
	}

	private changeSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		const student = this.dataService.getStudent(this.model.studentId);
		const skill = student.skills[this.model.index];

		this.name = skill.name;
		this.iconUrl = skill.iconUrl;
		this.skillType = skill.skillType;
		// i18n
		this.skillTypeText = this.dataService.localization.ui[`student_skill_${skill.skillType.toLowerCase()}`];
		this.typeClass = 'mat-' + student.bulletType;

		this.changeSubscription = this.model.change$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	@HostListener('click', ['$event'])
	handleClick(event: MouseEvent) {
		event.preventDefault();

		if (event.ctrlKey) {
			this.level = this.level === this.model.levelMax ? this.model.levelMin : this.model.levelMax;
		} else {
			this.level = this.level + 1;
		}
	}

	@HostListener('contextmenu', ['$event'])
	handleContextmenu(event: MouseEvent) {
		event.preventDefault();

		this.level = this.level - 1;
	}
}
