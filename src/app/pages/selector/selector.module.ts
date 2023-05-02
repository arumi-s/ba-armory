import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ComponentsModule } from '../../components/components.module';
import { SelectorComponent } from '../selector/selector.component';

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, FormsModule, ComponentsModule, MatCheckboxModule],
})
export class SelectorModule {}
