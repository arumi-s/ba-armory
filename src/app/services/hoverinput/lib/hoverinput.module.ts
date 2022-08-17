import { ModuleWithProviders, NgModule } from '@angular/core';
import { HOVERINPUT_CONFIG, Options } from './global';
import { HoverinputDirective } from './hoverinput.directive';

@NgModule({
	declarations: [HoverinputDirective],
	exports: [HoverinputDirective],
})
export class HoverinputModule {
	public static forRoot(globalOptions?: Options): ModuleWithProviders<HoverinputModule> {
		return {
			ngModule: HoverinputModule,
			providers: [{ provide: HOVERINPUT_CONFIG, useValue: globalOptions ?? {} }],
		};
	}
}
