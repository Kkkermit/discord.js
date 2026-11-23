import { DiscordSnowflake } from '@sapphire/snowflake';
import { type APISubscription, SubscriptionStatus } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { Subscription } from '../src/subscriptions/Subscription.js';
import { kPatch } from '../src/utils/symbols.js';

describe('Subscription structure', () => {
	const data: APISubscription = {
		id: '1278078770116427839',
		user_id: '1088605110638227537',
		sku_ids: ['1158857122189168803'],
		entitlement_ids: ['1251681203453706381'],
		renewal_sku_ids: null,
		current_period_start: '2024-08-27T19:48:44.406000+00:00',
		current_period_end: '2024-09-27T19:48:44.406000+00:00',
		status: SubscriptionStatus.Ending,
		canceled_at: '2024-09-01T10:00:00.000000+00:00',
		country: 'GB',
	};

	let instance: Subscription;

	beforeEach(() => {
		instance = new Subscription(data);
	});

	test('Subscription has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.userId).toBe(data.user_id);
		expect(instance.skuIds).toStrictEqual(data.sku_ids);
		expect(instance.entitlementIds).toStrictEqual(data.entitlement_ids);
		expect(instance.renewalSkuIds).toBeNull();
		expect(instance.status).toBe(data.status);
		expect(instance.country).toBe(data.country);

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);

		const currentPeriodStartTimestamp = Date.parse(data.current_period_start);
		expect(instance.currentPeriodStartTimestamp).toBe(currentPeriodStartTimestamp);
		expect(instance.currentPeriodStartDate!.valueOf()).toBe(currentPeriodStartTimestamp);

		const currentPeriodEndTimestamp = Date.parse(data.current_period_end);
		expect(instance.currentPeriodEndTimestamp).toBe(currentPeriodEndTimestamp);
		expect(instance.currentPeriodEndDate!.valueOf()).toBe(currentPeriodEndTimestamp);

		const canceledTimestamp = Date.parse(data.canceled_at!);
		expect(instance.canceledTimestamp).toBe(canceledTimestamp);
		expect(instance.canceledDate!.valueOf()).toBe(canceledTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the Subscription works in place', () => {
		const status = SubscriptionStatus.Inactive;

		const patched = instance[kPatch]({ status });

		expect(patched.status).toBe(status);
		expect(patched.toJSON()).toEqual({ ...data, status });
		expect(patched).toBe(instance);
	});

	test('dates & timestamps return null when they are not supplied (and no snowflake id)', () => {
		const subscriptionWithoutIdData = {
			...data,
			id: null,
			current_period_start: undefined,
			current_period_end: undefined,
			canceled_at: null,
		};

		// @ts-expect-error for testing functionality with a null id and undefined timestamps
		const instanceWithoutId = new Subscription(subscriptionWithoutIdData);

		expect(instanceWithoutId.createdTimestamp).toBeNull();
		expect(instanceWithoutId.createdDate).toBeNull();

		expect(instanceWithoutId.currentPeriodStartTimestamp).toBeNull();
		expect(instanceWithoutId.currentPeriodStartDate).toBeNull();

		expect(instanceWithoutId.currentPeriodEndTimestamp).toBeNull();
		expect(instanceWithoutId.currentPeriodEndDate).toBeNull();

		expect(instanceWithoutId.canceledTimestamp).toBeNull();
		expect(instanceWithoutId.canceledDate).toBeNull();

		const json = instanceWithoutId.toJSON();
		expect(json.current_period_start).toBeUndefined();
		expect(json.current_period_end).toBeUndefined();
		// toJSON() currently leaves out null timestamps, so accept the key being either missing or null
		expect(json.canceled_at ?? null).toBeNull();
	});
});
