import { SortablejsModule } from 'ngx-sortablejs-simple';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SquadTextComponent } from './squad-text.component';

@NgModule({
	declarations: [SquadTextComponent],
	imports: [CommonModule, FormsModule, SortablejsModule, MatCheckboxModule, MatDividerModule, MatButtonModule, MatIconModule],
})
export class SquadTextModule {}
