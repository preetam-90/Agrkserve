#!/bin/bash
exec > git_op.log 2>&1
echo "Adding and committing local changes..."
git add .
git commit -m "Local update" || echo "Nothing to commit"
echo "Fetching..."
git fetch origin main
echo "Merging..."
git merge origin/main -m "Merge remote changes" --allow-unrelated-histories
echo "Pushing..."
git push origin main
echo "Done."
