module.exports = {
    apps: [
      {
        name: 'frame',
        script: 'npm',
        args: 'run dev',
        exec_mode: 'fork',
        instances: 1,
        autorestart: true,
        watch: true,
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        }
      }
    ]
  };