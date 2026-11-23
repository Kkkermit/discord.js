import { DiscordSnowflake } from '@sapphire/snowflake';
import { type APISticker, type APIStickerPack, StickerFormatType, StickerType } from 'discord-api-types/v10';
import { beforeEach, describe, expect, test } from 'vitest';
import { StickerPack } from '../src/stickers/StickerPack.js';
import { kPatch } from '../src/utils/symbols.js';

describe('StickerPack structure', () => {
	const sticker: APISticker = {
		id: '1303463712923709470',
		pack_id: '1303463289219448862',
		name: 'Wumpus Wave',
		description: 'Wumpus says hello',
		tags: 'wave',
		type: StickerType.Standard,
		format_type: StickerFormatType.Lottie,
		available: true,
		sort_value: 1,
	};

	const data: APIStickerPack = {
		id: '1303463289219448862',
		stickers: [sticker],
		name: 'Wumpus Beyond',
		sku_id: '1303463289219448860',
		cover_sticker_id: sticker.id,
		description: 'Say hello to Wumpus!',
		banner_asset_id: '1303463541812760627',
	};

	let instance: StickerPack;

	beforeEach(() => {
		instance = new StickerPack(data);
	});

	test('StickerPack has all properties', () => {
		expect(instance.id).toBe(data.id);
		expect(instance.name).toBe(data.name);
		expect(instance.skuId).toBe(data.sku_id);
		expect(instance.coverStickerId).toBe(data.cover_sticker_id);
		expect(instance.description).toBe(data.description);
		expect(instance.bannerAssetId).toBe(data.banner_asset_id);

		const createdTimestamp = DiscordSnowflake.timestampFrom(data.id);
		expect(instance.createdTimestamp).toBe(createdTimestamp);
		expect(instance.createdDate!.valueOf()).toBe(createdTimestamp);
	});

	test('toJSON() is accurate', () => {
		expect(instance.toJSON()).toStrictEqual(data);
	});

	test('Patching the StickerPack works in place', () => {
		const description = 'Say goodbye to Wumpus!';

		const patched = instance[kPatch]({ description });

		expect(patched.description).toBe(description);
		expect(patched.toJSON()).toEqual({ ...data, description });
		expect(patched).toBe(instance);
	});

	test('createdTimestamp/createdDate return null if id is not set', () => {
		// @ts-expect-error for testing functionality with a null id
		const instanceWithoutId = new StickerPack({ ...data, id: null });

		expect(instanceWithoutId.createdTimestamp).toBeNull();
		expect(instanceWithoutId.createdDate).toBeNull();
	});
});
