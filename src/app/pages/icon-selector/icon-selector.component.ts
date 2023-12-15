import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-icon-selector',
	templateUrl: './icon-selector.component.html',
	styleUrls: ['./icon-selector.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSelectorComponent {
	constructor(public readonly dataService: DataService, public readonly dialogRef: MatDialogRef<IconSelectorComponent>) {}

	handleClickIcon(icon: string) {
		this.dataService.deck.selectedSquad.icon = icon;
		this.dialogRef.close();
	}
}
