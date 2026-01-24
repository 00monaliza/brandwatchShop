const RATE_LIMIT_KEY = 'upload_rate_limit';
const MAX_UPLOADS_PER_MINUTE = 10;
const MAX_UPLOADS_PER_HOUR = 50;
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 час


const cleanupOldRecords = () => {
  try {
    const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    Object.keys(data).forEach(key => {
      if (data[key] < oneHourAgo) {
        delete data[key];
      }
    });

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Rate limiter cleanup error:', error);
  }
};

export const checkRateLimit = () => {
  cleanupOldRecords();

  try {
    const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const oneHourAgo = now - (60 * 60 * 1000);

    const uploadsLastMinute = Object.values(data).filter(
      timestamp => timestamp > oneMinuteAgo
    ).length;

    const uploadsLastHour = Object.values(data).filter(
      timestamp => timestamp > oneHourAgo
    ).length;

    if (uploadsLastMinute >= MAX_UPLOADS_PER_MINUTE) {
      const oldestInMinute = Math.min(
        ...Object.values(data).filter(timestamp => timestamp > oneMinuteAgo)
      );
      const resetAt = oldestInMinute + (60 * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        error: `Превышен лимит загрузок. Максимум ${MAX_UPLOADS_PER_MINUTE} файлов в минуту.`
      };
    }

    if (uploadsLastHour >= MAX_UPLOADS_PER_HOUR) {
      const oldestInHour = Math.min(
        ...Object.values(data).filter(timestamp => timestamp > oneHourAgo)
      );
      const resetAt = oldestInHour + (60 * 60 * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        error: `Превышен лимит загрузок. Максимум ${MAX_UPLOADS_PER_HOUR} файлов в час.`
      };
    }

    return {
      allowed: true,
      remaining: {
        perMinute: MAX_UPLOADS_PER_MINUTE - uploadsLastMinute,
        perHour: MAX_UPLOADS_PER_HOUR - uploadsLastHour
      },
      resetAt: null
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // В случае ошибки разрешаем загрузку (fail-open)
    return { allowed: true, remaining: { perMinute: MAX_UPLOADS_PER_MINUTE, perHour: MAX_UPLOADS_PER_HOUR }, resetAt: null };
  }
};

/**
 * Регистрация загрузки
 */
export const recordUpload = () => {
  try {
    const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    const now = Date.now();
    const key = `upload_${now}_${Math.random().toString(36).substring(7)}`;
    
    data[key] = now;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Rate limiter record error:', error);
  }
};

/**
 * Сброс rate limit (для тестирования или админских действий)
 */
export const resetRateLimit = () => {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch (error) {
    console.error('Rate limiter reset error:', error);
  }
};
