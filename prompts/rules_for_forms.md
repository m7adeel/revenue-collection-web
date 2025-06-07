# Form Design Rules and Guidelines

## Reference Number Generation (When Applicable)
- Format: `[PREFIX]-XXXXXX-XXX`
  - `[PREFIX]`: Context-specific prefix (e.g., INV for invoices)
  - `XXXXXX`: Last 6 digits of current timestamp
  - `XXX`: Random 3-digit number
- Auto-generated when form opens
- Can be regenerated using refresh button
- Displayed in monospace font for better readability
- Read-only field (cannot be manually edited)

## Form Layouts

### Create Form Modal (Two-Column Layout)
1. Left Column - Basic Information
   - Primary identifier (auto-generated if applicable)
   - Core fields (with validation)
   - Status/State (if applicable)
   - Required fields

2. Right Column - Related Information
   - Relationship fields (e.g., foreign keys)
   - Additional details
   - Optional fields

### Edit Form Modal (Three-Column Layout)
1. Left Column - Basic Information
   - Primary identifier (read-only)
   - Core fields (editable with validation)
   - Status/State (editable if applicable)

2. Middle Column - Related Information
   - Relationship fields (read-only)
   - Additional details (editable)

3. Right Column - Audit Information
   - Created By (read-only)
   - Created Date (read-only)
   - Last Modified (read-only)

### View Form Modal (Three-Column Layout)
1. Left Column - Basic Information
   - Primary identifier (monospace font)
   - Core values (emphasized)
   - Status/State (with badge)

2. Middle Column - Related Information
   - Relationship details
   - Additional information (with light gray background)

3. Right Column - Audit Information
   - Created By (with contact info if available)
   - Created Date
   - Last Modified

## Validation Rules
1. Required Fields
   - Clear indication of required fields
   - Validation on blur and submit
   - Appropriate error messages
   - Field-specific validation rules

2. Data Validation
   - Type checking
   - Range validation
   - Format validation
   - Business rule validation

3. Relationship Validation
   - Foreign key validation
   - Dependency validation
   - Cross-field validation

## UI/UX Guidelines
1. Form Fields
   - Clear section headers
   - Proper spacing between fields
   - Visual distinction between editable and read-only fields
   - Consistent label styling
   - Error states for validation
   - Loading states for async operations

2. Visual Hierarchy
   - Important information in larger/bolder text
   - Status indicators for quick identification
   - Monospace font for identifiers
   - Light gray background for read-only fields
   - Proper spacing and padding

3. Error Handling
   - Clear error messages
   - Visual indication of error states
   - Error messages clear on user input
   - Loading states during submission

4. Accessibility
   - Proper labels for all fields
   - Clear focus states
   - Sufficient color contrast
   - Proper ARIA attributes
   - Keyboard navigation support

## Data Types
1. Common Types
   - String (text, identifiers)
   - Number (integers, decimals)
   - Date/DateTime
   - Boolean
   - Enum/Status
   - Relationships (IDs)

2. Type Handling
   - Proper type conversion
   - Format validation
   - Null/undefined handling
   - Default values

## State Management
1. Form Data
   - Initialize with default values
   - Handle changes with proper validation
   - Clear errors on user input
   - Track submission state
   - Handle form reset

2. Loading States
   - Show loading indicator during submission
   - Disable submit button while processing
   - Handle success/error states
   - Progress indicators for long operations

## API Integration
1. Create Operation
   - Send all required fields
   - Handle response and errors
   - Update local state on success
   - Handle optimistic updates

2. Edit Operation
   - Send only modified fields
   - Handle response and errors
   - Update local state on success
   - Handle conflict resolution

3. View Operation
   - Display all entity details
   - Format data appropriately
   - Show related information
   - Handle loading states

## Best Practices
1. Form Design
   - Keep forms focused and concise
   - Group related fields
   - Use appropriate input types
   - Provide clear instructions

2. User Experience
   - Progressive disclosure
   - Smart defaults
   - Auto-save when appropriate
   - Undo/redo support

3. Performance
   - Lazy loading of options
   - Debounced validation
   - Optimized re-renders
   - Efficient state updates

4. Security
   - Input sanitization
   - CSRF protection
   - Rate limiting
   - Proper authorization checks 