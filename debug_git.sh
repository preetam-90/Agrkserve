#!/bin/bash
echo "--- GIT STATUS ---"
git status
echo "--- GIT REMOTE ---"
git remote -v
echo "--- GIT LOG ---"
git log -n 5 --oneline
