export const generateSku = () => {
  const prefix = 'SKU'; // You can change this prefix as needed
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number


return `${prefix}${randomNumber}`;
}


export const generateSlug = (productName) => {
  return productName?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}
