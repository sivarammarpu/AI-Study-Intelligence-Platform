import { useEffect, useRef, useState } from 'react';

/**
 * SM2 Spaced Repetition Algorithm
 * Quality ratings: 0-5 (0-2 = failure, 3-5 = success)
 */

const MIN_EASE = 1.3;

const initialCardState = () => ({
  repetitions: 0,
  easeFactor: 2.5,
  interval: 0,
  nextReview: new Date(),
  lastQuality: null,
});

export const sm2 = (card, quality) => {
  let { repetitions, easeFactor, interval } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    easeFactor = Math.max(
      MIN_EASE,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
    repetitions += 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { repetitions, easeFactor, interval, nextReview, lastQuality: quality };
};

export const useSpacedRepetition = (initialCards = []) => {
  const [cards, setCards] = useState(() =>
    initialCards.map((card, i) => ({
      ...card,
      id: card.id ?? i,
      ...initialCardState(),
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const dueCards = cards.filter(c => new Date() >= new Date(c.nextReview));
  const currentCard = dueCards[currentIndex] ?? null;

  const rateCard = (quality) => {
    if (!currentCard) return;
    setCards(prev =>
      prev.map(c =>
        c.id === currentCard.id ? { ...c, ...sm2(c, quality) } : c
      )
    );
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const resetSession = () => setCurrentIndex(0);

  const getStats = () => ({
    total: cards.length,
    due: dueCards.length,
    mastered: cards.filter(c => c.repetitions >= 4).length,
  });

  return { cards, dueCards, currentCard, currentIndex, rateCard, resetSession, getStats };
};
