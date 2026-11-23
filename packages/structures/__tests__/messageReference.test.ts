import { type APIMessageReference, MessageReferenceType } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { MessageReference } from '../src/messages/MessageReference.js';
import { kPatch } from '../src/utils/symbols.js';

describe('MessageReference structure', () => {
	const data: APIMessageReference = {
		type: MessageReferenceType.Forward,
		message_id: '1303460452305440788',
		channel_id: '1197193343345332254',
		// note guild_id is missing (to test kPatch)
	};

	let instance: MessageReference;

	beforeEach(() => {
		instance = new MessageReference(data);
	});

	test('MessageReference has all properties', () => {
		expect(instance.type).toBe(data.type);
		expect(instance.messageId).toBe(data.message_id);
		expect(instance.channelId).toBe(data.channel_id);
		expect(instance.guildId).toBeUndefined();
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the MessageReference works in place', () => {
		const guildId = '1197193342716174376';

		const patched = instance[kPatch]({ guild_id: guildId });

		expect(patched.guildId).toBe(guildId);
		expect(patched.toJSON()).toEqual({ ...data, guild_id: guildId });
		expect(patched).toBe(instance);
	});

	test('type defaults to MessageReferenceType.Default when it is missing', () => {
		const dataWithoutType: APIMessageReference = {
			message_id: data.message_id!,
			channel_id: data.channel_id,
		};

		const instanceWithoutType = new MessageReference(dataWithoutType);

		expect(instanceWithoutType.type).toBe(MessageReferenceType.Default);
		expect(instanceWithoutType.toJSON()).toStrictEqual(dataWithoutType);
	});
});
