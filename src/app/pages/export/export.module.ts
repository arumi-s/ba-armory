import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ExportComponent } from './export.component';

@NgModule({
	declarations: [ExportComponent],
	imports: [CommonModule, FormsModule, MatButtonModule, MatDividerModule, MatIconModule],
})
export class ExportModule {}
