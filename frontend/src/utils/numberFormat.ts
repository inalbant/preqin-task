export const formatLargeNumber = (num: number): string => {
  const billion = 1_000_000_000;
  const million = 1_000_000;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let result = "";
  if (absNum >= billion || absNum >= 999.5 * million) {
    result = `£${(absNum / billion).toFixed(2)}B`.replace(/\.?0+B$/, "B");
  } else if (absNum >= million) {
    result = `£${(absNum / million).toFixed(2)}M`.replace(/\.?0+M$/, "M");
  } else {
    result = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(absNum);
  }

  return isNegative ? result.replace("£", "-£") : result;
};
