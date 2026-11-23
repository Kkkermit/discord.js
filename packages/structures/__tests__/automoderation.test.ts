import {
	type APIAutoModerationAction,
	type APIAutoModerationRule,
	type APIAutoModerationRuleTriggerMetadata,
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleKeywordPresetType,
	AutoModerationRuleTriggerType,
} from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { AutoModerationAction } from '../src/automoderation/actions/AutoModerationAction.js';
import { AutoModerationActionMetadata } from '../src/automoderation/actions/AutoModerationActionMetadata.js';
import { AutoModerationRule } from '../src/automoderation/AutoModerationRule.js';
import { AutoModerationRuleTriggerMetadata } from '../src/automoderation/AutoModerationRuleTriggerMetadata.js';
import { kPatch } from '../src/utils/symbols.js';

const triggerMetadata: APIAutoModerationRuleTriggerMetadata = {
	keyword_filter: ['cat*', '*dog', '*ana*', 'i like c++'],
	regex_patterns: ['(b|c)at'],
	allow_list: ['banana'],
};

const blockMessageAction: APIAutoModerationAction = {
	type: AutoModerationActionType.BlockMessage,
	metadata: { custom_message: 'Please keep financial discussions limited to the #finance channel' },
};

const sendAlertMessageAction: APIAutoModerationAction = {
	type: AutoModerationActionType.SendAlertMessage,
	metadata: { channel_id: '1197196059895021588' },
};

const timeoutAction: APIAutoModerationAction = {
	type: AutoModerationActionType.Timeout,
	metadata: { duration_seconds: 60 },
};

const data: APIAutoModerationRule = {
	id: '1304890243262005248',
	guild_id: '1197193342716174376',
	name: 'Keyword Filter 1',
	creator_id: '1186735126128459786',
	event_type: AutoModerationRuleEventType.MessageSend,
	trigger_type: AutoModerationRuleTriggerType.Keyword,
	trigger_metadata: triggerMetadata,
	actions: [blockMessageAction, sendAlertMessageAction, timeoutAction],
	enabled: true,
	exempt_roles: ['1197198217558278205', '1197198363939373066'],
	exempt_channels: ['1197193343345332254'],
};

describe('AutoModerationRule structure', () => {
	let instance: AutoModerationRule;

	beforeEach(() => {
		instance = new AutoModerationRule(data);
	});

	test('AutoModerationRule has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.guildId).toBe(data.guild_id);
		expect(instance.name).toBe(data.name);
		expect(instance.creatorId).toBe(data.creator_id);
		expect(instance.eventType).toBe(data.event_type);
		expect(instance.triggerType).toBe(data.trigger_type);
		expect(instance.enabled).toBe(data.enabled);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the AutoModerationRule works in place', () => {
		const name = 'Keyword Filter 2';
		const enabled = false;

		const patched = instance[kPatch]({ name, enabled });

		expect(patched.name).toBe(name);
		expect(patched.enabled).toBe(enabled);
		expect(patched.toJSON()).toEqual({ ...data, name, enabled });
		expect(patched).toBe(instance);
	});
});

describe('AutoModerationRuleTriggerMetadata structure', () => {
	let instance: AutoModerationRuleTriggerMetadata;

	beforeEach(() => {
		instance = new AutoModerationRuleTriggerMetadata(triggerMetadata);
	});

	test('AutoModerationRuleTriggerMetadata has all properties', () => {
		expect(instance.keywordFilter).toStrictEqual(triggerMetadata.keyword_filter);
		expect(instance.regexPatterns).toStrictEqual(triggerMetadata.regex_patterns);
		expect(instance.allowList).toStrictEqual(triggerMetadata.allow_list);
	});

	test('properties used by other trigger types', () => {
		const keywordPresetMetadata: APIAutoModerationRuleTriggerMetadata = {
			presets: [AutoModerationRuleKeywordPresetType.Profanity, AutoModerationRuleKeywordPresetType.Slurs],
			allow_list: ['banana'],
		};
		const mentionSpamMetadata: APIAutoModerationRuleTriggerMetadata = {
			mention_total_limit: 5,
			mention_raid_protection_enabled: true,
		};

		const keywordPresetInstance = new AutoModerationRuleTriggerMetadata(keywordPresetMetadata);
		expect(keywordPresetInstance.presets).toStrictEqual(keywordPresetMetadata.presets);
		expect(keywordPresetInstance.allowList).toStrictEqual(keywordPresetMetadata.allow_list);

		const mentionSpamInstance = new AutoModerationRuleTriggerMetadata(mentionSpamMetadata);
		expect(mentionSpamInstance.mentionTotalLimit).toBe(mentionSpamMetadata.mention_total_limit);
		expect(mentionSpamInstance.mentionRaidProtectionEnabled).toBe(mentionSpamMetadata.mention_raid_protection_enabled);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(triggerMetadata);
	});

	test('Patching the AutoModerationRuleTriggerMetadata works in place', () => {
		const allowList = ['banana', 'pineapple'];

		const patched = instance[kPatch]({ allow_list: allowList });

		expect(patched.allowList).toStrictEqual(allowList);
		expect(patched.toJSON()).toEqual({ ...triggerMetadata, allow_list: allowList });
		expect(patched).toBe(instance);
	});
});

describe('AutoModerationAction structure', () => {
	let instance: AutoModerationAction;

	beforeEach(() => {
		instance = new AutoModerationAction(timeoutAction);
	});

	test('AutoModerationAction has all properties', () => {
		expect(instance.type).toBe(timeoutAction.type);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(timeoutAction);
	});

	test('Patching the AutoModerationAction works in place', () => {
		const metadata = { duration_seconds: 300 };

		const patched = instance[kPatch]({ metadata });

		expect(patched.toJSON()).toEqual({ ...timeoutAction, metadata });
		expect(patched).toBe(instance);
	});
});

describe('AutoModerationActionMetadata structure', () => {
	test('AutoModerationActionMetadata has all properties', () => {
		const blockMessageMetadata = new AutoModerationActionMetadata(blockMessageAction.metadata!);
		expect(blockMessageMetadata.customMessage).toBe(blockMessageAction.metadata!.custom_message);

		const sendAlertMessageMetadata = new AutoModerationActionMetadata(sendAlertMessageAction.metadata!);
		expect(sendAlertMessageMetadata.channelId).toBe(sendAlertMessageAction.metadata!.channel_id);

		const timeoutMetadata = new AutoModerationActionMetadata(timeoutAction.metadata!);
		expect(timeoutMetadata.durationSeconds).toBe(timeoutAction.metadata!.duration_seconds);
	});

	test('toJSON() is accurate', () => {
		const instance = new AutoModerationActionMetadata(timeoutAction.metadata!);
		expect(instance.toJSON()).toStrictEqual(timeoutAction.metadata);
	});

	test('Patching the AutoModerationActionMetadata works in place', () => {
		const instance = new AutoModerationActionMetadata(blockMessageAction.metadata!);

		const patched = instance[kPatch]({ custom_message: null });

		expect(patched.customMessage).toBeNull();
		expect(patched.toJSON()).toEqual({ custom_message: null });
		expect(patched).toBe(instance);
	});
});
