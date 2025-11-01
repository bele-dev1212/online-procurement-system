/**
 * Calculation Utilities
 * Comprehensive mathematical and business calculation functions
 */

import { PROCUREMENT_CONSTANTS, INVENTORY_CONSTANTS } from '../constants/appConstants';

/**
 * Financial Calculations
 */
export const FinancialCalculations = {
  // Calculate total from array of items with quantity and price
  calculateTotal: (items, quantityField = 'quantity', priceField = 'unitPrice') => {
    if (!Array.isArray(items) || items.length === 0) {
      return 0;
    }

    return items.reduce((total, item) => {
      const quantity = Number(item[quantityField]) || 0;
      const price = Number(item[priceField]) || 0;
      return total + (quantity * price);
    }, 0);
  },

  // Calculate subtotal (before tax and discounts)
  calculateSubtotal: (items, quantityField = 'quantity', priceField = 'unitPrice') => {
    return FinancialCalculations.calculateTotal(items, quantityField, priceField);
  },

  // Calculate tax amount
  calculateTax: (subtotal, taxRate) => {
    const rate = Number(taxRate) || 0;
    return subtotal * (rate / 100);
  },

  // Calculate discount amount
  calculateDiscount: (subtotal, discountType, discountValue) => {
    if (!discountType || !discountValue) {
      return 0;
    }

    if (discountType === 'percentage') {
      return subtotal * (Number(discountValue) / 100);
    } else if (discountType === 'fixed') {
      return Math.min(Number(discountValue), subtotal);
    }

    return 0;
  },

  // Calculate grand total
  calculateGrandTotal: (subtotal, tax = 0, discount = 0, shipping = 0) => {
    return subtotal + tax + shipping - discount;
  },

  // Calculate profit margin
  calculateProfitMargin: (revenue, cost) => {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
  },

  // Calculate markup percentage
  calculateMarkup: (cost, sellingPrice) => {
    if (cost === 0) return 0;
    return ((sellingPrice - cost) / cost) * 100;
  },

  // Calculate compound interest
  calculateCompoundInterest: (principal, rate, time, compoundFrequency = 1) => {
    return principal * Math.pow(1 + (rate / 100) / compoundFrequency, compoundFrequency * time);
  },

  // Calculate simple interest
  calculateSimpleInterest: (principal, rate, time) => {
    return principal * (rate / 100) * time;
  },

  // Calculate monthly payment for loan
  calculateLoanPayment: (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  },

  // Calculate net present value
  calculateNPV: (cashFlows, discountRate) => {
    return cashFlows.reduce((npv, cashFlow, period) => {
      return npv + (cashFlow / Math.pow(1 + discountRate, period));
    }, 0);
  },

  // Calculate internal rate of return (simplified)
  calculateIRR: (cashFlows, guess = 0.1) => {
    const maxIterations = 1000;
    const precision = 1e-6;
    
    let x0 = guess;
    let i = 0;
    
    while (i < maxIterations) {
      const f = FinancialCalculations.calculateNPV(cashFlows, x0);
      const fDerivative = cashFlows.reduce((sum, cashFlow, period) => {
        return sum - (period * cashFlow) / Math.pow(1 + x0, period + 1);
      }, 0);
      
      const x1 = x0 - f / fDerivative;
      
      if (Math.abs(x1 - x0) < precision) {
        return x1;
      }
      
      x0 = x1;
      i++;
    }
    
    return x0; // Return best guess after max iterations
  },

  // Calculate break-even point
  calculateBreakEven: (fixedCosts, pricePerUnit, variableCostPerUnit) => {
    if (pricePerUnit <= variableCostPerUnit) {
      return Infinity; // Never breaks even
    }
    
    return fixedCosts / (pricePerUnit - variableCostPerUnit);
  },

  // Calculate depreciation (straight-line method)
  calculateDepreciation: (cost, salvageValue, usefulLife) => {
    return (cost - salvageValue) / usefulLife;
  },
};

/**
 * Inventory Calculations
 */
export const InventoryCalculations = {
  // Calculate economic order quantity (EOQ)
  calculateEOQ: (demand, orderingCost, holdingCost) => {
    return Math.sqrt((2 * demand * orderingCost) / holdingCost);
  },

  // Calculate reorder point
  calculateReorderPoint: (averageDailyUsage, leadTimeDays, safetyStock = 0) => {
    return (averageDailyUsage * leadTimeDays) + safetyStock;
  },

  // Calculate safety stock
  calculateSafetyStock: (maxDailyUsage, averageDailyUsage, leadTimeDays) => {
    return (maxDailyUsage - averageDailyUsage) * leadTimeDays;
  },

  // Calculate inventory turnover ratio
  calculateInventoryTurnover: (costOfGoodsSold, averageInventory) => {
    if (averageInventory === 0) return 0;
    return costOfGoodsSold / averageInventory;
  },

  // Calculate days in inventory
  calculateDaysInInventory: (inventoryTurnover) => {
    if (inventoryTurnover === 0) return Infinity;
    return 365 / inventoryTurnover;
  },

  // Calculate stockout probability
  calculateStockoutProbability: (demandDuringLeadTime, reorderPoint) => {
    // Simplified calculation - in practice, this would use statistical distributions
    return Math.max(0, 1 - (reorderPoint / demandDuringLeadTime));
  },

  // Calculate carrying cost
  calculateCarryingCost: (averageInventory, holdingCostRate) => {
    return averageInventory * (holdingCostRate / 100);
  },

  // Calculate stock value
  calculateStockValue: (items) => {
    if (!Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      return total + (quantity * cost);
    }, 0);
  },

  // Calculate weighted average cost
  calculateWeightedAverageCost: (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0;
    
    const totalValue = InventoryCalculations.calculateStockValue(items);
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    
    if (totalQuantity === 0) return 0;
    return totalValue / totalQuantity;
  },

  // Calculate stock coverage (days of supply)
  calculateStockCoverage: (currentStock, averageDailyUsage) => {
    if (averageDailyUsage === 0) return Infinity;
    return currentStock / averageDailyUsage;
  },
};

/**
 * Statistical Calculations
 */
export const StatisticalCalculations = {
  // Calculate mean (average)
  calculateMean: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    
    const sum = numbers.reduce((total, num) => total + Number(num), 0);
    return sum / numbers.length;
  },

  // Calculate median
  calculateMedian: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  },

  // Calculate mode
  calculateMode: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return [];
    
    const frequency = {};
    let maxFrequency = 0;
    let modes = [];
    
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      
      if (frequency[num] > maxFrequency) {
        maxFrequency = frequency[num];
        modes = [num];
      } else if (frequency[num] === maxFrequency) {
        modes.push(num);
      }
    });
    
    return modes;
  },

  // Calculate standard deviation
  calculateStandardDeviation: (numbers, isSample = true) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    
    const mean = StatisticalCalculations.calculateMean(numbers);
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / 
                    (numbers.length - (isSample ? 1 : 0));
    
    return Math.sqrt(variance);
  },

  // Calculate variance
  calculateVariance: (numbers, isSample = true) => {
    const stdDev = StatisticalCalculations.calculateStandardDeviation(numbers, isSample);
    return Math.pow(stdDev, 2);
  },

  // Calculate correlation coefficient
  calculateCorrelation: (x, y) => {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      return 0;
    }
    
    const n = x.length;
    const meanX = StatisticalCalculations.calculateMean(x);
    const meanY = StatisticalCalculations.calculateMean(y);
    
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      
      numerator += diffX * diffY;
      denominatorX += Math.pow(diffX, 2);
      denominatorY += Math.pow(diffY, 2);
    }
    
    if (denominatorX === 0 || denominatorY === 0) return 0;
    
    return numerator / Math.sqrt(denominatorX * denominatorY);
  },

  // Calculate linear regression
  calculateLinearRegression: (x, y) => {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      return null;
    }
    
    const n = x.length;
    const meanX = StatisticalCalculations.calculateMean(x);
    const meanY = StatisticalCalculations.calculateMean(y);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    return {
      slope,
      intercept,
      predict: (xValue) => slope * xValue + intercept,
    };
  },

  // Calculate moving average
  calculateMovingAverage: (data, period) => {
    if (!Array.isArray(data) || data.length < period) return [];
    
    const movingAverages = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const average = StatisticalCalculations.calculateMean(slice);
      movingAverages.push(average);
    }
    
    return movingAverages;
  },

  // Calculate growth rate
  calculateGrowthRate: (current, previous) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
  },

  // Calculate compound annual growth rate (CAGR)
  calculateCAGR: (beginningValue, endingValue, years) => {
    if (beginningValue <= 0 || years <= 0) return 0;
    return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  },
};

/**
 * Procurement Calculations
 */
export const ProcurementCalculations = {
  // Calculate supplier performance score
  calculateSupplierScore: (metrics, weights = {}) => {
    const defaultWeights = {
      delivery: 0.3,
      quality: 0.3,
      price: 0.2,
      responsiveness: 0.2,
    };
    
    const finalWeights = { ...defaultWeights, ...weights };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(finalWeights).forEach(([metric, weight]) => {
      if (metrics[metric] !== undefined) {
        totalScore += metrics[metric] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },

  // Calculate cost savings
  calculateCostSavings: (previousCost, currentCost, quantity = 1) => {
    return (previousCost - currentCost) * quantity;
  },

  // Calculate savings percentage
  calculateSavingsPercentage: (previousCost, currentCost) => {
    if (previousCost === 0) return 0;
    return ((previousCost - currentCost) / previousCost) * 100;
  },

  // Calculate procurement efficiency
  calculateProcurementEfficiency: (totalSpend, procurementCosts) => {
    if (totalSpend === 0) return 0;
    return (procurementCosts / totalSpend) * 100;
  },

  // Calculate purchase order cycle time
  calculatePOCycleTime: (creationDate, approvalDate) => {
    const creation = new Date(creationDate);
    const approval = new Date(approvalDate);
    
    return Math.ceil((approval - creation) / (1000 * 60 * 60 * 24)); // Days
  },

  // Calculate supplier lead time
  calculateLeadTime: (orderDate, deliveryDate) => {
    const order = new Date(orderDate);
    const delivery = new Date(deliveryDate);
    
    return Math.ceil((delivery - order) / (1000 * 60 * 60 * 24)); // Days
  },

  // Calculate on-time delivery rate
  calculateOnTimeDeliveryRate: (totalDeliveries, onTimeDeliveries) => {
    if (totalDeliveries === 0) return 0;
    return (onTimeDeliveries / totalDeliveries) * 100;
  },

  // Calculate quality acceptance rate
  calculateQualityAcceptanceRate: (totalReceived, acceptedQuantity) => {
    if (totalReceived === 0) return 0;
    return (acceptedQuantity / totalReceived) * 100;
  },

  // Calculate spend by category
  calculateSpendByCategory: (purchaseOrders) => {
    if (!Array.isArray(purchaseOrders)) return {};
    
    return purchaseOrders.reduce((spendByCategory, po) => {
      const category = po.category || 'Uncategorized';
      const amount = Number(po.totalAmount) || 0;
      
      spendByCategory[category] = (spendByCategory[category] || 0) + amount;
      return spendByCategory;
    }, {});
  },

  // Calculate contract utilization rate
  calculateContractUtilization: (contractSpend, totalSpend) => {
    if (totalSpend === 0) return 0;
    return (contractSpend / totalSpend) * 100;
  },
};

/**
 * Bidding Calculations
 */
export const BiddingCalculations = {
  // Calculate bid evaluation score
  calculateBidScore: (bid, criteria, weights) => {
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const weight = weights[criterion.type] || 1;
      const score = bid.scores ? (bid.scores[criterion.type] || 0) : 0;
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },

  // Calculate bid competitiveness
  calculateBidCompetitiveness: (bidAmount, averageBidAmount) => {
    if (averageBidAmount === 0) return 100;
    return Math.max(0, 100 - ((bidAmount - averageBidAmount) / averageBidAmount) * 100);
  },

  // Calculate bid spread (range)
  calculateBidSpread: (bids) => {
    if (!Array.isArray(bids) || bids.length === 0) return 0;
    
    const amounts = bids.map(bid => Number(bid.amount) || 0).filter(amount => amount > 0);
    if (amounts.length === 0) return 0;
    
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    
    return max - min;
  },

  // Calculate average bid amount
  calculateAverageBid: (bids) => {
    if (!Array.isArray(bids) || bids.length === 0) return 0;
    
    const validBids = bids.map(bid => Number(bid.amount) || 0).filter(amount => amount > 0);
    if (validBids.length === 0) return 0;
    
    return StatisticalCalculations.calculateMean(validBids);
  },

  // Calculate bid success rate
  calculateBidSuccessRate: (totalBids, successfulBids) => {
    if (totalBids === 0) return 0;
    return (successfulBids / totalBids) * 100;
  },
};

/**
 * General Calculation Utilities
 */
export const CalculationUtils = {
  // Round to specified decimal places
  round: (number, decimalPlaces = 2) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  },

  // Format number for display (round and add commas)
  formatNumber: (number, decimalPlaces = 2) => {
    const rounded = CalculationUtils.round(number, decimalPlaces);
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  },

  // Calculate percentage
  percentage: (part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  // Calculate percentage value
  percentageOf: (percentage, total) => {
    return (percentage / 100) * total;
  },

  // Check if number is within range
  isInRange: (number, min, max) => {
    return number >= min && number <= max;
  },

  // Clamp number between min and max
  clamp: (number, min, max) => {
    return Math.min(Math.max(number, min), max);
  },

  // Calculate difference between two numbers
  difference: (a, b) => {
    return Math.abs(a - b);
  },

  // Calculate ratio
  ratio: (a, b) => {
    if (b === 0) return a > 0 ? Infinity : 0;
    return a / b;
  },

  // Calculate progress percentage
  progress: (current, total) => {
    if (total === 0) return 0;
    return CalculationUtils.clamp((current / total) * 100, 0, 100);
  },

  // Interpolate between two values
  interpolate: (start, end, factor) => {
    return start + (end - start) * factor;
  },

  // Calculate factorial
  factorial: (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  // Calculate permutations
  permutations: (n, r) => {
    if (n < r || n < 0 || r < 0) return 0;
    return CalculationUtils.factorial(n) / CalculationUtils.factorial(n - r);
  },

  // Calculate combinations
  combinations: (n, r) => {
    if (n < r || n < 0 || r < 0) return 0;
    return CalculationUtils.factorial(n) / (CalculationUtils.factorial(r) * CalculationUtils.factorial(n - r));
  },
};

/**
 * Export all calculations
 */
export default {
  financial: FinancialCalculations,
  inventory: InventoryCalculations,
  statistical: StatisticalCalculations,
  procurement: ProcurementCalculations,
  bidding: BiddingCalculations,
  utils: CalculationUtils,

  // Convenience methods
  calculate: (type, ...args) => {
    const calculators = {
      total: FinancialCalculations.calculateTotal,
      mean: StatisticalCalculations.calculateMean,
      median: StatisticalCalculations.calculateMedian,
      percentage: CalculationUtils.percentage,
      growth: StatisticalCalculations.calculateGrowthRate,
      profit: FinancialCalculations.calculateProfitMargin,
      eoq: InventoryCalculations.calculateEOQ,
    };

    const calculator = calculators[type];
    return calculator ? calculator(...args) : 0;
  },
};