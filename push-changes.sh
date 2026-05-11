#!/bin/bash

# Abort any pending merge
git merge --abort 2>/dev/null || true

# Stage all changes
git add -A

# Commit with message
git commit -m "feat: Add admin policy management system

- Create API endpoints for policy CRUD operations
- Add Policies link to admin sidebar
- Update all policy pages to fetch from MongoDB
- Implement effective date display on policy pages
- Add fallback to hardcoded content if no DB entry exists
- Policies: Privacy Policy, Terms of Service, Returns Policy, Shipping Policy"

# Push to current branch
git push -u origin HEAD

echo "✅ Changes pushed to GitHub!"
