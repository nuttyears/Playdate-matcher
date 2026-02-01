#!/bin/bash
# Run this script to check if your changes were pushed to GitHub
# Usage: ./check-git-status.sh   or   bash check-git-status.sh

cd "$(dirname "$0")"

echo "=========================================="
echo "GIT TROUBLESHOOTING - Project Playdate Matcher"
echo "=========================================="
echo ""

echo "1. CURRENT BRANCH:"
git branch -v
echo ""

echo "2. REMOTE REPO:"
git remote -v
echo ""

echo "3. WORKING TREE STATUS (uncommitted changes?):"
git status
echo ""

echo "4. LAST COMMIT:"
git log -1 --oneline
echo ""

echo "5. UNCOMMITTED FILES (modified but not staged):"
git diff --name-only
echo ""

echo "6. STAGED FILES (staged but not committed):"
git diff --cached --name-only
echo ""

echo "7. COMPARE WITH REMOTE (fetch then compare):"
git fetch origin 2>&1
echo "Local vs origin:"
git status -sb
echo ""

echo "=========================================="
echo "HOW TO PUSH IF YOU HAVE UNCOMMITTED CHANGES:"
echo "  git add index.html"
echo "  git add .                    # or add all files"
echo "  git commit -m \"Your message\""
echo "  git push origin"
echo "=========================================="
