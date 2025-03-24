#!/bin/bash

# Install Bun if not already installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc || source ~/.zshrc
fi

# Clean existing dependencies
rm -rf node_modules

# Install dependencies with Bun
bun install

# Set environment
export BUN_ENV=development

echo "Setup complete! You can now run:"
echo "  bun run dev    - Start development server"
echo "  bun run build  - Build for production"
echo "  bun run preview - Preview production build" 