import type { APIMessageCall } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { MessageCall } from '../src/messages/MessageCall.js';
import { kPatch } from '../src/utils/symbols.js';

describe('MessageCall structure', () => {
	const data: APIMessageCall = {
		participants: ['1186735126128459786', '1088605110638227537'],
		ended_timestamp: '2024-11-05T20:45:12.123000+00:00',
	};

	const ongoingCallData: APIMessageCall = {
		participants: ['1186735126128459786'],
		ended_timestamp: null,
	};

	let instance: MessageCall;

	beforeEach(() => {
		instance = new MessageCall(data);
	});

	test('MessageCall has all properties', () => {
		const endedTimestamp = Date.parse(data.ended_timestamp!);
		expect(instance.endedTimestamp).toBe(endedTimestamp);
		expect(instance.endedDate!.valueOf()).toBe(endedTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('endedTimestamp/endedDate return null while the call is ongoing', () => {
		const ongoingInstance = new MessageCall(ongoingCallData);

		expect(ongoingInstance.endedTimestamp).toBeNull();
		expect(ongoingInstance.endedDate).toBeNull();

		// toJSON() currently leaves out null timestamps, so accept the key being either missing or null
		expect(ongoingInstance.toJSON().ended_timestamp ?? null).toBeNull();
	});

	test('Patching an ongoing MessageCall when it ends works in place', () => {
		const ongoingInstance = new MessageCall(ongoingCallData);

		const patched = ongoingInstance[kPatch](data);

		expect(patched.endedTimestamp).toBe(Date.parse(data.ended_timestamp!));
		expect(patched.toJSON()).toEqual(data);
		expect(patched).toBe(ongoingInstance);
	});
});
