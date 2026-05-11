#!/bin/bash
# Fix the stuck merge state
git merge --abort 2>/dev/null || true
git reset --hard HEAD 2>/dev/null || true
echo "Merge state cleared"
