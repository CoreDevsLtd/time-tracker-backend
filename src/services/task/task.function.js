

export function formatTime({minute, second}) {
  return`${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}
