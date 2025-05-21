export const generateSku = () => {
  const prefix = 'SKU'; // You can change this prefix as needed
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `${prefix}${randomNumber}`;
};


export const generateSlug = (productName) => {
  return productName?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

/** Capitalize First Letter of Each Word */
export const toTitleCase = (str) => {
  return str?.replace(/\w\S*/g, (txt) => {
    return txt?.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export function calculateTierValue(costPrice, currentExchangeRate, tierAddOn, tierMultiplyBy) {
  const price = Number(costPrice);
  const exchangeRate = Number(currentExchangeRate);
  const addOn = Number(tierAddOn);
  const multiplier = Number(tierMultiplyBy);

  if (exchangeRate === 0) {
    return 0; // or throw new Error("Division by zero is not allowed.");
  }

  const base = price / exchangeRate;
  const result = ((base + addOn) * 1.2) * multiplier;
  return parseFloat(result.toFixed(2)); // round to 2 decimal places
}

