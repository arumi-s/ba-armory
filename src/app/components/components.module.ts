import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HoverinputModule } from '../services/hoverinput';
import { BarRatingModule } from 'ngx-bar-rating';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';

import { EquipmentCardComponent } from './equipment-card/equipment-card.component';
import { StudentCardComponent } from './student-card/student-card.component';
import { StudentIconComponent } from './student-icon/student-icon.component';
import { SkillCardComponent } from './skill-card/skill-card.component';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { CampaignCardComponent } from './campaign-card/campaign-card.component';
import { ItemUserComponent } from './item-user/item-user.component';

@NgModule({
	declarations: [
		EquipmentCardComponent,
		StudentCardComponent,
		StudentIconComponent,
		SkillCardComponent,
		ItemIconComponent,
		CampaignCardComponent,
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
		MatChipsModule,
		MatBadgeModule,
		MatRippleModule,
		MatSliderModule,
	],
	exports: [
		EquipmentCardComponent,
		StudentCardComponent,
		StudentIconComponent,
		SkillCardComponent,
		ItemIconComponent,
		CampaignCardComponent,
		ItemUserComponent,
	],
})
export class ComponentsModule {}
