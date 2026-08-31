import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default database records...');

  // Default Categories
  const defaultCategories = [
    { name: 'Housing & Utilities', icon: 'home', color: '#2563eb', type: 'EXPENSE' },
    { name: 'Food & Dining', icon: 'utensils', color: '#ef4444', type: 'EXPENSE' },
    { name: 'Transportation', icon: 'car', color: '#2563eb', type: 'EXPENSE' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#2563eb', type: 'EXPENSE' },
    { name: 'Entertainment', icon: 'film', color: '#2563eb', type: 'EXPENSE' },
    { name: 'Bills & Subscriptions', icon: 'zap', color: '#2563eb', type: 'EXPENSE' },
    { name: 'Software', icon: 'code', color: '#8b5cf6', type: 'EXPENSE' },
    { name: 'Groceries', icon: 'shopping-cart', color: '#10b981', type: 'EXPENSE' },
    { name: 'Salary', icon: 'trending-up', color: '#10b981', type: 'INCOME' },
    { name: 'Freelance', icon: 'briefcase', color: '#06b6d4', type: 'INCOME' }
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null }
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  // Demo User
  const demoEmail = 'alex@financeflow.com';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    demoUser = await prisma.user.create({
      data: {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: demoEmail,
        passwordHash,
        phone: '+1 (555) 000-1234',
        timezone: 'Pacific Standard Time (PST)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        plan: 'Premium'
      }
    });
    console.log(`Created demo user: ${demoEmail} (Password: password123)`);

    // Seed Demo Transactions
    const groceriesCategory = await prisma.category.findFirst({ where: { name: 'Groceries' } });
    const softwareCategory = await prisma.category.findFirst({ where: { name: 'Software' } });
    const diningCategory = await prisma.category.findFirst({ where: { name: 'Food & Dining' } });
    const transportCategory = await prisma.category.findFirst({ where: { name: 'Transportation' } });
    const housingCategory = await prisma.category.findFirst({ where: { name: 'Housing & Utilities' } });
    const salaryCategory = await prisma.category.findFirst({ where: { name: 'Salary' } });

    await prisma.expense.createMany({
      data: [
        { userId: demoUser.id, categoryId: groceriesCategory?.id, merchant: 'Whole Foods Market', note: 'Weekly Grocery Shopping', amount: 142.50, date: new Date('2024-05-24'), status: 'COMPLETED', flag: 'RECURRING' },
        { userId: demoUser.id, categoryId: softwareCategory?.id, merchant: 'Amazon Web Services', note: 'Monthly Cloud Subscription', amount: 29.00, date: new Date('2024-05-23'), status: 'COMPLETED', flag: 'RECURRING' },
        { userId: demoUser.id, categoryId: diningCategory?.id, merchant: 'The Daily Grind', note: 'Team Lunch Meeting', amount: 85.20, date: new Date('2024-05-22'), status: 'PENDING', flag: 'ONE_TIME' },
        { userId: demoUser.id, categoryId: transportCategory?.id, merchant: 'Shell Station', note: 'Fuel for Commute', amount: 60.00, date: new Date('2024-05-21'), status: 'COMPLETED', flag: 'ONE_TIME' },
        { userId: demoUser.id, categoryId: housingCategory?.id, merchant: 'House Rent', note: 'Apartment rent', amount: 2100.00, date: new Date('2024-05-20'), status: 'PENDING', flag: 'RECURRING' }
      ]
    });

    await prisma.income.createMany({
      data: [
        { userId: demoUser.id, categoryId: salaryCategory?.id, source: 'Monthly Salary', note: 'Employment Income', amount: 6500.00, date: new Date('2024-05-23'), status: 'COMPLETED' },
        { userId: demoUser.id, source: 'Freelance Project', note: 'UI Design Services', amount: 850.00, date: new Date('2024-05-18'), status: 'COMPLETED' }
      ]
    });

    // Seed Savings Goals
    await prisma.savingsGoal.createMany({
      data: [
        { userId: demoUser.id, title: 'Summer Vacation', category: 'TRAVEL', icon: 'plane', targetAmount: 5000, currentAmount: 3750, deadline: new Date('2024-08-15') },
        { userId: demoUser.id, title: 'Emergency Fund', category: 'SECURITY', icon: 'shield', targetAmount: 15000, currentAmount: 12000, deadline: new Date('2024-12-31') },
        { userId: demoUser.id, title: 'Home Downpayment', category: 'PROPERTY', icon: 'home', targetAmount: 80000, currentAmount: 42000, deadline: new Date('2025-06-10') },
        { userId: demoUser.id, title: 'Tesla Model 3', category: 'AUTOMOBILE', icon: 'car', targetAmount: 45000, currentAmount: 18500, deadline: new Date('2025-10-22') }
      ]
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
