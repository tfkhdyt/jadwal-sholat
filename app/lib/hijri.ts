const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function toHijriDate(date: Date) {
  return hijriFormatter.format(date);
}
