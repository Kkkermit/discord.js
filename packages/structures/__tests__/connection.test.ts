import { type APIConnection, ConnectionService, ConnectionVisibility } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { Connection } from '../src/users/Connection.js';
import { kPatch } from '../src/utils/symbols.js';

describe('Connection structure', () => {
	const data: APIConnection = {
		// the id of the account on the connected service, not a Discord snowflake
		id: '583231',
		name: 'octocat',
		type: ConnectionService.GitHub,
		verified: true,
		friend_sync: false,
		show_activity: true,
		two_way_link: false,
		visibility: ConnectionVisibility.Everyone,
		// note revoked is missing (to test its default and kPatch)
	};

	let instance: Connection;

	beforeEach(() => {
		instance = new Connection(data);
	});

	test('Connection has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.name).toBe(data.name);
		expect(instance.type).toBe(data.type);
		expect(instance.revoked).toBe(false);
		expect(instance.verified).toBe(data.verified);
		expect(instance.friendSync).toBe(data.friend_sync);
		expect(instance.showActivity).toBe(data.show_activity);
		expect(instance.twoWayLink).toBe(data.two_way_link);
		expect(instance.visibility).toBe(data.visibility);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the Connection works in place', () => {
		const revoked = true;
		const visibility = ConnectionVisibility.None;

		const patched = instance[kPatch]({ revoked, visibility });

		expect(patched.revoked).toBe(revoked);
		expect(patched.visibility).toBe(visibility);
		expect(patched.toJSON()).toEqual({ ...data, revoked, visibility });
		expect(patched).toBe(instance);
	});
});
