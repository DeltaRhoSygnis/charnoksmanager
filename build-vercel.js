#!/usr/bin/env node

// Build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building for Vercel deployment...');

try {
  // Build the client
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Copy necessary files for server
  console.log('Preparing server files...');
  
  // Create api directory for Vercel
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api', { recursive: true });
  }
  
  // Copy server files to api directory
  const serverFiles = [
    'server/index.ts',
    'server/routes.ts',
    'server/storage.ts',
    'server/db.ts'
  ];
  
  serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const dest = path.join('api', path.basename(file));
      fs.copyFileSync(file, dest);
      console.log(`Copied ${file} to ${dest}`);
    }
  });
  
  // Copy shared directory
  if (fs.existsSync('shared')) {
    if (!fs.existsSync('api/shared')) {
      fs.mkdirSync('api/shared', { recursive: true });
    }
    
    const sharedFiles = fs.readdirSync('shared');
    sharedFiles.forEach(file => {
      fs.copyFileSync(path.join('shared', file), path.join('api/shared', file));
      console.log(`Copied shared/${file} to api/shared/${file}`);
    });
  }
  
  console.log('Build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}