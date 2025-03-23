import { SortablejsModule } from 'ngx-sortablejs-simple';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ComponentsModule } from '../../components/components.module';
import { ArmoryComponent } from '../armory/armory.component';
import { TabArenaComponent } from './tab-arena/tab-arena.component';
import { TabCampaignsComponent } from './tab-campaigns/tab-campaigns.component';
import { TabElephsComponent } from './tab-elephs/tab-elephs.component';
import { TabFavorComponent } from './tab-favor/tab-favor.component';
import { TabGearsComponent } from './tab-gears/tab-gears.component';
import { TabItemsComponent } from './tab-items/tab-items.component';

@NgModule({
	declarations: [
		ArmoryComponent,
		TabCampaignsComponent,
		TabElephsComponent,
		TabFavorComponent,
		TabGearsComponent,
		TabItemsComponent,
		TabArenaComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		SortablejsModule,

		MatTooltipModule,
		MatButtonModule,
		MatCheckboxModule,
		MatDividerModule,
		MatIconModule,
		MatMenuModule,
		MatTabsModule,

		ComponentsModule,
	],
})
export class ArmoryModule {}
