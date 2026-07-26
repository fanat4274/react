import React from 'react';
import { CountDisplay } from '@/components/common/ui/CountDisplay';
import { CounterField } from '@/components/common/ui/CounterField';
import { Button } from '@/components/common/ui/Button';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '@/components/common/ui/Button/const/buttonVariants';
import { Input } from '@/components/common/ui/Input';
import { INPUT_TYPES } from '@/components/common/ui/Input/const/inputVariants';
import type { UseCounterResult } from '@/hooks/useCounter';
import { CARDS } from './const/cards';
import { COLORLESS_CARDS } from './const/colorlessCards';
import type { CardType } from './const/types';
import type { CardCounts, DeckBuildSummary } from './hooks/useDeckBuild';
import { CardRow } from './CardRow';
import styles from './DeckBuild.module.scss';

const TYPE_LABELS: Record<CardType, string> = {
  attack: 'アタック',
  skill: 'スキル',
  power: 'パワー',
};

const CARD_TYPES: CardType[] = ['attack', 'skill', 'power'];

export type DeckBuildProps = {
  counts: CardCounts;
  colorlessCounts: CardCounts;
  junkCount: number;
  irregularAttack: UseCounterResult;
  irregularSkill: UseCounterResult;
  irregularPower: UseCounterResult;
  summary: DeckBuildSummary;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onIncrementBase: (cardId: string) => void;
  onDecrementBase: (cardId: string) => void;
  onIncrementPlus: (cardId: string) => void;
  onDecrementPlus: (cardId: string) => void;
  onIncrementColorlessBase: (cardId: string) => void;
  onDecrementColorlessBase: (cardId: string) => void;
  onIncrementColorlessPlus: (cardId: string) => void;
  onDecrementColorlessPlus: (cardId: string) => void;
  onIncrementJunk: () => void;
  onDecrementJunk: () => void;
  onResetAll: () => void;
};

/**
 * UI層。stateを持たず、Container層から受け取ったcounts/summary/ハンドラを
 * カード一覧・集計パネルへそのまま橋渡しして描画するだけの純粋コンポーネント。
 */
export const DeckBuild: React.FC<DeckBuildProps> = ({
  counts,
  colorlessCounts,
  junkCount,
  irregularAttack,
  irregularSkill,
  irregularPower,
  summary,
  searchQuery,
  onSearchQueryChange,
  onIncrementBase,
  onDecrementBase,
  onIncrementPlus,
  onDecrementPlus,
  onIncrementColorlessBase,
  onDecrementColorlessBase,
  onIncrementColorlessPlus,
  onDecrementColorlessPlus,
  onIncrementJunk,
  onDecrementJunk,
  onResetAll,
}) => {
  const normalizedQuery = searchQuery.trim();
  const matchesQuery = (card: { name: string; effectBase: string }) =>
    normalizedQuery === '' || card.name.includes(normalizedQuery) || card.effectBase.includes(normalizedQuery);
  const filteredCards = CARDS.filter(matchesQuery);
  const filteredColorlessCards = COLORLESS_CARDS.filter(matchesQuery);

  return (
    <div className={styles.container}>
      <Input
        inputType={INPUT_TYPES.TEXT}
        placeholder="カード名・効果で検索"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.header}>
        <h2>リージェント デッキビルド</h2>
        <Button variant={BUTTON_VARIANTS.PRIMARY} size={BUTTON_SIZES.SMALL} onClick={onResetAll}>
          全項目リセット
        </Button>
      </div>

      <div className={styles.summary}>
        <CountDisplay label="デッキ総数（ごみ札込み）" value={summary.totalDeckCount} unit="枚" />
        <CountDisplay label="カード枚数（登録カードのみ）" value={summary.totalCardCount} unit="枚" />
        <CountDisplay label="アタック枚数" value={summary.countByType.attack} unit="枚" />
        <CountDisplay label="ブロック枚数" value={summary.blockSkillCount} unit="枚" />
        <CountDisplay label="スキル枚数（非ブロック）" value={summary.nonBlockSkillCount} unit="枚" />
        <CountDisplay label="パワー枚数" value={summary.countByType.power} unit="枚" />
        <CountDisplay label="総威力" value={summary.totalPower} />
        <CountDisplay label="総ブロック" value={summary.totalBlock} />
        <CountDisplay label="総スター消費" value={summary.totalStarCost} unit="✦" />
        <CountDisplay label="総スター回収" value={summary.totalStarGain} unit="✦" />
        <CountDisplay label="平均ATK" value={Math.round(summary.averageAttackPower * 10) / 10} />
        <CountDisplay label="平均ブロック" value={Math.round(summary.averageBlock * 10) / 10} />
        <CountDisplay label="平均コスト" value={Math.round(summary.averageEnergyCost * 10) / 10} />
        <CountDisplay label="平均消費スター" value={Math.round(summary.averageStarCost * 10) / 10} unit="✦" />
        <CountDisplay label="平均回収スター" value={Math.round(summary.averageStarGain * 10) / 10} unit="✦" />
      </div>

      <div className={styles.junkRow}>
        <CounterField
          label="ごみ札"
          value={junkCount}
          unit="枚"
          onIncrement={onIncrementJunk}
          onDecrement={onDecrementJunk}
        />
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>イレギュラーカード（手動追加）</h3>
        <div className={styles.list}>
          <CounterField
            label="アタック"
            value={irregularAttack.value}
            unit="枚"
            onIncrement={irregularAttack.increment}
            onDecrement={irregularAttack.decrement}
            onReset={irregularAttack.reset}
          />
          <CounterField
            label="スキル"
            value={irregularSkill.value}
            unit="枚"
            onIncrement={irregularSkill.increment}
            onDecrement={irregularSkill.decrement}
            onReset={irregularSkill.reset}
          />
          <CounterField
            label="パワー"
            value={irregularPower.value}
            unit="枚"
            onIncrement={irregularPower.increment}
            onDecrement={irregularPower.decrement}
            onReset={irregularPower.reset}
          />
        </div>
      </section>

      <p className={styles.note}>
        「集計対象外」タグのカードはXコスト・条件付き効果・パワーカードのため、枚数のみカウントし総威力/総ブロックには含めていないのです。
        イレギュラーカード・ごみ札はカタログに無いカードを手動で加算する枠で、枚数のみデッキ総数に反映し総威力/総ブロック等の集計には含めていないのです。
      </p>

      {CARD_TYPES.map((type) => (
        <section key={type} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {TYPE_LABELS[type]}（{summary.countByType[type]}枚）
          </h3>
          <div className={styles.list}>
            {filteredCards
              .filter((card) => card.type === type)
              .map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  baseCount={counts[card.id].base}
                  plusCount={counts[card.id].plus}
                  onIncrementBase={() => onIncrementBase(card.id)}
                  onDecrementBase={() => onDecrementBase(card.id)}
                  onIncrementPlus={() => onIncrementPlus(card.id)}
                  onDecrementPlus={() => onDecrementPlus(card.id)}
                />
              ))}
          </div>
        </section>
      ))}

      <h2 className={styles.subHeading}>無色カード（全クラス共通）</h2>
      {CARD_TYPES.map((type) => (
        <section key={`colorless-${type}`} className={styles.section}>
          <h3 className={styles.sectionTitle}>{TYPE_LABELS[type]}</h3>
          <div className={styles.list}>
            {filteredColorlessCards
              .filter((card) => card.type === type)
              .map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  baseCount={colorlessCounts[card.id].base}
                  plusCount={colorlessCounts[card.id].plus}
                  onIncrementBase={() => onIncrementColorlessBase(card.id)}
                  onDecrementBase={() => onDecrementColorlessBase(card.id)}
                  onIncrementPlus={() => onIncrementColorlessPlus(card.id)}
                  onDecrementPlus={() => onDecrementColorlessPlus(card.id)}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
};
