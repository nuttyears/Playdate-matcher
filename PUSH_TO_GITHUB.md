# Push Your Cursor Updates to GitHub

Follow these steps to get your local changes to the **nuttyears/Playdate-matcher** repo.

---

## 1. Open Terminal in Project Folder

In Cursor: **Terminal → New Terminal**, or open Terminal.app and run:

```bash
cd "/Users/sallyt/Downloads/Project Playdate Matcher"
```

---

## 2. Check If Git Is Set Up

Run:

```bash
git status
```

- **If you see "not a git repository"**: Go to **Step 3 (First-time setup)**.
- **If you see branch name and file list**: Go to **Step 4 (Commit and push)**.

---

## 3. First-Time Setup (only if no git repo yet)

Run these once:

```bash
git init
git remote add origin https://github.com/nuttyears/Playdate-matcher.git
```

---

## 4. Stage, Commit, and Push

**Stage all changes:**

```bash
git add .
```

**See what will be committed:**

```bash
git status
```

**Commit with a message:**

```bash
git commit -m "Update Playdate Matcher: profile, reminders, backend docs"
```

**Push to GitHub (requires authentication):**

```bash
git push -u origin main
```

If the branch is named `master` instead of `main`:

```bash
git push -u origin master
```

---

## 5. If Push Asks for Login

GitHub no longer accepts account passwords for push. Use one of these:

### Option A: Personal Access Token (recommended)

1. In GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. **Generate new token**, name it (e.g. "Playdate Matcher"), check **repo**.
3. Copy the token.
4. When terminal asks for **password**, paste the **token** (not your GitHub password).

### Option B: Push with token in URL (one-time)

Replace `YOUR_TOKEN` with your token:

```bash
git push https://YOUR_TOKEN@github.com/nuttyears/Playdate-matcher.git main
```

---

## 6. If Remote Already Exists but Is Different

If you get "remote origin already exists":

```bash
git remote set-url origin https://github.com/nuttyears/Playdate-matcher.git
```

Then run `git push -u origin main` again.

---

## Quick Reference

| Step   | Command |
|--------|---------|
| Status | `git status` |
| Stage  | `git add .` |
| Commit | `git commit -m "Your message"` |
| Push   | `git push -u origin main` |

A **.gitignore** file is in the project so files like `.env`, `node_modules`, and `.DS_Store` are not pushed.
