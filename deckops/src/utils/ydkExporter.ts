export function generateYDKContent(cards: { yugiohId: number; quantity: number }[]): string {
  const mainDeckCards = cards.flatMap(card => 
    Array(card.quantity).fill(card.yugiohId)
  );

  return [
    '#created by Yu-Gi-Oh! Deck Simulator',
    '#main',
    ...mainDeckCards,
    '#extra',
    '!side',
    ''
  ].join('\n');
}

export function downloadYDKFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${filename}.ydk`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}