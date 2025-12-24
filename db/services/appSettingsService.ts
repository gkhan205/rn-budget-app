import { desc, eq } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { appSettings, type AppSetting, type NewAppSetting } from '../schema/appSettings';

export class AppSettingsService {
  /**
   * Create a new setting
   */
  static async create(setting: NewAppSetting): Promise<AppSetting> {
    const db = getDrizzleDb();
    const [newSetting] = await db.insert(appSettings).values({
      ...setting,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newSetting;
  }

  /**
   * Get all settings
   */
  static async getAll(): Promise<AppSetting[]> {
    const db = getDrizzleDb();
    return await db.select().from(appSettings).orderBy(desc(appSettings.createdAt));
  }

  /**
   * Get setting by key
   */
  static async getByKey(key: string): Promise<AppSetting | null> {
    const db = getDrizzleDb();
    const [setting] = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);
    return setting || null;
  }

  /**
   * Get settings by category
   */
  static async getByCategory(category: string): Promise<AppSetting[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(appSettings)
      .where(eq(appSettings.category, category))
      .orderBy(desc(appSettings.createdAt));
  }

  /**
   * Get user settings (non-system)
   */
  static async getUserSettings(): Promise<AppSetting[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(appSettings)
      .where(eq(appSettings.isSystem, false))
      .orderBy(desc(appSettings.createdAt));
  }

  /**
   * Get system settings
   */
  static async getSystemSettings(): Promise<AppSetting[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(appSettings)
      .where(eq(appSettings.isSystem, true))
      .orderBy(desc(appSettings.createdAt));
  }

  /**
   * Update a setting
   */
  static async update(key: string, updates: Partial<NewAppSetting>): Promise<AppSetting | null> {
    const db = getDrizzleDb();
    const [updatedSetting] = await db.update(appSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.key, key))
      .returning();
    return updatedSetting || null;
  }

  /**
   * Set setting value (create or update)
   */
  static async setValue(
    key: string, 
    value: string, 
    options?: {
      type?: AppSetting['type'];
      description?: string;
      category?: string;
      isSystem?: boolean;
    }
  ): Promise<AppSetting> {
    const existingSetting = await this.getByKey(key);
    
    if (existingSetting) {
      const updated = await this.update(key, { value });
      return updated!;
    } else {
      return await this.create({
        key,
        value,
        type: options?.type || 'string',
        description: options?.description,
        category: options?.category || 'general',
        isSystem: options?.isSystem || false,
      });
    }
  }

  /**
   * Get setting value with type conversion
   */
  static async getValue<T = string>(key: string, defaultValue?: T): Promise<T | undefined> {
    const setting = await this.getByKey(key);
    
    if (!setting || !setting.value) {
      return defaultValue;
    }

    try {
      switch (setting.type) {
        case 'boolean':
          return (setting.value === 'true') as unknown as T;
        case 'number':
          return Number(setting.value) as unknown as T;
        case 'json':
          return JSON.parse(setting.value) as T;
        case 'string':
        default:
          return setting.value as unknown as T;
      }
    } catch (error) {
      console.error(`Failed to parse setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Delete a setting
   */
  static async delete(key: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(appSettings)
      .where(eq(appSettings.key, key));
    return result.changes > 0;
  }

  /**
   * Initialize default app settings
   */
  static async initializeDefaults(): Promise<AppSetting[]> {
    const defaults = [
      {
        key: 'app_version',
        value: '1.0.0',
        type: 'string' as const,
        description: 'Current app version',
        category: 'system',
        isSystem: true,
      },
      {
        key: 'currency',
        value: 'USD',
        type: 'string' as const,
        description: 'Default currency',
        category: 'general',
        isSystem: false,
      },
      {
        key: 'date_format',
        value: 'MM/DD/YYYY',
        type: 'string' as const,
        description: 'Date display format',
        category: 'appearance',
        isSystem: false,
      },
      {
        key: 'theme',
        value: 'system',
        type: 'string' as const,
        description: 'App theme (light, dark, system)',
        category: 'appearance',
        isSystem: false,
      },
      {
        key: 'notifications_enabled',
        value: 'true',
        type: 'boolean' as const,
        description: 'Enable push notifications',
        category: 'notifications',
        isSystem: false,
      },
      {
        key: 'budget_reminder_days',
        value: '7',
        type: 'number' as const,
        description: 'Days before budget period ends to show reminder',
        category: 'budgets',
        isSystem: false,
      },
      {
        key: 'recurring_expense_reminder',
        value: 'true',
        type: 'boolean' as const,
        description: 'Remind about upcoming recurring expenses',
        category: 'expenses',
        isSystem: false,
      },
    ];

    const createdSettings: AppSetting[] = [];
    
    for (const defaultSetting of defaults) {
      const existing = await this.getByKey(defaultSetting.key);
      if (!existing) {
        const created = await this.create(defaultSetting);
        createdSettings.push(created);
      } else {
        createdSettings.push(existing);
      }
    }

    return createdSettings;
  }

  /**
   * Export all settings as JSON
   */
  static async exportSettings(): Promise<Record<string, unknown>> {
    const allSettings = await this.getAll();
    const exported: Record<string, unknown> = {};
    
    for (const setting of allSettings) {
      const value = await this.getValue(setting.key);
      exported[setting.key] = value;
    }
    
    return exported;
  }

  /**
   * Import settings from JSON
   */
  static async importSettings(settingsData: Record<string, unknown>): Promise<AppSetting[]> {
    const importedSettings: AppSetting[] = [];
    
    for (const [key, value] of Object.entries(settingsData)) {
      let stringValue = String(value);
      let type: AppSetting['type'] = 'string';
      
      if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'object' && value !== null) {
        type = 'json';
        stringValue = JSON.stringify(value);
      }
      
      const setting = await this.setValue(key, stringValue, { type });
      importedSettings.push(setting);
    }
    
    return importedSettings;
  }
}
