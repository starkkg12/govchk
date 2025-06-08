import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  return {
    // 生産環境と開発環境URL。
    // デフォルトで，vite アプリケーションがドメイン名のルートパスに展開されていると仮定します
    // 例えば。アプリケーションがサブパスに展開されている場合，このオプションを使用してこの地下鉄を指定する必要があります。例えば，アプリケーションが展開されている場合 https://www.ruoyi.vip/admin/，設定 baseUrl のために /admin/。
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: [
        createVitePlugins(env, command === 'build')
      ],
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // パスの設定
        '~': path.resolve(__dirname, './'),
        // エイリアスを設定します
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 関連する構成
    server: {
      port: 80,
      host: true,
      open: VITE_APP_ENV =="docker" ? false : true, // ブラウザを自動的に開く
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          // target: 'http://localhost:8080',
          // target: 'http://192.168.179.46:8080',
          // target: 'http://192.168.179.2:8080',
          target: 'http://172.16.160.14:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        },
        '/prod-api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/prod-api/, '')
        }
      }
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  }
})
