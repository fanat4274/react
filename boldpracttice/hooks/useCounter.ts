import { useCallback, useState } from 'react';

type UseCounterOptions = {
  /** 初期値・リセット時に戻る値 */
  initialValue?: number;
  /** decrement時にこの値を下回らない */
  min?: number;
  /** increment/decrement時の増減幅 */
  step?: number;
};

export type UseCounterResult = {
  value: number;
  increment: () => void;
  decrement: () => void;
  /** 任意の幅で加算する（±10などstep以外の増減用） */
  incrementBy: (amount: number) => void;
  /** 任意の幅で減算する（minを下回らない） */
  decrementBy: (amount: number) => void;
  /** 個別リセット。値をinitialValueに戻す */
  reset: () => void;
};

/**
 * 増減・個別リセットのみを扱う汎用カウンターフック。
 * ドメイン知識（アタック/スキル等）は持たず、呼び出し側が用途を決める。
 */
export const useCounter = (options: UseCounterOptions = {}): UseCounterResult => {
  const { initialValue = 0, min = 0, step = 1 } = options;
  const [value, setValue] = useState(initialValue);

  const increment = useCallback(() => {
    setValue((prev) => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setValue((prev) => Math.max(min, prev - step));
  }, [min, step]);

  const incrementBy = useCallback((amount: number) => {
    setValue((prev) => prev + amount);
  }, []);

  const decrementBy = useCallback(
    (amount: number) => {
      setValue((prev) => Math.max(min, prev - amount));
    },
    [min],
  );

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, increment, decrement, incrementBy, decrementBy, reset };
};
