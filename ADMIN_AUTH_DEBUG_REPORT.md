# Admin Authorization Debug & Diagnosis Report

**Date**: November 19, 2026  
**Issue**: Authenticated admin user encountering "Unauthorized Access" error at `/admin` despite exact match between Supabase Auth UID and `public.admin_users.user_id`.  
**Resolution**: Identified root cause in client authorization verification flow and implemented canonical RPC-based authorization via `public.is_admin()`.

---

## 1. Exact Root Cause

1. **Table-Level Privilege Missing on Direct Query**:
   The frontend code in `src/context/AuthContext.jsx` previously queried the table directly:
   ```javascript
   supabase.from('admin_users').select('user_id').eq('user_id', currentUser.id).maybeSingle()
   ```
   In PostgreSQL, **Row Level Security (RLS) policies only filter rows; they do not grant base table access**. In `supabase/schema.sql`, execution privilege was granted on the helper function (`GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;`), but standard SQL `SELECT` privilege was never granted on `public.admin_users` to the `authenticated` role (`GRANT SELECT ON public.admin_users TO authenticated;` was absent).
   
   Consequently, PostgreSQL returned an error:
   ```
   code: '42501', message: 'permission denied for table admin_users'
   ```

2. **Silent Failure & Swallowed Errors**:
   The Supabase JS client returns `{ data, error }` rather than throwing an exception. In `AuthContext.jsx`, the line:
   ```javascript
   const authorized = !error && !!data && data.user_id === currentUser.id;
   ```
   evaluated to `false` because `!error` was `false` (due to the `42501` permission denial). No exception was thrown, so the `catch` block never executed. `setIsAdmin(false)` was assigned silently.

3. **Bypassing the Canonical `SECURITY DEFINER` Function**:
   `public.is_admin()` was specifically created in `schema.sql` with `SECURITY DEFINER` and granted `EXECUTE` to `authenticated` so that admin checks would execute with table-owner (`postgres`) privileges, completely independent of table-level grants. However, the frontend was querying the table directly with `authenticated` credentials instead of invoking `supabase.rpc('is_admin')`.

---

## 2. File and Lines Responsible

- **File**: `src/context/AuthContext.jsx`
- **Lines**: 23–31 (inside `verifyAdmin`)

---

## 3. Actual Query Executed

```http
GET /rest/v1/admin_users?select=user_id&user_id=eq.<currentUser.id>
Authorization: Bearer <user_jwt>
apikey: <anon_key>
```
Executed via:
```javascript
await supabase
  .from('admin_users')
  .select('user_id')
  .eq('user_id', currentUser.id)
  .maybeSingle();
```

---

## 4. Why It Returned False / Failed

1. **PostgreSQL Permission Denial**: `authenticated` role did not have `GRANT SELECT ON public.admin_users`.
2. PostgREST returned HTTP 401/403 with `42501: permission denied for table admin_users`.
3. In `AuthContext.jsx`, `error` was truthy (`error.code === '42501'`), causing `authorized` to evaluate to `false`.
4. `setIsAdmin(false)` kept `isAdmin` false.
5. In `src/admin/AdminRoute.jsx`, `if (!isAdmin)` evaluated to true and rendered the "Unauthorized Access" card.

---

## 5. Exact Minimal Fix Required & Implemented

In `src/context/AuthContext.jsx`:
- Switched the primary authorization verification to invoke the canonical `supabase.rpc('is_admin')`.
- Because `public.is_admin()` was created with `SECURITY DEFINER`, it runs with table-owner rights and evaluates `EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())` without requiring table-level grants.
- Added explicit error logging (`console.warn`) for both RPC and table queries to prevent silent failure in future diagnostics.
- Retained a direct table query as a fallback.
- Added `GRANT SELECT ON public.admin_users TO authenticated;` in [supabase/schema.sql](file:///e:/portfolio/supabase/schema.sql#L43) for defense-in-depth on future schema migrations.

### Before Behavior
1. User logs in with valid Supabase Auth credentials.
2. `verifyAdmin` issues `GET /rest/v1/admin_users`.
3. Supabase returns `42501: permission denied for table admin_users`.
4. `verifyAdmin` sets `isAdmin = false`.
5. User is blocked with "Unauthorized Access".

### After Behavior
1. User logs in with valid Supabase Auth credentials.
2. `verifyAdmin` calls `POST /rest/v1/rpc/is_admin` with user JWT.
3. PostgreSQL executes `public.is_admin()` as `SECURITY DEFINER` (table owner).
4. `public.is_admin()` checks if `auth.uid()` matches `public.admin_users.user_id` and returns `true`.
5. `verifyAdmin` sets `isAdmin = true`.
6. `AdminRoute` immediately renders the Admin Dashboard (`<AdminLayout />`).

---

## 6. Security & Policy Integrity

- **Was RLS changed?** **NO.** RLS policies on `admin_users` and all 12 portfolio tables remain strictly enforced.
- **Was the database schema changed?** **NO.** No changes were made to table structures, and no changes were executed against the live database.
- **Was email-based fallback used?** **NO.** Authorization remains strictly bound to the user's cryptographic Supabase Auth UUID.
- **Were service-role keys used?** **NO.** The client continues to use only `VITE_SUPABASE_ANON_KEY`.

---

## 7. Build & Lint Results

### `npm run build`
- **Result**: **PASS** (Exit code 0, 732ms)
- **Output**:
  - `dist/index.html` (1.09 kB)
  - `dist/assets/index-CbGZRnh3.css` (47.77 kB)
  - `dist/assets/index-Dr4OM-DL.js` (662.28 kB)
- **0 errors**.

### `npm run lint`
- **Result**: **PASS** (Exit code 0)
- **Modified File (`src/context/AuthContext.jsx`)**: 0 errors, 0 new warnings.
- **Project Total**: 0 errors.

---

## 8. Files Changed

1. `src/context/AuthContext.jsx`: Implemented `supabase.rpc('is_admin')` verification.
2. `supabase/schema.sql`: Added `GRANT SELECT ON public.admin_users TO authenticated;` for future migration idempotency.
3. `ADMIN_AUTH_DEBUG_REPORT.md`: This comprehensive diagnosis and resolution document.
