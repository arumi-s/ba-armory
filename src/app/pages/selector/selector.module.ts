import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ComponentsModule } from '../../components/components.module';
import { SelectorComponent } from '../selector/selector.component';

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, FormsModule, ComponentsModule, MatCheckboxModule, MatDividerModule, MatButtonModule, MatIconModule],
})
export class SelectorModule {}
