#!/bin/bash

# Windows 构建脚本
# 用于在WSL环境中构建 Windows 版本的 thosts

set -e

echo "🏗️ 开始构建 Windows 版本的 thosts..."

# 1. 检查并安装Windows目标平台
echo "📦 检查 Windows 目标平台..."
if ! rustup target list --installed | grep -q "x86_64-pc-windows-msvc"; then
    echo "⬇️ 安装 Windows 目标平台..."
    rustup target add x86_64-pc-windows-msvc
fi

# 2. 构建前端
echo "🔨 构建前端..."
npm run build

# 3. 构建Windows版本
echo "🎯 构建Windows应用程序..."
npm run tauri build -- --target x86_64-pc-windows-msvc

# 4. 检查构建结果
BUILD_DIR="src-tauri/target/x86_64-pc-windows-msvc/release/bundle"
if [ -d "$BUILD_DIR" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位置: $BUILD_DIR"
    echo ""
    echo "📦 生成的安装包:"
    find "$BUILD_DIR" -name "*.msi" -o -name "*.exe" | while read file; do
        echo "  - $(basename "$file")"
    done
    echo ""
    echo "💡 提示:"
    echo "  - MSI安装包: 适合企业部署和静默安装"
    echo "  - NSIS安装包: 适合个人用户，支持多语言"
    echo "  - 可执行文件: 绿色版本，无需安装"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "🎉 Windows构建完成！"