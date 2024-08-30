import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-icon-selector',
	templateUrl: './icon-selector.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSelectorComponent {
	constructor(public readonly dataService: DataService, public readonly dialogRef: MatDialogRef<IconSelectorComponent>) {}

	handleClickIcon(icon: string) {
		this.dataService.deck.selectedSquad.icon = icon;
		this.dialogRef.close();
	}
}
