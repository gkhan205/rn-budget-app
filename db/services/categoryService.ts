import { and, asc, eq, isNull } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { categories, type Category, type NewCategory } from '../schema/categories';

export class CategoryService {
  /**
   * Create a new category
   */
  static async create(category: NewCategory): Promise<Category> {
    const db = getDrizzleDb();
    const [newCategory] = await db.insert(categories).values({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newCategory;
  }

  /**
   * Get all categories
   */
  static async getAll(): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Get active categories
   */
  static async getActive(): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<Category | null> {
    const db = getDrizzleDb();
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category || null;
  }

  /**
   * Get categories by type
   */
  static async getByType(type: Category['type']): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(categories)
      .where(and(eq(categories.type, type), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Get top-level categories (no parent)
   */
  static async getTopLevel(): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(categories)
      .where(and(isNull(categories.parentId), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Get subcategories for a parent category
   */
  static async getSubcategories(parentId: string): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(categories)
      .where(and(eq(categories.parentId, parentId), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Get default categories
   */
  static async getDefaults(): Promise<Category[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(categories)
      .where(and(eq(categories.isDefault, true), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  /**
   * Update a category
   */
  static async update(id: string, updates: Partial<NewCategory>): Promise<Category | null> {
    const db = getDrizzleDb();
    const [updatedCategory] = await db.update(categories)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || null;
  }

  /**
   * Deactivate a category
   */
  static async deactivate(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [deactivatedCategory] = await db.update(categories)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    return !!deactivatedCategory;
  }

  /**
   * Permanently delete a category
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(categories)
      .where(eq(categories.id, id));
    return result.changes > 0;
  }

  /**
   * Update sort order for categories
   */
  static async updateSortOrder(categoryUpdates: { id: string; sortOrder: number }[]): Promise<void> {
    const db = getDrizzleDb();
    
    for (const update of categoryUpdates) {
      await db.update(categories)
        .set({
          sortOrder: update.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, update.id));
    }
  }

  /**
   * Create default expense categories
   */
  static async createDefaults(): Promise<Category[]> {
    const defaultCategories = [
      { name: 'Food & Dining', icon: '🍕', color: '#FF9800', type: 'expense' as const },
      { name: 'Transportation', icon: '🚗', color: '#2196F3', type: 'expense' as const },
      { name: 'Shopping', icon: '🛒', color: '#9C27B0', type: 'expense' as const },
      { name: 'Entertainment', icon: '🎬', color: '#E91E63', type: 'expense' as const },
      { name: 'Bills & Utilities', icon: '⚡', color: '#FF5722', type: 'expense' as const },
      { name: 'Healthcare', icon: '🏥', color: '#009688', type: 'expense' as const },
      { name: 'Travel', icon: '✈️', color: '#607D8B', type: 'expense' as const },
      { name: 'Education', icon: '📚', color: '#795548', type: 'expense' as const },
      { name: 'Income', icon: '💰', color: '#4CAF50', type: 'income' as const },
      { name: 'Other', icon: '📂', color: '#9E9E9E', type: 'both' as const },
    ];

    const createdCategories: Category[] = [];
    
    for (let i = 0; i < defaultCategories.length; i++) {
      const category = await this.create({
        ...defaultCategories[i],
        isDefault: true,
        sortOrder: i,
      });
      createdCategories.push(category);
    }

    return createdCategories;
  }
}
