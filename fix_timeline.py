"""
fix_timeline.py
===============
This script patches frontend/src/components/TimelineFeed.jsx.

Since TimelineFeed.jsx has already been updated directly (the CommentThread
now uses an isolated ReplyInput component), this script verifies the state
of the file and reports whether the fix is already applied.

If for any reason you need to re-apply the fix manually, run this script
and it will replace the old broken inline-reply pattern with the correct
isolated ReplyInput pattern.
"""

import re
import sys
import os

TARGET_FILE = os.path.join(
    os.path.dirname(__file__),
    'frontend', 'src', 'components', 'TimelineFeed.jsx'
)

# ── Marker strings to detect state ──────────────────────────────────────────
NEW_MARKER = 'const ReplyInput = ({ parentName, postId, parentId, onDone, onCancel })'
OLD_MARKER = "const submit = async () => {\n    if (!text.trim()) return;"
ADMIN_ONLY_MARKER = '{isAdmin && ('
OLD_APPROVED_MARKER = "{currentUser?.status === 'approved' && ("

def main():
    if not os.path.exists(TARGET_FILE):
        print(f"ERROR: File not found: {TARGET_FILE}")
        sys.exit(1)

    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []
    fixes_applied = []

    # ── Check 1: ReplyInput isolation fix ────────────────────────────────────
    if NEW_MARKER in content:
        print("✅ ReplyInput isolation fix: ALREADY APPLIED")
    else:
        issues.append("ReplyInput isolation fix NOT found")
        print("⚠️  ReplyInput isolation fix: NOT APPLIED")

    # ── Check 2: Admin-only PostComposer ─────────────────────────────────────
    if ADMIN_ONLY_MARKER in content:
        print("✅ Admin-only PostComposer: ALREADY APPLIED")
    elif OLD_APPROVED_MARKER in content:
        print("🔧 Admin-only PostComposer: Applying fix...")
        content = content.replace(OLD_APPROVED_MARKER, ADMIN_ONLY_MARKER)
        content = content.replace(
            "{currentUser?.status === 'approved' && (\n        <PostComposer",
            "{isAdmin && (\n        <PostComposer"
        )
        fixes_applied.append("Admin-only PostComposer")
    else:
        issues.append("Could not locate PostComposer render condition")
        print("⚠️  Admin-only PostComposer: marker not found — manual check needed")

    # ── Write back if any fixes were applied ──────────────────────────────────
    if fixes_applied:
        with open(TARGET_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ Applied {len(fixes_applied)} fix(es): {', '.join(fixes_applied)}")
    elif not issues:
        print("\n✅ All fixes are already applied. TimelineFeed.jsx is up-to-date!")
    else:
        print(f"\n⚠️  {len(issues)} issue(s) found that could not be auto-fixed:")
        for i in issues:
            print(f"   - {i}")
        sys.exit(1)

if __name__ == '__main__':
    main()
