import { defineConfig } from 'vite';

export default defineConfig({
    base: '/resonance-sim/',

    server: {
        watch: {
            usePolling: true
        }
    }
});