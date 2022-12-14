import { BarRatingModule } from 'ngx-bar-rating';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { HoverinputModule } from '../services/hoverinput';
import { CampaignCardComponent } from './campaign-card/campaign-card.component';
import { ElephCardComponent } from './eleph-card/eleph-card.component';
import { EquipmentCardComponent } from './equipment-card/equipment-card.component';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { ItemUserComponent } from './item-user/item-user.component';
import { SkillCardComponent } from './skill-card/skill-card.component';
import { StudentCardComponent } from './student-card/student-card.component';
import { StudentIconComponent } from './student-icon/student-icon.component';

@NgModule({
	declarations: [
		EquipmentCardComponent,
		StudentCardComponent,
		StudentIconComponent,
		SkillCardComponent,
		ItemIconComponent,
		CampaignCardComponent,
		ElephCardComponent,
		ItemUserComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		HoverinputModule,
		BarRatingModule,
		MatMenuModule,
		MatCardModule,
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
	],
	exports: [
		EquipmentCardComponent,
		StudentCardComponent,
		StudentIconComponent,
		SkillCardComponent,
		ItemIconComponent,
		CampaignCardComponent,
		ElephCardComponent,
		ItemUserComponent,
	],
})
export class ComponentsModule {}
