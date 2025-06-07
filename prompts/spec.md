## Collector Management Component Specification

## Overview
The Collector Management Component is responsible for handling all aspects of collector creation, tracking, management, and reporting. This document outlines the implementation plan and technical specifications.

## Database Schema

### Collector Table
```sql
create table public.user (
  id uuid not null default gen_random_uuid (),
  active boolean not null default true,
  first_name text null,
  last_name text null,
  phone text null,
  profile text null,
  default_payment_method text null,
  created_by uuid null default auth.uid (),
  created_date timestamp with time zone not null,
  last_modified_by uuid null default auth.uid (),
  last_modified_date timestamp with time zone null,
  user_auth_id uuid not null,
  constraint user_pkey primary key (id),
  constraint user_user_auth_id_fkey foreign KEY (user_auth_id) references auth.users (id)
) TABLESPACE pg_default;
```

## Backend API Endpoints

### 1. Collector Management
- `POST /api/collectors` - Create new collector
  - Required fields: first_name, last_name, user_auth_id
  - Optional fields: phone, profile, default_payment_method
  - Backend process:
    1. Create Supabase Auth user
    2. Create collector record in user table
    3. Link auth user with collector record
- `GET /api/collectors` - List all collectors (with pagination and filtering)
  - Filter by: active, first_name, last_name
  - Sort by: first_name, last_name, created_date
- `GET /api/collectors/:id` - Get collector details
- `PUT /api/collectors/:id` - Update collector information
- `DELETE /api/collectors/:id` - Soft delete collector (set active to false)

### 2. Auth Management
- `POST /api/auth/register` - Register new collector
  - Required fields: email, password, first_name, last_name
  - Optional fields: phone, profile
  - Backend process:
    1. Validate input data
    2. Create Supabase Auth user
    3. Create collector record
    4. Return auth token and user data
- `POST /api/auth/login` - Login collector
  - Required fields: email, password
  - Returns: auth token and user data
- `POST /api/auth/logout` - Logout collector
- `POST /api/auth/reset-password` - Reset password
  - Required fields: email
- `POST /api/auth/change-password` - Change password
  - Required fields: current_password, new_password

## Frontend Components

### 1. Collector Dashboard
- Header section:
  - Page title "Collector Management"
  - Add New Collector button
  - Search bar
  - Filter dropdowns
- Main content:
  - Statistics cards:
    - Total active collectors
    - New collectors this month
    - Recently active collectors
  - Collector list table with columns:
    - Full Name
    - Phone
    - Status (Active/Inactive)
    - Created Date
    - Last Modified Date
    - Actions (Edit, Deactivate)
  - Pagination controls
  - Bulk actions menu

### 2. Collector Creation Form
- Modal dialog with:
  - Form fields:
    - Personal Information (first_name, last_name, phone)
    - Authentication (email, password)
    - Profile Information (profile)
    - Payment Settings (default_payment_method)
  - Validation rules
  - Error handling
  - Success notifications

### 3. Collector Detail View
- Collector information display
- Edit functionality
- Profile information
- Payment settings
- Activity history
- Status management

## Implementation Steps

### Phase 1: Core Infrastructure
1. Set up database tables and relationships
2. Implement basic CRUD operations
3. Create API endpoints for basic operations
4. Set up validation and error handling
5. Implement Supabase Auth integration

### Phase 2: Frontend Development
1. Create collector dashboard layout
2. Implement collector creation form component
3. Develop collector list view with pagination
4. Add search and filter functionality
5. Implement collector detail view

## Security Considerations
1. Input validation for all fields
2. Role-based access control
3. Audit logging for all operations
4. Data encryption for sensitive information
5. Integration with Supabase Auth
6. Password hashing and security
7. Session management
8. Rate limiting for auth endpoints

## Dependencies
1. UUID generation library
2. Form validation library
3. Date/time handling library
4. Database ORM/query builder
5. Supabase Auth client
6. JWT handling library
7. Password hashing library

## Success Criteria
1. All CRUD operations working correctly
2. Successful integration with Supabase Auth
3. All tests passing
4. Documentation complete
5. Dashboard UI responsive and user-friendly
6. Authentication flow working seamlessly 