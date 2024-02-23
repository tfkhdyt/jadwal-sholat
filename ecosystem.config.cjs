module.exports = {
  apps: [
    {
      name: 'jadwal-sholat',
      script: './server.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 'max',
      exec_mode: 'cluster',
    },
  ],
};
