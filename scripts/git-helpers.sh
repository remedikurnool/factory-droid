#!/bin/bash

# Git Helper Scripts for ONE MEDI Project
# Automate common git operations

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function: Pull latest changes
git_pull() {
    print_info "Pulling latest changes from remote..."
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"
    
    # Check if there are uncommitted changes
    if [[ -n $(git status -s) ]]; then
        print_warning "You have uncommitted changes. Stashing them first..."
        git stash
        STASHED=true
    else
        STASHED=false
    fi
    
    # Pull latest changes
    git pull origin "$CURRENT_BRANCH" --ff-only
    
    # Restore stashed changes if any
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        git stash pop
    fi
    
    print_success "Successfully pulled latest changes!"
}

# Function: Quick commit and push
git_quick_push() {
    if [ -z "$1" ]; then
        print_error "Usage: git_quick_push <commit-message>"
        return 1
    fi
    
    COMMIT_MSG="$1"
    CURRENT_BRANCH=$(git branch --show-current)
    
    print_info "Quick push on branch: $CURRENT_BRANCH"
    print_info "Commit message: $COMMIT_MSG"
    
    # Check if there are changes to commit
    if [[ -z $(git status -s) ]]; then
        print_warning "No changes to commit!"
        return 0
    fi
    
    # Show what will be committed
    print_info "Files to be committed:"
    git status -s
    
    # Add all changes
    print_info "Adding all changes..."
    git add .
    
    # Commit
    print_info "Committing changes..."
    git commit -m "$COMMIT_MSG"
    
    # Push
    print_info "Pushing to origin/$CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH"
    
    print_success "Successfully committed and pushed!"
}

# Function: Smart commit (staged files only)
git_smart_commit() {
    if [ -z "$1" ]; then
        print_error "Usage: git_smart_commit <commit-message>"
        return 1
    fi
    
    COMMIT_MSG="$1"
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Check if there are staged changes
    if [[ -z $(git diff --cached --name-only) ]]; then
        print_warning "No staged changes to commit!"
        print_info "Tip: Use 'git add <files>' to stage files first"
        return 0
    fi
    
    print_info "Smart commit on branch: $CURRENT_BRANCH"
    
    # Show what will be committed
    print_info "Staged files:"
    git diff --cached --name-status
    
    # Commit
    print_info "Committing staged changes..."
    git commit -m "$COMMIT_MSG"
    
    # Push
    print_info "Pushing to origin/$CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH"
    
    print_success "Successfully committed and pushed!"
}

# Function: Create new branch from main
git_new_branch() {
    if [ -z "$1" ]; then
        print_error "Usage: git_new_branch <branch-name>"
        return 1
    fi
    
    BRANCH_NAME="$1"
    
    print_info "Creating new branch: $BRANCH_NAME"
    
    # Check if on main/master
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        print_warning "Not on main branch. Switching to main first..."
        git checkout main 2>/dev/null || git checkout master
    fi
    
    # Pull latest changes
    print_info "Pulling latest changes from main..."
    git pull
    
    # Create and checkout new branch
    print_info "Creating branch $BRANCH_NAME..."
    git checkout -b "$BRANCH_NAME"
    
    print_success "Successfully created and switched to branch: $BRANCH_NAME"
}

# Function: Sync with main branch
git_sync_main() {
    CURRENT_BRANCH=$(git branch --show-current)
    MAIN_BRANCH="main"
    
    # Check if master exists instead of main
    if git show-ref --verify --quiet refs/heads/master; then
        MAIN_BRANCH="master"
    fi
    
    print_info "Syncing $CURRENT_BRANCH with $MAIN_BRANCH..."
    
    # Stash changes if any
    if [[ -n $(git status -s) ]]; then
        print_warning "Stashing uncommitted changes..."
        git stash
        STASHED=true
    else
        STASHED=false
    fi
    
    # Fetch latest changes
    print_info "Fetching latest changes..."
    git fetch origin
    
    # Rebase on main
    print_info "Rebasing on $MAIN_BRANCH..."
    git rebase "origin/$MAIN_BRANCH"
    
    # Restore stashed changes
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        git stash pop
    fi
    
    print_success "Successfully synced with $MAIN_BRANCH!"
}

# Function: Create PR using GitHub CLI
git_create_pr() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed!"
        print_info "Install it from: https://cli.github.com/"
        return 1
    fi
    
    CURRENT_BRANCH=$(git branch --show-current)
    
    print_info "Creating PR for branch: $CURRENT_BRANCH"
    
    # Push branch if not pushed yet
    if ! git ls-remote --exit-code --heads origin "$CURRENT_BRANCH" &>/dev/null; then
        print_info "Branch not on remote. Pushing first..."
        git push -u origin "$CURRENT_BRANCH"
    fi
    
    # Create PR interactively
    gh pr create
    
    print_success "PR created successfully!"
}

# Function: Auto workflow (add, commit, push, PR)
git_auto_workflow() {
    if [ -z "$1" ]; then
        print_error "Usage: git_auto_workflow <commit-message> [create-pr]"
        return 1
    fi
    
    COMMIT_MSG="$1"
    CREATE_PR="${2:-false}"
    
    print_info "Starting auto workflow..."
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Step 1: Check status
    print_info "Step 1/4: Checking git status..."
    if [[ -z $(git status -s) ]]; then
        print_warning "No changes to commit!"
        return 0
    fi
    
    # Step 2: Add files
    print_info "Step 2/4: Adding files..."
    git add .
    print_info "Staged files:"
    git status -s
    
    # Step 3: Commit
    print_info "Step 3/4: Committing changes..."
    git commit -m "$COMMIT_MSG"
    
    # Step 4: Push
    print_info "Step 4/4: Pushing to remote..."
    CURRENT_BRANCH=$(git branch --show-current)
    git push origin "$CURRENT_BRANCH" || git push -u origin "$CURRENT_BRANCH"
    
    print_success "Auto workflow completed!"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Create PR if requested
    if [ "$CREATE_PR" = "true" ] || [ "$CREATE_PR" = "yes" ]; then
        print_info "Creating pull request..."
        git_create_pr
    fi
}

# Function: Display help
show_help() {
    cat << EOF
${BLUE}
╔═══════════════════════════════════════════════════════╗
║         ONE MEDI Git Helper Scripts                   ║
╚═══════════════════════════════════════════════════════╝
${NC}

${GREEN}Available Commands:${NC}

  ${YELLOW}git_pull${NC}
    Pull latest changes from remote (auto-stash if needed)
    
  ${YELLOW}git_quick_push <message>${NC}
    Add all files, commit, and push in one command
    Example: git_quick_push "feat: add new feature"
    
  ${YELLOW}git_smart_commit <message>${NC}
    Commit and push only staged files
    Example: git add file.ts && git_smart_commit "fix: bug fix"
    
  ${YELLOW}git_new_branch <name>${NC}
    Create new branch from main with latest changes
    Example: git_new_branch "feat/new-feature"
    
  ${YELLOW}git_sync_main${NC}
    Sync current branch with main (rebase)
    
  ${YELLOW}git_create_pr${NC}
    Create pull request using GitHub CLI
    
  ${YELLOW}git_auto_workflow <message> [create-pr]${NC}
    Complete workflow: add, commit, push, and optionally create PR
    Example: git_auto_workflow "feat: complete sprint" true

${GREEN}Aliases (add to ~/.bashrc or ~/.zshrc):${NC}

  alias gp='source scripts/git-helpers.sh && git_pull'
  alias gqp='source scripts/git-helpers.sh && git_quick_push'
  alias gsc='source scripts/git-helpers.sh && git_smart_commit'
  alias gnb='source scripts/git-helpers.sh && git_new_branch'
  alias gsm='source scripts/git-helpers.sh && git_sync_main'
  alias gpr='source scripts/git-helpers.sh && git_create_pr'
  alias gaw='source scripts/git-helpers.sh && git_auto_workflow'

${GREEN}Usage Examples:${NC}

  # Pull latest changes
  ./scripts/git-helpers.sh pull

  # Quick commit and push
  ./scripts/git-helpers.sh quick-push "feat: add feature"

  # Auto workflow with PR
  ./scripts/git-helpers.sh auto "feat: complete feature" true

  # Create new branch
  ./scripts/git-helpers.sh new-branch feat/sprint-1.4

EOF
}

# Main script logic
case "${1:-help}" in
    pull)
        git_pull
        ;;
    quick-push|qp)
        git_quick_push "$2"
        ;;
    smart-commit|sc)
        git_smart_commit "$2"
        ;;
    new-branch|nb)
        git_new_branch "$2"
        ;;
    sync-main|sm)
        git_sync_main
        ;;
    create-pr|pr)
        git_create_pr
        ;;
    auto|workflow)
        git_auto_workflow "$2" "$3"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
