import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '../../components/components.module';
import { SelectorComponent } from '../selector/selector.component';

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, ComponentsModule],
})
export class SelectorModule {}
