import { BarRatingModule } from 'ngx-bar-rating';
import { NgxHoverInputModule } from 'ngx-hover-input';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { CampaignCardComponent } from './campaign-card/campaign-card.component';
import { ElephCardComponent } from './eleph-card/eleph-card.component';
import { EquipmentCardComponent } from './equipment-card/equipment-card.component';
import { GearCardComponent } from './gear-card/gear-card.component';
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
		GearCardComponent,
		ItemUserComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		BarRatingModule,
		MatMenuModule,
		MatCardModule,
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
		NgxHoverInputModule,
	],
	exports: [
		EquipmentCardComponent,
		StudentCardComponent,
		StudentIconComponent,
		SkillCardComponent,
		ItemIconComponent,
		CampaignCardComponent,
		ElephCardComponent,
		GearCardComponent,
		ItemUserComponent,
	],
})
export class ComponentsModule {}
