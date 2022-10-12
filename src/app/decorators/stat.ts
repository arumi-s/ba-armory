import { Change } from '../entities/change';

export interface StatOptions {
	name: string;
	min?: string;
	max?: string;
	target?: string | false;
}

export const Stat = (options: StatOptions): PropertyDecorator => {
	if (options.min == null) options.min = options.name + 'Min';
	if (options.max == null) options.max = options.name + 'Max';
	if (options.target == null) options.target = options.name + 'Target';

	return function (objOrCls: Object, propertyKey: string | symbol) {
		Object.defineProperties(objOrCls, {
			[options.name]: {
				get: function (): number {
					return this[propertyKey];
				},
				set: function (value: number) {
					if (isNaN(value)) value = 0;
					value = Math.max(Math.min(Math.floor(value), this[options.max]), this[options.min]);
					if (this[propertyKey] !== value) {
						const valueOld = this[propertyKey];
						this[propertyKey] = value;
						if (options.target && this[options.target] < this[propertyKey]) {
							const valueTargetOld = this[options.target];
							this[options.target] = this[propertyKey];
							this.change$?.next({
								[options.name]: new Change(valueOld, this[propertyKey]),
								[options.target]: new Change(valueTargetOld, this[options.target]),
							});
						} else {
							this.change$?.next({ [options.name]: new Change(valueOld, this[propertyKey]) });
						}
					}
				},
			},
		});
	};
};

export interface StatTargetOptions {
	name: string;
	min?: string;
	max?: string;
	target?: string;
}

export const StatTarget = (options: StatTargetOptions): PropertyDecorator => {
	if (options.min == null) options.min = options.name + 'Min';
	if (options.max == null) options.max = options.name + 'Max';
	if (options.target == null) options.target = options.name + 'Target';

	return function (objOrCls: Object, propertyKey: string | symbol) {
		Object.defineProperties(objOrCls, {
			[options.target]: {
				get: function (): number {
					return this[propertyKey];
				},
				set: function (valueTarget: number) {
					if (isNaN(valueTarget)) valueTarget = 0;
					valueTarget = Math.max(Math.min(Math.floor(valueTarget), this[options.max]), this[options.name], this[options.min]);
					if (this[propertyKey] !== valueTarget) {
						const valueTargetOld = this[propertyKey];
						this[propertyKey] = valueTarget;
						this.change$?.next({ [options.target]: new Change(valueTargetOld, this[propertyKey]) });
					}
				},
			},
		});
	};
};
