import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectorComponent } from '../selector/selector.component';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, ComponentsModule],
})
export class SelectorModule {}
