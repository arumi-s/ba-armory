import { InjectionToken } from '@angular/core';
import type { Options } from 'sortablejs';

export const SORTABLEJS_CONFIG: InjectionToken<Options> = new InjectionToken('SORTABLEJS_CONFIG');
