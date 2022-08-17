import { ModuleWithProviders, NgModule } from '@angular/core';
import { SORTABLEJS_CONFIG } from './globals';
import { SortablejsDirective } from './sortable.directive';
import { Options } from 'sortablejs';

@NgModule({
	declarations: [SortablejsDirective],
	exports: [SortablejsDirective],
})
export class SortablejsModule {
	public static forRoot(globalOptions: Options): ModuleWithProviders<SortablejsModule> {
		return {
			ngModule: SortablejsModule,
			providers: [{ provide: SORTABLEJS_CONFIG, useValue: globalOptions }],
		};
	}
}
