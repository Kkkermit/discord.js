import { DiscordSnowflake } from '@sapphire/snowflake';
import { type APIStageInstance, StageInstancePrivacyLevel } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { StageInstance } from '../src/stageInstances/StageInstance.js';
import { kPatch } from '../src/utils/symbols.js';

describe('StageInstance structure', () => {
	const data: APIStageInstance = {
		id: '1303452816425517066',
		guild_id: '1197193342716174376',
		channel_id: '1197193343345332254',
		topic: 'Weekly community Q&A',
		privacy_level: StageInstancePrivacyLevel.GuildOnly,
		discoverable_disabled: false,
		// note guild_scheduled_event_id is missing (to test kPatch)
	};

	let instance: StageInstance;

	beforeEach(() => {
		instance = new StageInstance(data);
	});

	test('StageInstance has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.guildId).toBe(data.guild_id);
		expect(instance.channelId).toBe(data.channel_id);
		expect(instance.topic).toBe(data.topic);
		expect(instance.privacyLevel).toBe(data.privacy_level);
		expect(instance.guildScheduledEventId).toBeUndefined();

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the StageInstance works in place', () => {
		const topic = 'Weekly community Q&A (part 2)';
		const guildScheduledEventId = '1303452101632364564';

		const patched = instance[kPatch]({
			topic,
			guild_scheduled_event_id: guildScheduledEventId,
		});

		expect(patched.topic).toBe(topic);
		expect(patched.guildScheduledEventId).toBe(guildScheduledEventId);
		expect(patched.toJSON()).toEqual({
			...data,
			topic,
			guild_scheduled_event_id: guildScheduledEventId,
		});
		expect(patched).toBe(instance);
	});

	test('createdTimestamp/createdDate return null if id is not set', () => {
		// @ts-expect-error for testing functionality with a null id
		const instanceWithoutId = new StageInstance({ ...data, id: null });

		expect(instanceWithoutId.createdTimestamp).toBeNull();
		expect(instanceWithoutId.createdDate).toBeNull();
	});
});
