#!/bin/bash
# deploy.sh — build → commit → push → deploy → verify
# Usage: ./deploy.sh "commit message" [file-to-verify.html]

MSG="${1:-update}"
VERIFY_FILE="${2:-index.html}"
PROJECT="andarilho-digital"
BASE_URL="https://andarilho-digital.pages.dev"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOY — Andarilho Digital"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Commit
echo "▶ Committing..."
git add -A
git commit -m "$MSG" 2>/dev/null || echo "  (nothing new to commit)"

# 2. Push
echo "▶ Pushing to GitHub..."
git push 2>/dev/null || echo "  (push skipped — no remote or already up to date)"

# 3. Deploy to Cloudflare Pages
echo "▶ Deploying to Cloudflare Pages..."
npx wrangler pages deploy . --project-name="$PROJECT" --commit-dirty=true 2>&1 | grep -E "(Uploading|Deployment complete|Error)"

# 4. Verify live URL
echo "▶ Verifying live URL..."
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/$VERIFY_FILE")

if [ "$STATUS" = "200" ]; then
  echo ""
  echo "✅ LIVE — HTTP $STATUS"
  echo "   $BASE_URL/$VERIFY_FILE"
  echo ""
else
  echo ""
  echo "⚠️  Got HTTP $STATUS — check Cloudflare dashboard"
  echo "   $BASE_URL/$VERIFY_FILE"
  echo ""
fi
