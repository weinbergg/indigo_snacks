export function createOrderNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `IND-${timestamp}-${randomSuffix}`;
}
