#!/bin/bash

# CocoFile プロジェクト現在地チェックスクリプト
# プロジェクトを開いたときに実行して、現在の状態を確認する

# 色定義
BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔵 CocoFile プロジェクト現在地${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. バージョン情報
echo -e "${BLUE}📦 バージョン情報${NC}"

# package.jsonからバージョン取得
CODE_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
echo -e "  コード（package.json）: ${GREEN}v${CODE_VERSION}${NC}"

# 最新のGitタグを取得
LATEST_TAG=$(git tag --sort=-v:refname | head -1)
if [ -z "$LATEST_TAG" ]; then
  echo -e "  最新Gitタグ:           ${YELLOW}なし${NC}"
else
  echo -e "  最新Gitタグ:           ${GREEN}${LATEST_TAG}${NC}"
fi

# README.mdからGitHubリリースバージョンを取得
GITHUB_RELEASE=$(grep -i "release\|リリース" README.md | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+-alpha' | head -1)
if [ -z "$GITHUB_RELEASE" ]; then
  echo -e "  GitHubリリース:        ${YELLOW}不明${NC}"
else
  # バージョン比較（コードとリリースが一致しているか）
  if [ "$LATEST_TAG" != "$GITHUB_RELEASE" ]; then
    echo -e "  GitHubリリース:        ${RED}${GITHUB_RELEASE} ⚠️  古い！${NC}"
  else
    echo -e "  GitHubリリース:        ${GREEN}${GITHUB_RELEASE}${NC}"
  fi
fi

echo ""

# 2. Git状態
echo -e "${BLUE}📊 Git状態${NC}"

# 現在のブランチ
CURRENT_BRANCH=$(git branch --show-current)
echo -e "  現在のブランチ:        ${GREEN}${CURRENT_BRANCH}${NC}"

# 未コミットの変更
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
  echo -e "  未コミットの変更:      ${GREEN}なし ✅${NC}"
else
  echo -e "  未コミットの変更:      ${YELLOW}${UNCOMMITTED}個のファイル ⚠️${NC}"
fi

# 未リリースのコミット数（最新タグから現在まで）
if [ -n "$LATEST_TAG" ]; then
  if [ -n "$GITHUB_RELEASE" ] && [ "$LATEST_TAG" != "$GITHUB_RELEASE" ]; then
    UNRELEASED_COMMITS=$(git log ${GITHUB_RELEASE}..HEAD --oneline | wc -l)
    if [ "$UNRELEASED_COMMITS" -gt 0 ]; then
      echo -e "  未リリースのコミット:  ${RED}${UNRELEASED_COMMITS}個 ⚠️${NC}"
    else
      echo -e "  未リリースのコミット:  ${GREEN}なし ✅${NC}"
    fi
  else
    echo -e "  未リリースのコミット:  ${GREEN}なし ✅${NC}"
  fi
fi

echo ""

# 3. 既知の問題（自動検出）
echo -e "${BLUE}🚨 既知の問題${NC}"

ISSUES_FOUND=0

# GitHubリリースが古い場合
if [ -n "$GITHUB_RELEASE" ] && [ "$LATEST_TAG" != "$GITHUB_RELEASE" ]; then
  echo -e "  ${RED}❌ GitHubリリースが古い（${GITHUB_RELEASE}）${NC}"
  echo -e "     → 最新コード（${LATEST_TAG}）がリリースされていない"

  # デッドロック問題の特別チェック
  if [ "$GITHUB_RELEASE" = "v0.1.1-alpha" ]; then
    echo -e "     → ${RED}v0.1.16でデッドロック問題を修正済みだが、リリースされていない${NC}"
  fi

  ISSUES_FOUND=1
fi

# 未コミットの変更がある場合
if [ "$UNCOMMITTED" -gt 0 ]; then
  echo -e "  ${YELLOW}⚠️  未コミットの変更あり${NC}"
  echo -e "     → git status で確認してください"
  ISSUES_FOUND=1
fi

if [ "$ISSUES_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}✅ 問題なし${NC}"
fi

echo ""

# 4. 次にやること（問題に基づいて自動生成）
echo -e "${BLUE}📋 次にやること${NC}"

TASKS_FOUND=0

if [ -n "$GITHUB_RELEASE" ] && [ "$LATEST_TAG" != "$GITHUB_RELEASE" ]; then
  echo -e "  ${YELLOW}1.${NC} ${LATEST_TAG} をGitHubリリース"
  echo -e "  ${YELLOW}2.${NC} 動作確認（デッドロック問題が解決されているか）"
  TASKS_FOUND=1
fi

if [ "$UNCOMMITTED" -gt 0 ]; then
  echo -e "  ${YELLOW}→${NC} 未コミットの変更をコミット"
  TASKS_FOUND=1
fi

if [ "$TASKS_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}✅ 緊急タスクなし${NC}"
  echo -e "  ${NC}次の機能開発や改善に進めます${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}💡 ヒント${NC}: このスクリプトはプロジェクトを開くたびに実行してください"
echo ""
