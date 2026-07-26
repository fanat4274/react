'use client';

import React, { useState } from 'react';
import { useDeckBuild } from './hooks/useDeckBuild';
import { DeckBuild } from './DeckBuild';

/**
 * Client層。useDeckBuildでリージェント専用カード・無色カードそれぞれの所持枚数
 * （無印/+版）・ごみ札枚数・イレギュラーカード枚数・集計サマリを保持し、
 * カード名検索クエリのstateとあわせてDeckBuild(UI層)へ値とハンドラを渡す。
 */
export const DeckBuildContainer: React.FC = () => {
  const {
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
  } = useDeckBuild();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DeckBuild
      counts={counts}
      colorlessCounts={colorlessCounts}
      junkCount={junkCount}
      irregularAttack={irregularAttack}
      irregularSkill={irregularSkill}
      irregularPower={irregularPower}
      summary={summary}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onIncrementBase={incrementBase}
      onDecrementBase={decrementBase}
      onIncrementPlus={incrementPlus}
      onDecrementPlus={decrementPlus}
      onIncrementColorlessBase={incrementColorlessBase}
      onDecrementColorlessBase={decrementColorlessBase}
      onIncrementColorlessPlus={incrementColorlessPlus}
      onDecrementColorlessPlus={decrementColorlessPlus}
      onIncrementJunk={incrementJunk}
      onDecrementJunk={decrementJunk}
      onResetAll={resetAll}
    />
  );
};
