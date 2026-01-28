#!/bin/bash
git config user.email "preetam-90@users.noreply.github.com"
git config user.name "preetam-90"
git add .
git commit -m "Consolidate equipment routes, add availability calendar, and fix debug logs"
git pull --rebase origin main
git push origin main > git_push_output.txt 2>&1
