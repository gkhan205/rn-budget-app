# Budget Components Documentation

This directory contains reusable components for the budget creation functionality, following clean code principles and separation of concerns.

## Components

### OptionCard
A reusable card component for displaying options with icons, titles, subtitles, and optional right elements.

**Props:**
- `icon`: Icon name for the left side
- `iconColor`: Color of the icon
- `iconBackgroundColor`: Background color of the icon container
- `title`: Main title text
- `subtitle`: Secondary text below title
- `rightElement`: Optional React element displayed on the right
- `onPress`: Optional press handler
- `children`: Optional children to render below the header
- `colors`: Color theme object

### ToggleSwitch
A custom toggle switch component with smooth animations.

**Props:**
- `isOn`: Current toggle state
- `onToggle`: Function called when toggle is pressed
- `colors`: Color theme object containing primaryBlue and inputBackground

### DateRangePicker
A modal component for selecting date ranges with a two-step process (start date, then end date).

**Features:**
- Step-by-step date selection (start → end)
- Visual range summary with duration calculation
- Validation to ensure end date is after start date
- Native date picker integration

**Props:**
- `isVisible`: Controls modal visibility
- `onClose`: Called when modal is closed
- `onDateRangeSelect`: Called with selected start and end dates
- `initialStartDate`: Optional initial start date
- `initialEndDate`: Optional initial end date
- `colors`: Color theme object

### IncomeModal
A modal for adding/editing income with a clean numeric input interface.

**Features:**
- Large, easy-to-use numeric input
- Currency symbol display
- Auto-focus and text selection
- Keyboard handling

**Props:**
- `isVisible`: Controls modal visibility
- `onClose`: Called when modal is closed
- `onSave`: Called with the entered amount
- `currentIncome`: Current income value to pre-populate
- `colors`: Color theme object

### RecurringExpenseModal
A comprehensive modal for adding recurring expenses with name, amount, and category.

**Features:**
- Required name and amount fields with validation
- Optional category field
- Quick category suggestions
- Error handling and validation
- Keyboard-friendly layout

**Props:**
- `isVisible`: Controls modal visibility
- `onClose`: Called when modal is closed
- `onSave`: Called with the expense object (without id)
- `colors`: Color theme object

### RecurringExpenseList
A list component for displaying and managing recurring expenses.

**Features:**
- Clean expense item display with name, category, and amount
- Delete functionality for each item
- Conditional rendering (hidden when empty)

**Props:**
- `expenses`: Array of RecurringExpense objects
- `onDelete`: Function called with expense id to delete
- `colors`: Color theme object

## Custom Hook

### useBudgetForm
A custom hook that encapsulates all the business logic for budget form management.

**Features:**
- Form state management
- Validation logic
- Form submission with API integration
- Helper functions for modifying specific form sections
- Error handling

**Returns:**
- `formData`: Current form state
- `updateFormData`: Function to update any form field
- `validationErrors`: Object containing current validation errors
- `isLoading`: Loading state during form submission
- `addRecurringExpense`: Function to add a new recurring expense
- `removeRecurringExpense`: Function to remove an expense by id
- `updateIncome`: Function to update income amount
- `handleDateRangeChange`: Function to update custom date range
- `submitForm`: Function to submit the form

## Benefits

1. **Separation of Concerns**: UI components are purely presentational, business logic is in custom hooks
2. **Reusability**: All components are designed to be reused across the application
3. **Clean Code**: Each component has a single responsibility
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Maintainability**: Easy to test, modify, and extend individual components
6. **Better UX**: Improved date picker flow, better form validation, and enhanced modals

## Usage Example

```tsx
import { useBudgetForm } from '@/hooks/useBudgetForm';
import { OptionCard, IncomeModal } from '@/components/budget';

const MyComponent = () => {
  const { formData, updateIncome } = useBudgetForm();
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  return (
    <>
      <OptionCard
        icon="dollarsign"
        iconColor="#2ECC71"
        iconBackgroundColor="#2ECC7120"
        title="Income"
        subtitle={`$${formData.income}`}
        onPress={() => setShowIncomeModal(true)}
        colors={colors}
      />
      
      <IncomeModal
        isVisible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={updateIncome}
        currentIncome={formData.income}
        colors={colors}
      />
    </>
  );
};
```
