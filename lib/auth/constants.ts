/** HttpOnly cookie storing the signed session JWT (Wave 1 custom auth). */
export const SESSION_COOKIE_NAME = "arcwealth_session";

/** Session lifetime (JWT + DB row). */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days
