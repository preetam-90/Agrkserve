#!/bin/bash
git add .
git commit -m "Resolve middleware conflict and restore landing page features"
git push origin main > push_output.txt 2>&1
