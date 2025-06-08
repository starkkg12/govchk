import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/register'];

router.beforeEach((to, from, next) => {
  //next() // 登録認証一時的にスキップする
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 現在のユーザーが引き上げられたかどうかを判断しますuser_info情報
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // によるとroles永続的な世代は、アクセス可能なルーティングテーブルを使用できます
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // アクセス可能なルーティングテーブルを動的に追加します
              }
            })
            next({ ...to, replace: true }) // hack方法 確認するaddRoutes完了しました
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // tokenが取得できない場合
    if (whiteList.indexOf(to.path) !== -1) {
      // 無料のロゴのリスト，直接入力してください
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // それ以外の場合は、ログインページに遷移する
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
