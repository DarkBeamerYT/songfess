module.exports = {
  apps: [
    {
      name: 'songfess',
      script: 'server.js',
      cwd: '/var/www/songfess', // change to your actual path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
