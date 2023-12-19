import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { SettingComponent } from '../setting/setting.component';

@NgModule({
	declarations: [SettingComponent],
	imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule],
})
export class SettingModule {}
