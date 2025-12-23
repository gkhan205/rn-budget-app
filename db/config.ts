import Realm from 'realm';
import { Budget } from './models/Budget';
import { Expense } from './models/Expense';
import { RecurringExpense } from './models/RecurringExpense';

export const realmConfig: Realm.Configuration = {
  schema: [Budget, RecurringExpense, Expense],
  schemaVersion: 3,
  onMigration: (oldRealm: Realm, newRealm: Realm) => {
    // Handle migrations when schema changes
    console.log('Migrating database from version', oldRealm.schemaVersion, 'to', newRealm.schemaVersion);
  },
};

export const getRealm = (): Promise<Realm> => {
  return Realm.open(realmConfig);
};

export default realmConfig;
