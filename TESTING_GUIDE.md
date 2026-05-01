# 🧪 Team Task Manager — Testing Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18+)
- **PostgreSQL** (running locally on port 5432)
- **npm** (comes with Node.js)

---

## Step 1: Database Setup

### 1.1 Create the PostgreSQL Database

Open a terminal or pgAdmin and create a new database:

```sql
CREATE DATABASE team_task_manager;
```

### 1.2 Configure `.env`

Open the `.env` file in the project root. Update the `DATABASE_URL` with your actual PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

> **Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 1.3 Push the Schema to the Database

```bash
cd team-task-manager
npx prisma db push
```

**Expected output:** `Your database is now in sync with your Prisma schema.`

If you want to see the database tables visually:

```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` where you can inspect all tables.

---

## Step 2: Install Dependencies & Start

```bash
npm install
npm run dev
```

**Expected output:** `▲ Next.js 16.x.x` and `Local: http://localhost:3000`

Open **http://localhost:3000** in your browser. You should be redirected to `/login`.

---

## Step 3: Testing Checklist

> Use **3 separate browser profiles** (or incognito windows) to test all 3 roles simultaneously.

---

### 🔵 TEST 1: Admin Registration (Create Workspace)

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Go to `http://localhost:3000/register` | See "How would you like to get started?" with two options |
| 2 | Click **"Create a new workspace"** | Form expands with Name, Company Name, Email, Password |
| 3 | Fill in: `Admin User` / `Test Company` / `admin@test.com` / `password123` | All fields accept input |
| 4 | Click **"Create Workspace"** | Redirects to `/dashboard` |
| 5 | Verify Admin Dashboard shows: | ✅ Check each |
|   | - "Welcome back, Admin User" heading | |
|   | - Company name "Test Company" in banner | |
|   | - An **8-character company code** (e.g., `ABCD2345`) | |
|   | - Stat cards showing 1 member, 0 projects | |
|   | - Quick links: "Manage Members" and "View All Projects" | |
| 6 | **Copy the company code** — you'll need it next | |

> **🐛 Bug check:** Does the sidebar show "Dashboard", "Projects", and "Members" links?

---

### 🟢 TEST 2: Manager Registration (Join Workspace)

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Open a **new incognito window** |  |
| 2 | Go to `/register` → Click **"Join an existing workspace"** | Form shows Name, Email, Password, Company Code |
| 3 | Fill in: `Manager User` / `manager@test.com` / `password123` / `<COMPANY_CODE>` | |
| 4 | Click **"Join Workspace"** | Redirects to `/dashboard` |
| 5 | Verify Employee Dashboard (default role is EMPLOYEE) | Shows "My Tasks" with empty state |

> **Note:** New users join as EMPLOYEE by default. We'll promote this user to MANAGER in Test 4.

---

### ⚪ TEST 3: Employee Registration

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Open **another incognito window** | |
| 2 | Go to `/register` → Join workspace | |
| 3 | Fill in: `Employee User` / `employee@test.com` / `password123` / `<COMPANY_CODE>` | |
| 4 | Click **"Join Workspace"** | Redirects to `/dashboard` |
| 5 | Verify Employee Dashboard | Shows empty "My Tasks" and no overdue alerts |

> **🐛 Bug check:** Sidebar should only show "Dashboard" and "Projects" — **no** "Members" link.

---

### 🔵 TEST 4: Admin — Manage Members

Switch back to the **Admin browser window**.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click **"Members"** in sidebar (or "Manage Members" quick link) | Members table with 3 users |
| 2 | Verify all 3 members listed | Admin User (ADMIN badge), Manager User, Employee User |
| 3 | Find "Manager User" → Click the role dropdown | Shows "Manager" and "Employee" options |
| 4 | Change role to **"Manager"** | Badge updates, page refreshes |
| 5 | Verify Admin User row has **no** dropdown or delete button | ✅ Original admin is protected |
| 6 | Verify your own row (Admin User) also has no dropdown | ✅ Cannot change own role |

> **🐛 Bug checks:**
> - Does the "Projects" column show `0` for all users?
> - Does the "Joined" column show today's date?
> - Is there a trash icon only for non-admin, non-self users?

---

### 🟢 TEST 5: Manager Dashboard (after promotion)

Switch to the **Manager browser window**.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | **Refresh the page** (the JWT still has old role — log out and log back in) | |
| 2 | Go to `/login`, enter `manager@test.com` / `password123` | |
| 3 | Verify Manager Dashboard | Shows "Manager Dashboard" subtitle |
| 4 | Verify stat cards: 0 projects, 0 to do, 0 in progress, 0 overdue | |
| 5 | Verify sidebar shows **"Dashboard"** and **"Projects"** (no "Members") | |

> **🐛 Bug check:** After re-login, does the sidebar correctly hide the "Members" link for Managers?

---

### 🟢 TEST 6: Manager — Create a Project

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click **"Projects"** in sidebar | Projects page with empty state, "Create Project" button visible |
| 2 | Click **"New Project"** | Dialog opens |
| 3 | Fill in: Name = `Website Redesign`, Description = `Redesign the company website` | |
| 4 | Click **"Create Project"** | Dialog closes, project card appears |
| 5 | Verify card shows: "Website Redesign", 1 member, 0 tasks, Owner: Manager User | |
| 6 | Click on the project card | Redirects to `/projects/<id>` detail page |

> **🐛 Bug checks:**
> - Does the "Tasks (0)" and "Members (1)" tabs appear?
> - Is the owner automatically added as a member?

---

### 🟢 TEST 7: Manager — Add Members to Project

On the project detail page:

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click **"Members"** tab | Shows Manager User as the only member |
| 2 | Click **"Add Member"** | Dialog with a dropdown of workspace members |
| 3 | Select **"Employee User"** and click "Add Member" | Employee appears in the table |
| 4 | Optionally add **"Admin User"** | Now 3 members |
| 5 | Verify the **owner (Manager User)** has no trash icon | ✅ Cannot remove owner |
| 6 | Verify other members have trash icons | |

> **🐛 Bug check:** After adding all members, does clicking "Add Member" show "All workspace members are already in this project"?

---

### 🟢 TEST 8: Manager — Create Tasks

Switch to the **"Tasks"** tab on the project detail page:

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click **"New Task"** | Dialog with Title, Description, Assignee dropdown, Due Date |
| 2 | Create Task 1: `Design Homepage` / Assignee: Employee User / Due: **yesterday's date** | Forces an overdue state |
| 3 | Create Task 2: `Build API` / Assignee: Employee User / Due: **tomorrow's date** | Normal task |
| 4 | Create Task 3: `Write Tests` / Assignee: (none) / No due date | Unassigned task |
| 5 | Verify all 3 tasks appear in the list | |
| 6 | Click the **"Overdue"** filter pill | Only "Design Homepage" should show (red border) |
| 7 | Click **"To Do"** filter | All 3 tasks show (all start as TODO) |
| 8 | Click **"All"** to reset | |

> **🐛 Bug checks:**
> - Does "Design Homepage" show a red border and "Overdue" badge?
> - Does "Build API" show a normal border?
> - Does "Write Tests" show "Unassigned" text?

---

### ⚪ TEST 9: Employee — View Dashboard & Tasks

Switch to the **Employee browser window**. Log out and log back in to refresh the JWT.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `employee@test.com` / `password123` | |
| 2 | Verify Dashboard shows: | |
|   | - Overdue alert banner with "Design Homepage" | ✅ |
|   | - "To Do" section with 2 tasks | ✅ |
|   | - "Your Projects" section with "Website Redesign" | ✅ |
| 3 | Click on **"Design Homepage"** task | Opens task detail page |

---

### ⚪ TEST 10: Employee — Task Detail & Status Change

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Verify task detail page layout: | |
|   | - Title: "Design Homepage" | |
|   | - Overdue badge visible | |
|   | - Right sidebar: Status dropdown, Assignee (Employee User), Due date (red), Project link | |
| 2 | Change Status from **"To Do"** → **"In Progress"** | Dropdown updates, page refreshes |
| 3 | Change Status to **"Done"** | Overdue badge should disappear (done tasks aren't overdue) |
| 4 | Change Status back to **"In Progress"** | Overdue badge re-appears |

> **🐛 Bug checks:**
> - Employee should **NOT** see a Delete button on the task
> - Status dropdown should be the **only** thing the employee can change
> - Breadcrumb navigation (Projects > Website Redesign > Design Homepage) should work

---

### ⚪ TEST 11: Employee — Add a Comment

Still on the task detail page:

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Type `Working on this now!` in the comment box | |
| 2 | Click the **send** button | Comment appears with Employee User avatar, name, and timestamp |
| 3 | Hover over your comment | Delete icon appears |
| 4 | Add another comment: `Almost done with the mockup` | Second comment appears below |
| 5 | Try to delete the first comment | Confirmation dialog → "Are you sure?" → Delete → Comment removed |

---

### 🟢 TEST 12: Manager — View Comments & Manage Tasks

Switch to **Manager window**, navigate to the same task:

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Go to Projects → Website Redesign → click "Design Homepage" | |
| 2 | Verify the comment from Employee User is visible | ✅ |
| 3 | Add a comment: `Looks good, keep going!` | Comment appears |
| 4 | Hover over Employee User's comment | Delete icon should **NOT** appear (Manager isn't admin or author) |
| 5 | Navigate back to project → Tasks tab | Task should show updated status |

---

### 🔵 TEST 13: Admin — Cross-Project Visibility

Switch to the **Admin window**:

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click **"Projects"** in sidebar | Should see "Website Redesign" (Admin sees ALL projects) |
| 2 | Click on the project | Full detail view with tasks and members |
| 3 | Go to Dashboard | Verify stat cards updated: 1 project, tasks counts visible |
| 4 | Verify overdue section shows "Design Homepage" (if it's not DONE) | |

> **🐛 Bug check:** Admin should be able to delete comments from any user (hover over Employee's comment → trash icon visible).

---

### 🔵 TEST 14: Admin — Delete Operations

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to any task → Click **Delete** (trash icon) | Confirmation: "permanently delete this task" |
| 2 | Cancel the dialog | Nothing happens |
| 3 | Navigate to Members → Find Employee User → Click trash icon | Confirmation: "remove Employee User from workspace" |
| 4 | Cancel | Nothing happens |
| 5 | Navigate to a project → Click **"Delete"** button in header | Confirmation: "permanently delete the project" |
| 6 | Cancel | Nothing happens |

> **⚠️ Don't actually delete** anything yet — just verify the confirmation dialogs work.

---

### 🟢 TEST 15: Manager — Delete a Task

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Go to Projects → Website Redesign → Click "Write Tests" | |
| 2 | Click the **Delete** button | Confirmation dialog appears |
| 3 | Confirm deletion | Redirects back to project page, task is gone |
| 4 | Verify Tasks tab now shows 2 tasks | |

---

### 🟢 TEST 16: Manager — Remove a Member

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Go to Members tab on the project | |
| 2 | Click trash on **Admin User** (if added earlier) | Confirmation → Confirm → Admin removed |
| 3 | Verify the members list now shows 2 members | |

---

### TEST 17: Navigation & Layout

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Click each sidebar link | Correct page loads, active link highlighted in blue |
| 2 | Resize browser to mobile width (< 768px) | Sidebar collapses, hamburger menu appears |
| 3 | Click hamburger → navigate → close | Sheet closes after navigation |
| 4 | Check breadcrumbs on task detail page | All links are clickable and navigate correctly |
| 5 | Try accessing `/members` as a Manager/Employee | Should redirect to `/dashboard` |

---

### TEST 18: Auth & Security

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Open a new incognito window → go to `/dashboard` | Redirects to `/login` |
| 2 | Go to `/projects` without being logged in | Redirects to `/login` |
| 3 | Log in → verify you stay on `/dashboard` on refresh | ✅ Session persists |
| 4 | Click **"Sign Out"** in sidebar | Redirects to `/login`, can't access `/dashboard` anymore |
| 5 | Try registering with an existing email | Error: "Email already in use" (or similar) |
| 6 | Try joining with an invalid company code | Error message appears |

---

### TEST 19: Edge Cases

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Create a project with a very long name (100 chars) | Truncated in card view |
| 2 | Create a task with no assignee and no due date | Shows "Unassigned" and "No due date" |
| 3 | Post a very long comment (2000 chars) | Wraps properly, doesn't overflow |
| 4 | Try submitting empty forms | HTML validation prevents submission |
| 5 | Double-click submit buttons rapidly | Loading state prevents duplicate submissions |

---

## Quick Reference: Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| Manager | manager@test.com | password123 |
| Employee | employee@test.com | password123 |

---

## Reporting Bugs

If you find a bug, note:
1. **Which test step** failed (e.g., "TEST 8, step 6")
2. **What you expected** vs **what happened**
3. **Browser console errors** (press F12 → Console tab)
4. **Network errors** (F12 → Network tab → look for red requests)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Verify PostgreSQL is running and `.env` credentials are correct |
| Prisma errors | Run `npx prisma db push` again |
| Blank page / hydration errors | Clear browser cache, restart `npm run dev` |
| Role changes not reflecting | Log out and log back in (JWT caches the old role) |
| Port 3000 already in use | Kill the process: `npx kill-port 3000` or use `npm run dev -- -p 3001` |
