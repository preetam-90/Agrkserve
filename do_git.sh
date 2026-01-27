#!/bin/bash
exec > git_op.log 2>&1
echo "Adding and committing local changes..."
git add .
git commit -m "Local update"
echo "Fetching and merging..."
git pull origin main --no-rebase -m "Merge remote changes"
echo "Pushing..."
git push origin main
echo "Done."
