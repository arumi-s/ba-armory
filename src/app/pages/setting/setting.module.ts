import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from '../setting/setting.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
	declarations: [SettingComponent],
	imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
})
export class SettingModule {}
