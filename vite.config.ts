import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePluginNode } from 'vite-plugin-node';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target:'http://localhost:5000', // Proxy API requests to your Express server
        
      } 
    },
    port: 3000, // Port for Vite
  },
  clearScreen: false,
})


/*


    VitePluginNode({
      adapter: 'express',
      appPath: './src/backend/server.ts', // Path to your Express server
      exportName: 'app', // Name of the export from server file
    })

*/