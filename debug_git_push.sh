#!/bin/bash
echo "--- TRYING PULL ---"
git pull --rebase origin main 2>&1
echo "--- TRYING PUSH ---"
git push origin main 2>&1
echo "--- STATUS ---"
git status 2>&1
