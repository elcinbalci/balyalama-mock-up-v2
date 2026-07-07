export function generateBarcode(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `BL${timestamp}${random}`;
}
