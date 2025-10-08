#!/bin/bash

# Git Aliases for ONE MEDI Project
# Source this file in your shell to use aliases

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Git helper aliases
alias ghelp="bash $SCRIPT_DIR/git-helpers.sh help"
alias gpull="bash $SCRIPT_DIR/git-helpers.sh pull"
alias gqpush="bash $SCRIPT_DIR/git-helpers.sh quick-push"
alias gscommit="bash $SCRIPT_DIR/git-helpers.sh smart-commit"
alias gnbranch="bash $SCRIPT_DIR/git-helpers.sh new-branch"
alias gsync="bash $SCRIPT_DIR/git-helpers.sh sync-main"
alias gpr="bash $SCRIPT_DIR/git-helpers.sh create-pr"
alias gauto="bash $SCRIPT_DIR/git-helpers.sh auto"

# Additional useful git aliases
alias gs="git status"
alias ga="git add"
alias gaa="git add ."
alias gc="git commit -m"
alias gca="git commit --amend"
alias gco="git checkout"
alias gb="git branch"
alias gba="git branch -a"
alias gl="git log --oneline --graph --decorate -10"
alias gla="git log --oneline --graph --decorate --all -10"
alias gd="git diff"
alias gdc="git diff --cached"
alias gf="git fetch"
alias gm="git merge"
alias gr="git rebase"
alias gri="git rebase -i"
alias gst="git stash"
alias gstp="git stash pop"
alias gstl="git stash list"

echo "✅ Git aliases loaded!"
echo "💡 Type 'ghelp' to see available commands"
