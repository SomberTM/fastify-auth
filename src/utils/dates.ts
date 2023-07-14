export function getDateDaysOut(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function getExpiresInDays(days: number) {
  return getDateDaysOut(days).getUTCMilliseconds();
}
