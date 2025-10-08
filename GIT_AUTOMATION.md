# Git Automation Guide

Automated Git commands for ONE MEDI project to streamline your workflow.

## 🚀 Quick Start

### Using NPM Scripts (Recommended)

```bash
# Pull latest changes
pnpm git:pull

# Quick commit and push all changes
pnpm git:push "feat: add new feature"

# Commit and push only staged files
pnpm git:commit "fix: bug fix"

# Create new branch from main
pnpm git:branch feat/new-feature

# Sync with main branch
pnpm git:sync

# Create pull request
pnpm git:pr

# Auto workflow (add, commit, push, PR)
pnpm git:auto "feat: complete feature" true

# Show help
pnpm git:help
```

### Using Shell Scripts Directly

```bash
# Pull latest changes
./scripts/git-helpers.sh pull

# Quick push
./scripts/git-helpers.sh quick-push "feat: add feature"

# Smart commit (staged files only)
./scripts/git-helpers.sh smart-commit "fix: bug"

# Create new branch
./scripts/git-helpers.sh new-branch feat/sprint-1.4

# Sync with main
./scripts/git-helpers.sh sync-main

# Create PR
./scripts/git-helpers.sh create-pr

# Auto workflow
./scripts/git-helpers.sh auto "feat: complete sprint" true

# Help
./scripts/git-helpers.sh help
```

## 📋 Available Commands

### 1. **git:pull** - Pull Latest Changes
Automatically pulls latest changes from remote with auto-stash if you have uncommitted changes.

```bash
pnpm git:pull
```

**What it does:**
- Detects current branch
- Stashes uncommitted changes (if any)
- Pulls latest changes with fast-forward only
- Restores stashed changes

### 2. **git:push** - Quick Push
Adds all changes, commits, and pushes in one command.

```bash
pnpm git:push "feat: implement new feature"
```

**What it does:**
- Shows all changed files
- Adds all changes (`git add .`)
- Commits with your message
- Pushes to current branch

### 3. **git:commit** - Smart Commit
Commits and pushes only staged files (gives you more control).

```bash
# Stage specific files first
git add src/module1.ts src/module2.ts

# Then commit and push
pnpm git:commit "fix: update specific modules"
```

**What it does:**
- Shows staged files
- Commits only staged changes
- Pushes to current branch

### 4. **git:branch** - Create New Branch
Creates a new branch from main with latest changes.

```bash
pnpm git:branch feat/sprint-1.4
```

**What it does:**
- Switches to main/master
- Pulls latest changes
- Creates and checks out new branch

### 5. **git:sync** - Sync with Main
Syncs your current branch with main branch (rebase).

```bash
pnpm git:sync
```

**What it does:**
- Stashes changes if needed
- Fetches latest from origin
- Rebases on main
- Restores stashed changes

### 6. **git:pr** - Create Pull Request
Creates a pull request using GitHub CLI.

```bash
pnpm git:pr
```

**What it does:**
- Pushes branch if not on remote
- Opens interactive PR creation
- Requires GitHub CLI (`gh`)

### 7. **git:auto** - Complete Workflow
Runs the complete workflow: add, commit, push, and optionally create PR.

```bash
# Without PR
pnpm git:auto "feat: complete Sprint 1.3"

# With PR
pnpm git:auto "feat: complete Sprint 1.3" true
```

**What it does:**
- Adds all changes
- Commits with message
- Pushes to remote
- Creates PR (if requested)

## 🔧 Setup Shell Aliases (Optional)

For even faster access, add these aliases to your `~/.bashrc` or `~/.zshrc`:

```bash
# Source the aliases file
source ~/path/to/one-medi/scripts/git-aliases.sh

# Or add individual aliases
alias gpull="bash ~/path/to/one-medi/scripts/git-helpers.sh pull"
alias gqpush="bash ~/path/to/one-medi/scripts/git-helpers.sh quick-push"
alias gscommit="bash ~/path/to/one-medi/scripts/git-helpers.sh smart-commit"
alias gnbranch="bash ~/path/to/one-medi/scripts/git-helpers.sh new-branch"
alias gsync="bash ~/path/to/one-medi/scripts/git-helpers.sh sync-main"
alias gpr="bash ~/path/to/one-medi/scripts/git-helpers.sh create-pr"
alias gauto="bash ~/path/to/one-medi/scripts/git-helpers.sh auto"
```

Then reload your shell:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

Now you can use:
```bash
gpull                                    # Pull latest
gqpush "feat: add feature"              # Quick push
gscommit "fix: bug fix"                 # Smart commit
gnbranch feat/new-feature               # New branch
gsync                                    # Sync with main
gpr                                      # Create PR
gauto "feat: done" true                 # Auto workflow with PR
```

## 💡 Usage Examples

### Example 1: Start New Feature

```bash
# Create feature branch
pnpm git:branch feat/sprint-1.4-search

# Make your changes...
# Then quick push
pnpm git:push "feat(sprint-1.4): implement search functionality"

# Create PR
pnpm git:pr
```

### Example 2: Quick Fix

```bash
# Make quick fix...
# Quick push
pnpm git:push "fix: resolve critical bug"
```

### Example 3: Careful Commit

```bash
# Stage specific files
git add src/file1.ts src/file2.ts

# Commit only staged files
pnpm git:commit "refactor: improve code structure"
```

### Example 4: Complete Sprint

```bash
# Complete workflow with PR
pnpm git:auto "feat(sprint-1.3): complete notifications system" true
```

### Example 5: Keep Branch Updated

```bash
# Before starting work, sync with main
pnpm git:sync

# After work, push changes
pnpm git:push "feat: implement feature"
```

## 🎯 Workflow Recommendations

### Daily Development Workflow

```bash
# Morning: Start fresh
pnpm git:pull

# Create feature branch
pnpm git:branch feat/new-feature

# Work on your code...

# Commit frequently
pnpm git:push "feat: add component"
pnpm git:push "feat: add tests"
pnpm git:push "docs: update readme"

# End of day: Create PR
pnpm git:pr
```

### Sprint Completion Workflow

```bash
# Start sprint
pnpm git:branch feat/sprint-X.Y

# Work and commit frequently
pnpm git:push "feat: implement feature 1"
pnpm git:push "feat: implement feature 2"

# Keep updated with main
pnpm git:sync

# Complete sprint
pnpm git:auto "feat(sprint-X.Y): complete sprint" true
```

### Hotfix Workflow

```bash
# Pull latest main
pnpm git:pull

# Create hotfix branch
pnpm git:branch hotfix/critical-bug

# Fix the bug
pnpm git:push "fix: resolve critical issue"

# Create PR immediately
pnpm git:pr
```

## ⚠️ Important Notes

1. **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `refactor:` - Code refactoring
   - `test:` - Tests
   - `chore:` - Maintenance

2. **git:push vs git:commit:**
   - Use `git:push` when you want to commit all changes
   - Use `git:commit` when you want to commit only staged files

3. **PR Creation:**
   - Requires GitHub CLI (`gh`)
   - Install: `brew install gh` (Mac) or see [cli.github.com](https://cli.github.com/)
   - Login once: `gh auth login`

4. **Sync vs Rebase:**
   - `git:sync` uses rebase to keep history clean
   - Only sync feature branches, not shared branches

## 🔒 Security Note

The scripts will respect Droid-Shield and other security checks. If blocked:

```bash
# Review what's being committed
git status
git diff

# Make manual changes if needed
# Then try again
```

## 🆘 Troubleshooting

### "Another git process is running"

```bash
# Remove lock file
rm -f .git/index.lock

# Try again
pnpm git:push "your message"
```

### "Merge conflicts"

```bash
# Abort rebase if conflicts
git rebase --abort

# Or resolve manually
# Edit conflicted files
git add <resolved-files>
git rebase --continue
```

### "GitHub CLI not found"

```bash
# Install GitHub CLI
brew install gh  # macOS
# or visit https://cli.github.com/

# Login
gh auth login
```

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)

## 🎉 Benefits

✅ **Faster Workflow** - Save time with single commands  
✅ **Fewer Mistakes** - Automated checks and validations  
✅ **Consistent Commits** - Standardized commit process  
✅ **Easy PR Creation** - One command to create PRs  
✅ **Auto-Stash** - Never lose uncommitted work  
✅ **Color Coded** - Easy to see status and errors  

Happy coding! 🚀
