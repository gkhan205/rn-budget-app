#!/usr/bin/env node
/**
 * Database Setup Script
 * 
 * This script sets up the database with Drizzle ORM and creates sample data.
 * Run with: node scripts/setup-database.js
 */

const { initializeDrizzle, DrizzleMigration, db } = require('../db/drizzle-helper');

async function setupDatabase() {
  console.log('🚀 Setting up database with Drizzle ORM...');
  
  try {
    // Initialize Drizzle ORM
    await initializeDrizzle();
    
    // Check if Drizzle is ready
    const isReady = await DrizzleMigration.isReady();
    if (!isReady) {
      throw new Error('Drizzle ORM is not ready');
    }
    
    console.log('✅ Database setup completed successfully!');
    
    // Optional: Create sample data for development
    if (process.argv.includes('--sample-data')) {
      await createSampleData();
    }
    
    console.log('🎉 Database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  console.log('📝 Creating sample data...');
  
  try {
    // Create sample budget
    const budget = await db.budgets.create({
      name: 'Monthly Expenses',
      icon: '💰',
      color: '#2196F3',
      limitAmount: 1000.0,
      periodType: 'monthly',
      startDate: new Date(),
      endDate: null,
      isArchived: false,
    });
    
    // Create sample expenses
    await db.expenses.create({
      budgetId: budget.id,
      amount: 85.50,
      description: 'Grocery shopping at Target',
      date: new Date(),
      category: 'Food',
      isRecurring: false,
    });
    
    await db.expenses.create({
      budgetId: budget.id,
      amount: 12.99,
      description: 'Netflix subscription',
      date: new Date(),
      category: 'Entertainment',
      isRecurring: true,
    });
    
    // Create sample recurring expense
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    await db.recurringExpenses.create({
      budgetId: budget.id,
      name: 'Internet Bill',
      amount: 59.99,
      frequency: 'monthly',
      nextDueDate: nextMonth,
      category: 'Utilities',
      description: 'Monthly internet service',
      isActive: true,
    });
    
    console.log('✅ Sample data created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createSampleData };
