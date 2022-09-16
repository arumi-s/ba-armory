import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArmoryComponent } from './pages/armory/armory.component';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: ArmoryComponent,
	},
	{
		path: '**',
		component: ArmoryComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
