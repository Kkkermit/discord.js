import { DiscordSnowflake } from '@sapphire/snowflake';
import type { APISoundboardSound, APIUser } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { SoundboardSound } from '../src/soundboards/SoundboardSound.js';
import { kPatch } from '../src/utils/symbols.js';

describe('SoundboardSound structure', () => {
	const user: APIUser = {
		id: '1186735126128459786',
		username: 'username',
		discriminator: '0',
		global_name: 'User',
		avatar: null,
	};

	const data: APISoundboardSound = {
		name: 'Yay',
		sound_id: '1302035717624262717',
		volume: 1,
		emoji_id: '1302035405396496404',
		emoji_name: null,
		guild_id: '1197193342716174376',
		available: true,
		user,
	};

	let instance: SoundboardSound;

	beforeEach(() => {
		instance = new SoundboardSound(data);
	});

	test('SoundboardSound has all properties', () => {
		expect(instance.name).toBe(data.name);
		expect(instance.soundId).toBe(data.sound_id);
		expect(instance.volume).toBe(data.volume);
		expect(instance.emojiId).toBe(data.emoji_id);
		expect(instance.emojiName).toBeNull();
		expect(instance.guildId).toBe(data.guild_id);
		expect(instance.available).toBe(data.available);

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.sound_id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the SoundboardSound works in place', () => {
		const volume = 0.5;
		const available = false;

		const patched = instance[kPatch]({ volume, available });

		expect(patched.volume).toBe(volume);
		expect(patched.available).toBe(available);
		expect(patched.toJSON()).toEqual({ ...data, volume, available });
		expect(patched).toBe(instance);
	});

	test('createdTimestamp/createdDate return null for default sounds (no guild id)', () => {
		// default sounds have small, non-snowflake ids and no guild_id
		const defaultSound: APISoundboardSound = {
			name: 'quack',
			sound_id: '1',
			volume: 1,
			emoji_id: null,
			emoji_name: '🦆',
			available: true,
		};

		const defaultInstance = new SoundboardSound(defaultSound);

		expect(defaultInstance.guildId).toBeUndefined();
		expect(defaultInstance.createdTimestamp).toBeNull();
		expect(defaultInstance.createdDate).toBeNull();
	});
});
