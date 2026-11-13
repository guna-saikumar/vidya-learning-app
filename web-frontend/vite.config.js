import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

function autoCssModulesPlugin() {
  return {
    name: 'auto-css-modules',
    enforce: 'pre',
    async resolveId(source, importer) {
      const cleanSource = source.split('?')[0];
      if (
        cleanSource.endsWith('.css') &&
        !cleanSource.endsWith('index.css') &&
        !cleanSource.includes('.module.css')
      ) {
        const resolution = await this.resolve(source, importer, { skipSelf: true });
        if (resolution) {
          return resolution.id.replace(/\.css$/, '.module.css');
        }
      }
    },
    async load(id) {
      if (id.includes('.module.css')) {
        const cleanId = id.split('?')[0];
        const realPath = cleanId.replace(/\.module\.css$/, '.css');
        if (fs.existsSync(realPath)) {
          return fs.readFileSync(realPath, 'utf-8');
        }
      }
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.css') && !file.endsWith('index.css')) {
        const virtualModule = server.moduleGraph.getModuleById(file.replace(/\.css$/, '.module.css'));
        if (virtualModule) {
          server.moduleGraph.invalidateModule(virtualModule);
          return [virtualModule];
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [autoCssModulesPlugin(), react()],
  server: {
    port: 5174,
    host: true,
  },
});
