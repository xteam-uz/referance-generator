module.exports = {
    apps: [{
        name: 'cv-frontend',
        script: 'npm',
        args: 'start',
        cwd: '/home/mirsolih/web/cv-frontend.firstcoder.uz/public_html',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        }
    }]
};

