const DEFAULT_EMPTY_MESSAGE = 'No ratings yet. Be the first to rate this road!';

export const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const renderComment = (comment) =>
  comment ? escapeHtml(comment) : '<em class="text-gray-400">No comment</em>';

export const formatStars = (value = 0) => {
  const normalized = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return '★'.repeat(normalized) + '☆'.repeat(5 - normalized);
};

export const formatRatingSummary = (avg = 0, total = 0) => {
  const safeAvg = Number.isFinite(avg) ? avg : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const suffix = safeTotal === 1 ? 'rating' : 'ratings';
  return `${safeAvg.toFixed(1)} / 5.0 (${safeTotal} ${suffix})`;
};

export function updateRoadHeader(road = {}, { nameEl, starsEl, summaryEl } = {}) {
  const avgRating = parseFloat(road.average_rating ?? 0) || 0;
  const totalRatings = parseInt(road.total_ratings ?? 0, 10) || 0;
  if (nameEl) nameEl.textContent = road.name || 'Unknown road';
  if (starsEl) starsEl.textContent = formatStars(avgRating);
  if (summaryEl) summaryEl.textContent = formatRatingSummary(avgRating, totalRatings);
}

const buildRatingCard = (rating) => {
  const stars = formatStars(rating.rating);
  const dateLabel = rating.created_at
    ? escapeHtml(new Date(rating.created_at).toLocaleDateString())
    : '';
  const authorSource = rating.user_id != null ? rating.user_id : 'Anonymous';
  const author = `By: ${escapeHtml(authorSource)}`;
  return `
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-2">
        <div class="text-yellow-500 text-xl">${stars}</div>
        <span class="text-sm text-gray-500">${dateLabel}</span>
      </div>
      <p class="text-gray-700">${renderComment(rating.comment)}</p>
      <p class="text-sm text-gray-500 mt-2">${author}</p>
    </div>
  `;
};

export function resetRatingsSection(
  { loadingEl, emptyEl, listEl } = {},
  { emptyMessage = DEFAULT_EMPTY_MESSAGE } = {}
) {
  loadingEl?.classList.remove('hidden');
  if (emptyEl) {
    emptyEl.classList.add('hidden');
    emptyEl.textContent = emptyMessage;
  }
  if (listEl) {
    listEl.innerHTML = '';
    listEl.classList.add('hidden');
  }
}

export function renderRatingsSection(
  { loadingEl, emptyEl, listEl } = {},
  ratings = [],
  { emptyMessage = DEFAULT_EMPTY_MESSAGE } = {}
) {
  loadingEl?.classList.add('hidden');

  if (!ratings.length) {
    if (emptyEl) {
      emptyEl.textContent = emptyMessage;
      emptyEl.classList.remove('hidden');
    }
    listEl?.classList.add('hidden');
    if (listEl) listEl.innerHTML = '';
    return;
  }

  emptyEl?.classList.add('hidden');
  if (listEl) {
    listEl.classList.remove('hidden');
    listEl.innerHTML = ratings.map(buildRatingCard).join('');
  }
}

export function createStarRating(starElements, { onChange } = {}) {
  const stars = Array.from(starElements || []);
  let currentValue = 0;

  const applyValue = (value) => {
    stars.forEach((star, index) => {
      if (index < value) {
        star.classList.add('selected');
      } else {
        star.classList.remove('selected');
      }
    });
  };

  stars.forEach((star, index) => {
    const starValue = index + 1;
    star.addEventListener('click', () => {
      currentValue = starValue;
      applyValue(currentValue);
      onChange?.(currentValue);
    });
    star.addEventListener('mouseenter', () => applyValue(starValue));
  });

  stars[0]?.parentElement?.addEventListener('mouseleave', () => applyValue(currentValue));

  return {
    getValue: () => currentValue,
    setValue: (value) => {
      currentValue = Math.max(0, Math.min(5, Number(value) || 0));
      applyValue(currentValue);
      onChange?.(currentValue);
    },
    reset: () => {
      currentValue = 0;
      applyValue(0);
      onChange?.(0);
    },
  };
}
