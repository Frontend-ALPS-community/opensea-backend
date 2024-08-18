function calcPriceDiffer(currentPrice, lowerLimitPrice) {
  const change = Math.round(((currentPrice - lowerLimitPrice) / lowerLimitPrice) * 100);

  if (change > 0) {
    return `${Math.abs(change)}% 위`;
  } else if (change < 0) {
    return `${Math.abs(change)}% 아래`;
  } else {
    return '--';
  }
}

module.exports = calcPriceDiffer;
