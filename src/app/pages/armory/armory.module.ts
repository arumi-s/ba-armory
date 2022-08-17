import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortablejsModule } from '../../services/sortable';

import { ArmoryComponent } from '../armory/armory.component';
import { ComponentsModule } from '../../components/components.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
	declarations: [ArmoryComponent],
	imports: [
		CommonModule,
		FormsModule,
		SortablejsModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatTabsModule,
		MatDividerModule,
		MatSlideToggleModule,
		ComponentsModule,
	],
})
export class ArmoryModule {}
