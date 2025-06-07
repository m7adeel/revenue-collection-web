
const PROPERTY_TYPES = [
    'House',
    'Apartment',
    'Commercial',
    'Other'
] as const;

const PAYMENT_TYPES = [
    'Rates',
    'License',
    'Tax',
    'Other'
]

const PAYMENT_METHODS = [
    'Mobile Money',
    'Bank Transfer',
    'Cash',
    'Other'
] as const;

const BUSINESS_TYPES = [
    'Agricultural Produce',
    'Electronics', 
    'Entertainment', 
    "Food & Beverage", 
    'Manufacturing', 
    'Media', 
    'Retail', 
    'Technology', 
    'Transportation', 
    'Other'
]

const INVOICE_STATUS = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    PARTIALLY_PAID: 'partially_paid'
}

const DB_SYNC_STATUS = {
    PENDING: 'pending',
    SYNCED: 'synced',
    CONFLICTED: 'conflicted',
}

export {
    PAYMENT_METHODS,
    BUSINESS_TYPES,
    INVOICE_STATUS,
    PROPERTY_TYPES,
    DB_SYNC_STATUS
}