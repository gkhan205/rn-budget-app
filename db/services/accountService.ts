import { and, desc, eq } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { accounts, type Account, type NewAccount } from '../schema/accounts';

export class AccountService {
  /**
   * Create a new account
   */
  static async create(account: NewAccount): Promise<Account> {
    const db = getDrizzleDb();
    const [newAccount] = await db.insert(accounts).values({
      ...account,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newAccount;
  }

  /**
   * Get all accounts
   */
  static async getAll(): Promise<Account[]> {
    const db = getDrizzleDb();
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  /**
   * Get active (non-archived) accounts
   */
  static async getActive(): Promise<Account[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(accounts)
      .where(and(eq(accounts.isActive, true), eq(accounts.isArchived, false)))
      .orderBy(desc(accounts.createdAt));
  }

  /**
   * Get account by ID
   */
  static async getById(id: string): Promise<Account | null> {
    const db = getDrizzleDb();
    const [account] = await db.select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    return account || null;
  }

  /**
   * Get accounts by type
   */
  static async getByType(type: Account['type']): Promise<Account[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(accounts)
      .where(and(eq(accounts.type, type), eq(accounts.isActive, true)))
      .orderBy(desc(accounts.createdAt));
  }

  /**
   * Update an account
   */
  static async update(id: string, updates: Partial<NewAccount>): Promise<Account | null> {
    const db = getDrizzleDb();
    const [updatedAccount] = await db.update(accounts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || null;
  }

  /**
   * Update account balance
   */
  static async updateBalance(id: string, newBalance: number): Promise<Account | null> {
    const db = getDrizzleDb();
    const [updatedAccount] = await db.update(accounts)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || null;
  }

  /**
   * Archive an account (soft delete)
   */
  static async archive(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [archivedAccount] = await db.update(accounts)
      .set({
        isArchived: true,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();
    return !!archivedAccount;
  }

  /**
   * Activate/deactivate an account
   */
  static async setActive(id: string, isActive: boolean): Promise<boolean> {
    const db = getDrizzleDb();
    const [updatedAccount] = await db.update(accounts)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();
    return !!updatedAccount;
  }

  /**
   * Permanently delete an account
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(accounts)
      .where(eq(accounts.id, id));
    return result.changes > 0;
  }

  /**
   * Get total balance across all active accounts
   */
  static async getTotalBalance(): Promise<number> {
    const activeAccounts = await this.getActive();
    return activeAccounts.reduce((total, account) => total + account.balance, 0);
  }

  /**
   * Get total balance by account type
   */
  static async getTotalBalanceByType(type: Account['type']): Promise<number> {
    const typeAccounts = await this.getByType(type);
    return typeAccounts.reduce((total, account) => total + account.balance, 0);
  }
}
