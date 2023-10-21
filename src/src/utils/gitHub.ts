function base64ToText(base64: string): string {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
  return new TextDecoder().decode(bytes);
}

function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

// Usage
textToBase64('a Ā 𐀀 文 🦄'); // "YSDEgCDwkICAIOaWhyDwn6aE"
base64ToText('YSDEgCDwkICAIOaWhyDwn6aE'); // "a Ā 𐀀 文 🦄
