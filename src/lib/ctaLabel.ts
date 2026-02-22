const EM_DASH_PATTERN = /\s+\u2014\s+/;
const ASCII_DASH_PATTERN = /\s+-\s+/;

function splitOnDash(label: string): { base: string; rest: string | null } {
  if (EM_DASH_PATTERN.test(label)) {
    const [base, ...rest] = label.split(EM_DASH_PATTERN);
    return { base: (base ?? '').trim(), rest: rest.length > 0 ? rest.join(' — ').trim() : null };
  }

  if (ASCII_DASH_PATTERN.test(label)) {
    const [base, ...rest] = label.split(ASCII_DASH_PATTERN);
    return { base: (base ?? '').trim(), rest: rest.length > 0 ? rest.join(' - ').trim() : null };
  }

  return { base: label.trim(), rest: null };
}

export function withCtaPrice(label: string, formattedPrice: string | null | undefined): string {
  if (!formattedPrice) {
    return label;
  }

  const { base } = splitOnDash(label);
  if (!base) {
    return label;
  }

  return `${base} — ${formattedPrice}`;
}
