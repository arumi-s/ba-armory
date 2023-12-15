import { SortablejsModule } from 'ngx-sortablejs-simple';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SquadTextComponent } from './squad-text.component';

@NgModule({
	declarations: [SquadTextComponent],
	imports: [CommonModule, FormsModule, SortablejsModule, MatCheckboxModule, MatDividerModule, MatButtonModule, MatIconModule],
})
export class SquadTextModule {}
