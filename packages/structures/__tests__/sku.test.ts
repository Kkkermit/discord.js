import { DiscordSnowflake } from '@sapphire/snowflake';
import { type APISKU, SKUFlags, SKUType } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { SKU } from '../src/skus/SKU.js';
import { kPatch } from '../src/utils/symbols.js';

describe('SKU structure', () => {
	const data: APISKU = {
		id: '1088510058284990888',
		type: SKUType.Subscription,
		application_id: '1088505943294599228',
		name: 'Test Premium',
		slug: 'test-premium',
		flags: SKUFlags.Available | SKUFlags.GuildSubscription,
	};

	let instance: SKU;

	beforeEach(() => {
		instance = new SKU(data);
	});

	test('SKU has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.type).toBe(data.type);
		expect(instance.applicationId).toBe(data.application_id);
		expect(instance.name).toBe(data.name);
		expect(instance.slug).toBe(data.slug);
		expect(instance.flags?.toJSON()).toBe(data.flags);
		expect(instance.flags?.toArray()).toStrictEqual(['Available', 'GuildSubscription']);

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the SKU works in place', () => {
		const flags = SKUFlags.GuildSubscription;

		const patched = instance[kPatch]({ flags });

		expect(patched.flags?.toJSON()).toBe(flags);
		expect(patched.toJSON()).toEqual({ ...data, flags });
		expect(patched).toBe(instance);
	});

	test('flags, createdTimestamp & createdDate return null when they are not set', () => {
		// @ts-expect-error for testing functionality with a null id and undefined flags
		const instanceWithoutIdAndFlags = new SKU({ ...data, id: null, flags: undefined });

		expect(instanceWithoutIdAndFlags.flags).toBeNull();
		expect(instanceWithoutIdAndFlags.createdTimestamp).toBeNull();
		expect(instanceWithoutIdAndFlags.createdDate).toBeNull();
	});
});
