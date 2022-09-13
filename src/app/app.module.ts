import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SortablejsModule } from './services/sortable';
import { HoverinputModule } from './services/hoverinput';
import { PreloadService } from './services/preload.service';

import { ArmoryModule } from './pages/armory/armory.module';
import { SelectorModule } from './pages/selector/selector.module';
import { SettingModule } from './pages/setting/setting.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { environment } from '../environments/environment';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		SortablejsModule,
		HoverinputModule.forRoot(),
		ArmoryModule,
		SelectorModule,
		SettingModule,

		MatDialogModule,
		MatIconModule,
		MatButtonModule,
		MatToolbarModule,
		MatSnackBarModule,

		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
	providers: [
		PreloadService,
		{
			provide: APP_INITIALIZER,
			useFactory: PreloadService.initialize,
			multi: true,
			deps: [PreloadService],
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
