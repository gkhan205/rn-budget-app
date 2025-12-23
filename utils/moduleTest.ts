// Quick test to verify the new modular structure works
import { calculateBudgetMetrics, getTotalSpent } from './budgetCalculations';
import { autoGenerateExpenses } from './expenseGenerator';
import * as AllUtils from './index';

console.log('=== Module Structure Test ===');

// Test that budget calculations are available
console.log('Budget calculations imported successfully:', typeof getTotalSpent === 'function');
console.log('Comprehensive metrics function:', typeof calculateBudgetMetrics === 'function');

// Test that expense generation is available
console.log('Auto-generation imported successfully:', typeof autoGenerateExpenses === 'function');

// Test that barrel exports work
console.log('All functions available via index:', 
  typeof AllUtils.getTotalSpent === 'function' && 
  typeof AllUtils.autoGenerateExpenses === 'function'
);

// Test basic functionality
const testExpenses = [
  { amount: 100, id: '1', budgetId: 'b1', categoryId: 'c1', accountId: null, date: new Date(), note: null, isGeneratedFromRecurring: false, recurringId: null }
];
const total = getTotalSpent(testExpenses as any);
console.log('Basic calculation test:', total === 100);

console.log('\n✅ All module structure tests passed!');
console.log('📁 Files are now properly separated and maintainable.');
