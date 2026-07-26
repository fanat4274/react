'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCounter } from '@/hooks/useCounter';
import { CARDS } from '../const/cards';
import { COLORLESS_CARDS } from '../const/colorlessCards';
import type { CardData, CardType } from '../const/types';

export type CardCount = {
  base: number;
  plus: number;
};

export type CardCounts = Record<string, CardCount>;

export type DeckBuildSummary = {
  /** カタログカード（リージェント専用＋無色）のみの合計枚数 */
  totalCardCount: number;
  /** カタログカード＋イレギュラーカード＋ごみ札の合計枚数 */
  totalDeckCount: number;
  countByType: Record<CardType, number>;
  /** スキルカードのうちブロックを得る効果を持つカードの枚数 */
  blockSkillCount: number;
  /** スキルカードのうちブロックを得ない効果のカードの枚数（イレギュラースキルもここに含む） */
  nonBlockSkillCount: number;
  totalPower: number;
  totalBlock: number;
  totalStarCost: number;
  totalStarGain: number;
  totalEnergyCost: number;
  /** 平均値はカード0枚の場合0とする */
  averageAttackPower: number;
  averageBlock: number;
  averageStarCost: number;
  averageStarGain: number;
  averageEnergyCost: number;
};

/** 初期デッキ（スターター構成）。指定のないカードは0枚から開始する */
const INITIAL_BASE_COUNTS: Record<string, number> = {
  'attack-01': 4, // ストライク
  'attack-02': 1, // 落星
  'skill-01': 4, // 防御
  'skill-02': 1, // 畏敬
};

const createCounts = (cards: CardData[]): CardCounts => {
  const counts: CardCounts = {};
  cards.forEach((card) => {
    counts[card.id] = { base: INITIAL_BASE_COUNTS[card.id] ?? 0, plus: 0 };
  });
  return counts;
};

const updateCount = (counts: CardCounts, cardId: string, key: keyof CardCount, delta: number): CardCounts => ({
  ...counts,
  [cardId]: {
    ...counts[cardId],
    [key]: Math.max(0, counts[cardId][key] + delta),
  },
});

const safeAverage = (total: number, count: number): number => (count === 0 ? 0 : total / count);

type Accumulator = {
  countByType: Record<CardType, number>;
  blockSkillCount: number;
  nonBlockSkillCount: number;
  totalCardCount: number;
  totalPower: number;
  totalBlock: number;
  totalStarCost: number;
  totalStarGain: number;
  totalEnergyCost: number;
};

const createAccumulator = (): Accumulator => ({
  countByType: { attack: 0, skill: 0, power: 0 },
  blockSkillCount: 0,
  nonBlockSkillCount: 0,
  totalCardCount: 0,
  totalPower: 0,
  totalBlock: 0,
  totalStarCost: 0,
  totalStarGain: 0,
  totalEnergyCost: 0,
});

const accumulateCards = (cards: CardData[], counts: CardCounts, acc: Accumulator): void => {
  cards.forEach((card) => {
    const count = counts[card.id];
    const cardTotal = count.base + count.plus;
    if (cardTotal === 0) return;

    acc.totalCardCount += cardTotal;
    acc.countByType[card.type] += cardTotal;

    if (card.type === 'skill') {
      if (card.valueKind === 'block') {
        acc.blockSkillCount += cardTotal;
      } else {
        acc.nonBlockSkillCount += cardTotal;
      }
    }

    if (card.starCostBase !== null) acc.totalStarCost += card.starCostBase * count.base;
    if (card.starCostPlus !== null) acc.totalStarCost += card.starCostPlus * count.plus;

    if (card.energyCostBase !== null) acc.totalEnergyCost += card.energyCostBase * count.base;
    if (card.energyCostPlus !== null) acc.totalEnergyCost += card.energyCostPlus * count.plus;

    if (card.starGainBase !== null) acc.totalStarGain += card.starGainBase * count.base;
    if (card.starGainPlus !== null) acc.totalStarGain += card.starGainPlus * count.plus;

    if (card.aggregatable) {
      if (card.valueKind === 'damage') {
        if (card.baseValue !== null) acc.totalPower += card.baseValue * count.base;
        if (card.plusValue !== null) acc.totalPower += card.plusValue * count.plus;
      } else if (card.valueKind === 'block') {
        if (card.baseValue !== null) acc.totalBlock += card.baseValue * count.base;
        if (card.plusValue !== null) acc.totalBlock += card.plusValue * count.plus;
      }
    }
  });
};

/**
 * カードごとの所持枚数（無印/+版）を、リージェント専用カード（CARDS）と無色カード
 * （COLORLESS_CARDS）で別々のstateとして管理し、カタログ外の「ごみ札」枚数・
 * タイプ別に手動加算するイレギュラーカード枚数とあわせて、総枚数・総威力・総ブロック・
 * 総スター消費/回収・各種平均値を自動集計するデッキビルド用フック。
 * aggregatable=falseのカード（条件付き効果・Xコスト・パワーカード）と
 * イレギュラーカード・ごみ札は威力/ブロック集計から除外する（枚数カウントには含む）。
 */
export const useDeckBuild = () => {
  const [counts, setCounts] = useState<CardCounts>(() => createCounts(CARDS));
  const [colorlessCounts, setColorlessCounts] = useState<CardCounts>(() => createCounts(COLORLESS_CARDS));
  const [junkCount, setJunkCount] = useState(0);

  const irregularAttack = useCounter();
  const irregularSkill = useCounter();
  const irregularPower = useCounter();

  const incrementBase = useCallback((cardId: string) => {
    setCounts((prev) => updateCount(prev, cardId, 'base', 1));
  }, []);
  const decrementBase = useCallback((cardId: string) => {
    setCounts((prev) => updateCount(prev, cardId, 'base', -1));
  }, []);
  const incrementPlus = useCallback((cardId: string) => {
    setCounts((prev) => updateCount(prev, cardId, 'plus', 1));
  }, []);
  const decrementPlus = useCallback((cardId: string) => {
    setCounts((prev) => updateCount(prev, cardId, 'plus', -1));
  }, []);

  const incrementColorlessBase = useCallback((cardId: string) => {
    setColorlessCounts((prev) => updateCount(prev, cardId, 'base', 1));
  }, []);
  const decrementColorlessBase = useCallback((cardId: string) => {
    setColorlessCounts((prev) => updateCount(prev, cardId, 'base', -1));
  }, []);
  const incrementColorlessPlus = useCallback((cardId: string) => {
    setColorlessCounts((prev) => updateCount(prev, cardId, 'plus', 1));
  }, []);
  const decrementColorlessPlus = useCallback((cardId: string) => {
    setColorlessCounts((prev) => updateCount(prev, cardId, 'plus', -1));
  }, []);

  const incrementJunk = useCallback(() => {
    setJunkCount((prev) => prev + 1);
  }, []);
  const decrementJunk = useCallback(() => {
    setJunkCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetAll = useCallback(() => {
    setCounts(createCounts(CARDS));
    setColorlessCounts(createCounts(COLORLESS_CARDS));
    setJunkCount(0);
    irregularAttack.reset();
    irregularSkill.reset();
    irregularPower.reset();
  }, [irregularAttack, irregularSkill, irregularPower]);

  const summary = useMemo<DeckBuildSummary>(() => {
    const acc = createAccumulator();
    accumulateCards(CARDS, counts, acc);
    accumulateCards(COLORLESS_CARDS, colorlessCounts, acc);

    acc.countByType.attack += irregularAttack.value;
    acc.countByType.skill += irregularSkill.value;
    acc.countByType.power += irregularPower.value;
    acc.nonBlockSkillCount += irregularSkill.value;
    const irregularTotal = irregularAttack.value + irregularSkill.value + irregularPower.value;

    return {
      totalCardCount: acc.totalCardCount,
      totalDeckCount: acc.totalCardCount + irregularTotal + junkCount,
      countByType: acc.countByType,
      blockSkillCount: acc.blockSkillCount,
      nonBlockSkillCount: acc.nonBlockSkillCount,
      totalPower: acc.totalPower,
      totalBlock: acc.totalBlock,
      totalStarCost: acc.totalStarCost,
      totalStarGain: acc.totalStarGain,
      totalEnergyCost: acc.totalEnergyCost,
      averageAttackPower: safeAverage(acc.totalPower, acc.countByType.attack),
      averageBlock: safeAverage(acc.totalBlock, acc.blockSkillCount),
      averageStarCost: safeAverage(acc.totalStarCost, acc.totalCardCount),
      averageStarGain: safeAverage(acc.totalStarGain, acc.totalCardCount),
      averageEnergyCost: safeAverage(acc.totalEnergyCost, acc.totalCardCount),
    };
  }, [counts, colorlessCounts, junkCount, irregularAttack.value, irregularSkill.value, irregularPower.value]);

  return {
    counts,
    colorlessCounts,
    junkCount,
    irregularAttack,
    irregularSkill,
    irregularPower,
    incrementBase,
    decrementBase,
    incrementPlus,
    decrementPlus,
    incrementColorlessBase,
    decrementColorlessBase,
    incrementColorlessPlus,
    decrementColorlessPlus,
    incrementJunk,
    decrementJunk,
    resetAll,
    summary,
  };
};
