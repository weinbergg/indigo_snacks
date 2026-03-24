module.exports = {
  apps: [
    {
      name: 'indigo-snacks-api',
      cwd: './server',
      script: './dist/index.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
