import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	type APITeam,
	type APITeamMember,
	type APIUser,
	TeamMemberMembershipState,
	TeamMemberRole,
} from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { Team } from '../src/teams/Team.js';
import { TeamMember } from '../src/teams/TeamMember.js';
import { kPatch } from '../src/utils/symbols.js';

const user: APIUser = {
	id: '1186735126128459786',
	username: 'teammate',
	discriminator: '0',
	global_name: 'Teammate',
	avatar: null,
};

const member: APITeamMember = {
	membership_state: TeamMemberMembershipState.Invited,
	permissions: ['*'],
	team_id: '1095437592212226078',
	user,
	role: TeamMemberRole.Developer,
};

const data: APITeam = {
	icon: 'b47eb6bdf5db0d1eaa2e0e5ad7a1b00c',
	id: '1095437592212226078',
	members: [member],
	name: 'My Team',
	owner_user_id: '1095437129278517268',
};

describe('Team structure', () => {
	let instance: Team;

	beforeEach(() => {
		instance = new Team(data);
	});

	test('Team has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.icon).toBe(data.icon);
		expect(instance.name).toBe(data.name);
		expect(instance.ownerUserId).toBe(data.owner_user_id);

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the Team works in place', () => {
		const name = 'My Renamed Team';

		const patched = instance[kPatch]({ name, icon: null });

		expect(patched.name).toBe(name);
		expect(patched.icon).toBeNull();
		expect(patched.toJSON()).toEqual({ ...data, name, icon: null });
		expect(patched).toBe(instance);
	});

	test('createdTimestamp/createdDate return null if id is not set', () => {
		// @ts-expect-error for testing functionality with a null id
		const instanceWithoutId = new Team({ ...data, id: null });

		expect(instanceWithoutId.createdTimestamp).toBeNull();
		expect(instanceWithoutId.createdDate).toBeNull();
	});
});

describe('TeamMember structure', () => {
	let instance: TeamMember;

	beforeEach(() => {
		instance = new TeamMember(member);
	});

	test('TeamMember has all properties', () => {
		expect(instance.membershipState).toBe(member.membership_state);
		expect(instance.teamId).toBe(member.team_id);
		expect(instance.role).toBe(member.role);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(member);
	});

	test('Patching the TeamMember works in place', () => {
		const membershipState = TeamMemberMembershipState.Accepted;

		const patched = instance[kPatch]({ membership_state: membershipState });

		expect(patched.membershipState).toBe(membershipState);
		expect(patched.toJSON()).toEqual({ ...member, membership_state: membershipState });
		expect(patched).toBe(instance);
	});
});
