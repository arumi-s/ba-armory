import { hasKeys } from 'prop-change-decorators';
import stringWidth from 'string-width';

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-squad-text',
	templateUrl: './squad-text.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadTextComponent implements OnInit {
	title = '';

	assistText: string;
	starText: string;
	levelText: string;
	skillsText: string;
	equipmentsText: string;
	weaponText: string;
	gearText: string;

	rows = 0;
	text = '';

	constructor(public readonly dataService: DataService) {}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.i18n.squad_action_text;

		this.assistText = this.dataService.i18n.student_action_assist;
		this.starText = '★';
		this.levelText = 'Lv.';
		this.skillsText = this.dataService.localization.UI['skills'];
		this.equipmentsText = this.dataService.localization.UI['student_gear_short'];
		this.weaponText = this.dataService.localization.UI['ex_weapon'];
		this.gearText = this.dataService.localization.UI['ex_gear'];

		this.updateText();

		this.dataService.deck.options.change$.subscribe((changes) => {
			if (
				hasKeys(
					changes,
					'showSquadTextStar',
					'showSquadTextLevel',
					'showSquadTextSkills',
					'showSquadTextEquipments',
					'showSquadTextGear',
					'showSquadTextWeapon'
				)
			) {
				this.updateText();
			}
		});
	}

	handleClickInput(event: MouseEvent) {
		if (event.target instanceof HTMLTextAreaElement) {
			event.target.select();
		}
	}

	updateText() {
		const table = this.dataService.deck.selectedSquad.students.map((studentId) => {
			const deckStudent = this.dataService.deck.students.get(studentId);
			const student = this.dataService.getStudent(studentId);

			return [
				`${student.name}${deckStudent.isAlt() ? `(${this.assistText})` : ''}`,
				this.dataService.deck.options.showSquadTextStar ? `${this.starText}${deckStudent.star}` : false,
				this.dataService.deck.options.showSquadTextLevel ? `${this.levelText}${deckStudent.level}` : false,
				this.dataService.deck.options.showSquadTextSkills
					? deckStudent.skills.map((skill) => (skill.level === skill.levelMax ? 'M' : skill.level)).join('')
					: false,
				this.dataService.deck.options.showSquadTextEquipments ? deckStudent.equipments.map((equipment) => equipment.tier).join('') : false,
				this.dataService.deck.options.showSquadTextWeapon
					? deckStudent.star === deckStudent.starMax && deckStudent.weapon > 0
						? `${this.weaponText}${deckStudent.weapon}`
						: ''
					: false,
				this.dataService.deck.options.showSquadTextGear ? (deckStudent.gear > 0 ? `${this.gearText}${deckStudent.gear}` : '') : false,
			].filter((cell): cell is string => cell !== false);
		});
		const columns = Array.from({ length: Math.max(...table.map((row) => row.length)) }, (_, i) =>
			Math.max(...table.map((row) => stringWidth(row[i] ?? '')))
		);

		this.text = table
			.map((row) =>
				row
					.map((text, i) => text + ' '.repeat(columns[i] - stringWidth(text)))
					.join(' ')
					.trimEnd()
			)
			.join('\n');

		this.rows = this.dataService.deck.selectedSquad.students.length + 1;
	}
}
