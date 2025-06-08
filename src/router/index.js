import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: ルーティング設定項目
 *
 * hidden: true                     // trueに設定すると、ルートがサイドバーや401、ログインなどのページ、または/edit/1のような編集ページに表示されなくなります
 * alwaysShow: true                 // childrenルートがある場合、子ステートメントのルーティングが最大1レベルまで展開され、自動的にネストされたパターンになります。コンポーネントページなどに適用されます
 *                                  // サイドバーのルーティングにルートがある場合、そのサブルーティングが表示されます。ガイダンスページなどに適用されます
 *                                  // ルートの下部を無視したい場合、宣言されたchildrenの数がルートルーティングを示します
 *                                  // alwaysShow: trueを設定すると、以前に定義されたルールが無視され、常にルートルーティングが表示されます
 * redirect: noRedirect             // noRedirectに設定すると、パンくずナビゲーションでルートをクリックできなくなります
 * name: 'router-name'              // ルートの名前を設定します。必ず<keep-alive>に記入してください。常にさまざまな問題があります
 * query: '{"id": 1, "name": "ry"}' // ルートのデフォルトクエリパラメータにアクセスします
 * roles: ['admin', 'common']       // ルーティングの役割にアクセスします
 * permissions: ['a:a:a', 'b:b:b']  // ルーティングメニューの権限にアクセスします
 * meta: {
    noCache: true                   // trueに設定すると、<keep-alive>キャッシュが無効になります（デフォルトはfalse）
    title: 'title'                  // サイドバーとパンくずに表示される名前を設定します
    icon: 'svg-name'                // このルーティングのアイコンを設定します。対応するパスはsrc/assets/icons/svgです
    breadcrumb: false               // falseに設定すると、パンくずに表示されません
    activeMenu: '/system/user'      // ルートが設定されると、対応するサイドバーで強調表示されます
  }
 */

// ルーティング
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/homepage',
    component: () => import('@/views/homepage'),
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: '/demoDev',
    component: () => import('@/views/demoDev'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/final',
    component: () => import('@/views/system/application/operations/final.vue'),
    hidden: false
  },
  {
    path: '/orc_step1',
    component: () => import('@/views/system/application/operations/orc_step1.vue'),
    hidden: false
  },
  {
    path: '/orc_step2',
    component: () => import('@/views/system/application/operations/orc_step2.vue'),
    hidden: false
  },
  // {
  //   path: '/operator/gyoumu/main',
  //   component: () => import('@/views/gyoumu/main'),
  //   hidden: true
  // },
  // {
  //   path: '/operator/gyoumu/localupload',
  //   component: () => import('@/views/gyoumu/localupload'),
  //   hidden: true
  // },
  // {
  //   path: '/operator/gyoumu/webupload',
  //   component: () => import('@/views/gyoumu/webupload'),
  //   hidden: true
  // },
  // {
  //   path: '/operator/gyoumu/datamanage',
  //   component: () => import('@/views/gyoumu/datamanage'),
  //   hidden: true
  // },
  // {
  //   path: '/gov',
  //   component: Layout, 
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/system/gov/index'),
  //       meta: { title: '自治体管理', icon: 'IceCream', affix: true }
  //     }
  //   ]
  // },

  // {
  //   path: '/file',
  //   component: Layout, 
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/system/file/index'),
  //       meta: { title: '有効期限確認一覧', icon: 'IceCream', affix: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/user',
  //   component: Layout, 
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/system/user/index'),
  //       meta: { title: '利用者管理', icon: 'IceCream', affix: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/log',
  //   component: Layout, 
  //   children: [
  //     {
  //       path: 'operation',
  //       component: () => import('@/views/system/operation/index'),
  //       meta: { title: '利用履歴一覧', icon: 'IceCream', affix: true } 
  //     }
  //   ]
  // },
  {
    path: '/operator/gyoumu/datadetail',
    component: () => import('@/views/gyoumu/datadetail'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: 'ダッシュボード', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: 'パーソナルセンター', icon: 'user' }
      }
    ]
  }
]

// ロードするユーザー権限に基づく動的ルート
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '役割の割り当て', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: 'ユーザーを割り当てます', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '辞書データ', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: 'スケジュールされたログ', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '生成構成を変更します', activeMenu: '/tool/gen' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
