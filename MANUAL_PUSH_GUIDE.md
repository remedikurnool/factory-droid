# Manual Push Guide for Sprint 2.1: Medicine Catalog

## ⚠️ Issue Identified

The current branch `feat/sprint-2.1-medicine-catalog` contains `node_modules` directories that exceed GitHub's 100MB file size limit. We need to create a clean branch with only source code.

## 📋 Solution: Manual Branch Creation

Follow these steps to manually push Sprint 2.1 to GitHub:

### Step 1: Create Clean Branch from GitHub Web Interface

1. Go to https://github.com/remedikurnool/factory-droid
2. Click the branch dropdown
3. Type: `feat/sprint-2.1-medicine-catalog`
4. Click "Create branch: feat/sprint-2.1-medicine-catalog from main"

### Step 2: Clone Fresh Copy (Optional but Recommended)

```bash
# In a new directory
git clone https://github.com/remedikurnool/factory-droid.git factory-droid-clean
cd factory-droid-clean
git checkout -b feat/sprint-2.1-medicine-catalog
```

### Step 3: Create Directory Structure

```bash
# Create medicine module directories
mkdir -p apps/backend/src/modules/medicine/dto
mkdir -p apps/backend/src/modules/medicine/services
mkdir -p packages/database/prisma
mkdir -p .github
```

### Step 4: Copy Files from This Repository

You need to copy these 11 files from the current repository:

#### A. Database Schema
```bash
# From: /project/workspace/factory-droid/packages/database/prisma/schema.prisma
# Copy the enhanced Prisma schema with medicine models
```

#### B. Medicine DTOs
```bash
# From: apps/backend/src/modules/medicine/dto/medicine.dto.ts
# All validation and DTO classes (700+ lines)
```

#### C. Medicine Services (3 files)
```bash
# From: apps/backend/src/modules/medicine/services/medicine.service.ts
# From: apps/backend/src/modules/medicine/services/medicine-review.service.ts
# From: apps/backend/src/modules/medicine/services/wishlist.service.ts
```

#### D. Medicine Controller & Module
```bash
# From: apps/backend/src/modules/medicine/medicine.controller.ts
# From: apps/backend/src/modules/medicine/medicine.module.ts
```

#### E. Documentation (4 files)
```bash
# From: SPRINT_2.1_MEDICINE_CATALOG.md
# From: SPRINT_2.1_SUMMARY.md
# From: PUSH_INSTRUCTIONS.md
# From: .github/pull_request_template_sprint_2_1.md
```

#### F. Gitignore
```bash
# From: .gitignore
```

### Step 5: File Extraction Script

Here's a script to extract just the source files:

```bash
#!/bin/bash
# Run this from /project/workspace/factory-droid

SOURCE_BRANCH="feat/sprint-2.1-medicine-catalog"
TARGET_DIR="/tmp/sprint-2.1-source"

# Create target directory
mkdir -p $TARGET_DIR
mkdir -p $TARGET_DIR/apps/backend/src/modules/medicine/dto
mkdir -p $TARGET_DIR/apps/backend/src/modules/medicine/services
mkdir -p $TARGET_DIR/packages/database/prisma
mkdir -p $TARGET_DIR/.github

# Extract files from git (without node_modules)
git show $SOURCE_BRANCH:packages/database/prisma/schema.prisma > $TARGET_DIR/packages/database/prisma/schema.prisma
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/dto/medicine.dto.ts > $TARGET_DIR/apps/backend/src/modules/medicine/dto/medicine.dto.ts
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/services/medicine.service.ts > $TARGET_DIR/apps/backend/src/modules/medicine/services/medicine.service.ts
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/services/medicine-review.service.ts > $TARGET_DIR/apps/backend/src/modules/medicine/services/medicine-review.service.ts
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/services/wishlist.service.ts > $TARGET_DIR/apps/backend/src/modules/medicine/services/wishlist.service.ts
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/medicine.controller.ts > $TARGET_DIR/apps/backend/src/modules/medicine/medicine.controller.ts
git show $SOURCE_BRANCH:apps/backend/src/modules/medicine/medicine.module.ts > $TARGET_DIR/apps/backend/src/modules/medicine/medicine.module.ts
git show $SOURCE_BRANCH:SPRINT_2.1_MEDICINE_CATALOG.md > $TARGET_DIR/SPRINT_2.1_MEDICINE_CATALOG.md
git show $SOURCE_BRANCH:SPRINT_2.1_SUMMARY.md > $TARGET_DIR/SPRINT_2.1_SUMMARY.md
git show $SOURCE_BRANCH:PUSH_INSTRUCTIONS.md > $TARGET_DIR/PUSH_INSTRUCTIONS.md
git show $SOURCE_BRANCH:.github/pull_request_template_sprint_2_1.md > $TARGET_DIR/.github/pull_request_template_sprint_2_1.md
git show $SOURCE_BRANCH:.gitignore > $TARGET_DIR/.gitignore

echo "✅ Source files extracted to $TARGET_DIR"
echo "📦 Total size: $(du -sh $TARGET_DIR | cut -f1)"
```

### Step 6: Push Clean Branch

```bash
# In your clean repository
git add .
git commit -m "feat(sprint-2.1): Implement comprehensive medicine catalog with reviews, wishlist, and stock management

## Features
- Medicine CRUD (35 API endpoints)
- Reviews & Ratings system with verification
- Wishlist functionality with cart integration
- Stock management with complete history tracking
- Price management with audit trail
- Advanced filtering & search

## Statistics
- Files: 11
- Lines of Code: ~3,600
- Services: 3
- Database Models: 5 new + 2 enhanced
- Indexes: 25+

## Documentation
- SPRINT_2.1_MEDICINE_CATALOG.md - Feature guide
- SPRINT_2.1_SUMMARY.md - Implementation summary
- Comprehensive inline documentation"

git push origin feat/sprint-2.1-medicine-catalog
```

### Step 7: Create Pull Request

Use the GitHub CLI or web interface:

```bash
gh pr create \
  --title "Sprint 2.1: Medicine Catalog - Complete Implementation" \
  --body-file .github/pull_request_template_sprint_2_1.md \
  --base main \
  --head feat/sprint-2.1-medicine-catalog
```

Or via web at: https://github.com/remedikurnool/factory-droid/compare/main...feat/sprint-2.1-medicine-catalog

## 🎯 Alternative: Use Patches

If you prefer, extract patches instead:

```bash
cd /project/workspace/factory-droid

# Create patches for each file
git show d8c9571c:packages/database/prisma/schema.prisma > /tmp/schema.patch
git show d8c9571c:apps/backend/src/modules/medicine/dto/medicine.dto.ts > /tmp/dto.patch
# ... etc for each file
```

## ✅ Files to Include (11 total)

1. ✅ `.gitignore` - Prevent future node_modules tracking
2. ✅ `packages/database/prisma/schema.prisma` (1,200 lines)
3. ✅ `apps/backend/src/modules/medicine/dto/medicine.dto.ts` (700+ lines)
4. ✅ `apps/backend/src/modules/medicine/services/medicine.service.ts` (750+ lines)
5. ✅ `apps/backend/src/modules/medicine/services/medicine-review.service.ts` (450+ lines)
6. ✅ `apps/backend/src/modules/medicine/services/wishlist.service.ts` (400+ lines)
7. ✅ `apps/backend/src/modules/medicine/medicine.controller.ts` (350+ lines)
8. ✅ `apps/backend/src/modules/medicine/medicine.module.ts` (15 lines)
9. ✅ `SPRINT_2.1_MEDICINE_CATALOG.md` (500+ lines)
10. ✅ `SPRINT_2.1_SUMMARY.md` (450+ lines)
11. ✅ `.github/pull_request_template_sprint_2_1.md` (PR template)

## 🔍 Verification

After pushing, verify:
- ✅ No node_modules directories
- ✅ Repository size < 50MB
- ✅ All 11 files present
- ✅ Can create PR successfully

## 📞 Need Help?

If you encounter issues, the files are safely committed locally on branch `feat/sprint-2.1-medicine-catalog` in this repository. You can always extract them using:

```bash
git show feat/sprint-2.1-medicine-catalog:path/to/file.ts
```

---

**The code is production-ready and complete - it just needs a clean push without node_modules!** 🚀
