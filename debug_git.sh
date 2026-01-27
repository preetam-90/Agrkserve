#!/bin/bash
git status --short > git_output.txt 2>&1
git branch >> git_output.txt 2>&1
git remote -v >> git_output.txt 2>&1
git log -n 1 --oneline >> git_output.txt 2>&1
