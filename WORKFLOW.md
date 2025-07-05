
# 📌 WORKFLOW.md

## Charnoks POS System - User Workflows

This document outlines the step-by-step workflows for each user role in the Charnoks Point of Sale system, mapping each action to the actual backend functions and API endpoints.

---

## 🔐 Authentication Workflows

### User Registration
1. **Access registration page** → `/register` route
2. **Fill registration form** → Frontend validation with `zodResolver(registerSchema)`
3. **Submit form** → `firebase.auth().createUserWithEmailAndPassword(email, password)`
4. **Set user role** → `firestore.collection("users").doc(user.uid).set({ email, role, createdAt })`
5. **Redirect to dashboard** → Role-based routing

### User Login
1. **Access login page** → `/login` route
2. **Enter credentials** → Frontend validation with `zodResolver(loginSchema)`
3. **Submit login** → `firebase.auth().signInWithEmailAndPassword(email, password)`
4. **Load user profile** → `firestore.collection("users").doc(user.uid).get()`
5. **Role-based redirect** → Dashboard based on user.role

---

## 👷 Worker Workflows

### Record a Sale
1. **Login** → `firebase.auth().signInWithEmailAndPassword(email, password)`
2. **Navigate to Sales** → `/sales` route
3. **Load available products** → `firestore.collection("products").get()` (filters stock > 0)
4. **Select products** → Frontend cart management
5. **Adjust quantities** → Frontend validation against product.stock
6. **Process sale** → `firestore.collection("sales").add(saleData)`
   - Sale data includes: `{ items, total, timestamp, workerEmail, workerId }`
7. **Show confirmation** → Toast notification with total amount

### Record an Expense
1. **Navigate to Expenses** → `/expenses` route
2. **Fill expense form** → Frontend validation with expense schema
3. **Submit expense** → `firestore.collection("expenses").add(expenseData)`
   - Expense data: `{ amount, description, category, timestamp, workerEmail, workerId }`
4. **View confirmation** → Updated expenses list

### View Sales History
1. **Navigate to Sales** → `/sales` route
2. **Click "View History"** → Load worker's sales
3. **Fetch sales data** → `firestore.collection("sales").where("workerId", "==", user.uid).get()`
4. **Display filtered results** → Paginated table view

---

## 👨‍💼 Owner Workflows

### Add New Product
1. **Login as owner** → Role verification in `RoleBasedRoute`
2. **Navigate to Products** → `/products` route (owner-only)
3. **Click "Add Product"** → Open product dialog
4. **Fill product form** → Frontend validation with `zodResolver(productSchema)`
5. **Upload image (optional)** → Firebase Storage upload via `ImageUpload` component
6. **Submit product** → `firestore.collection("products").add(productData)`
   - Product data: `{ name, price, stock, category, imageUrl, description, isActive, createdAt }`
7. **Reload products list** → Updated inventory display

### Edit Product
1. **Navigate to Products** → `/products` route
2. **Click edit button** → Load product data into form
3. **Modify fields** → Frontend validation
4. **Submit changes** → `firestore.collection("products").doc(productId).update(updateData)`
5. **Refresh inventory** → Updated product list

### Delete Product
1. **Navigate to Products** → `/products` route
2. **Click delete button** → Confirmation dialog
3. **Confirm deletion** → `firestore.collection("products").doc(productId).delete()`
4. **Update display** → Removed from inventory

### View All Transactions
1. **Navigate to Transactions** → `/transactions` route (owner-only)
2. **Load all data** → Multiple Firestore queries:
   - `firestore.collection("sales").orderBy("timestamp", "desc").get()`
   - `firestore.collection("expenses").orderBy("timestamp", "desc").get()`
3. **Filter by worker** → Client-side filtering by workerId
4. **View details** → Drill-down to individual transaction data

### Create Worker Account
1. **Navigate to Settings** → `/settings` route
2. **Click "Add Worker"** → Open worker creation dialog
3. **Fill worker details** → Email and temporary password
4. **Submit form** → `firebase.auth().createUserWithEmailAndPassword(email, tempPassword)`
5. **Set worker role** → `firestore.collection("users").doc(newUser.uid).set({ email, role: "worker" })`
6. **Send credentials** → Display temporary login info

### Data Analysis
1. **Navigate to Analysis** → `/analysis` route (owner-only)
2. **Select analysis mode**:
   - **All Workers Data** → Aggregate all sales/expenses
   - **Compare Workers** → Side-by-side worker performance
   - **Individual Worker** → Single worker deep-dive
3. **Load analytics data** → Complex Firestore queries:
   - Sales aggregation by worker/date
   - Expense categorization
   - Revenue calculations
4. **Display charts** → Interactive Bar, Area, and Pie charts

---

## 🛠️ Technical Implementation Notes

### Database Structure (Firestore)
- **users**: `{ email, role, createdAt, updatedAt }`
- **products**: `{ name, price, stock, category, imageUrl, description, isActive, createdAt, updatedAt }`
- **sales**: `{ items[], total, timestamp, workerEmail, workerId }`
- **expenses**: `{ amount, description, category, timestamp, workerEmail, workerId }`

### Offline Support
- **Local Storage Fallback** → `LocalStorageDB` class for offline operations
- **Sync Strategy** → `OfflineState.hasFirebaseAccess()` detection
- **Hybrid Storage** → Automatic fallback between Firebase and localStorage

### Role-Based Access Control
- **Route Protection** → `RoleBasedRoute` component with allowedRoles prop
- **Frontend Validation** → Role checking in navigation components
- **Backend Security** → ⚠️ Note: No server-side route protection implemented

### API Endpoints Status
⚠️ **Server Routes Not Connected**: The application primarily uses Firebase/Firestore directly from the frontend. The Express server routes in `server/routes.ts` exist but are not utilized by the React frontend.

### Missing Workflows
⚠️ **Incomplete Features**:
- Server-side API integration not implemented
- No email notifications for worker account creation
- No inventory alerts for low stock
- No receipt printing functionality

---

## 🔄 Data Flow Summary

1. **Authentication** → Firebase Auth
2. **Data Storage** → Firestore Collections
3. **File Storage** → Firebase Storage (images)
4. **Offline Mode** → localStorage backup
5. **Role Management** → Frontend-only role checking
6. **Real-time Updates** → Manual refresh (no real-time listeners)

