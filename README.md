# vite plugin vue pages

自动生成路由和菜单。

因为文件命名规则和路由匹配语法冲突，因此添加了使用template的path属性支持路由匹配的方式；因为目录结构通常用于组织模块，而布局和视图通常是二级的关系，很多时候无法通过目录结构生成布局，因此使用布局文件解决这个问题；通过给目录添加同名组件的方式，支持自定义菜单的生成。

## 路由生成

1. 根据文件系统生成路由，默认目录为 src/pages,SFC 的默认扩展名为 .vue
1. 使用 SFC 的 template 属性映射为路由的 meta 属性
1. 路由匹配无法用文件命名实现的可以通过 SFC tamplte 的 path 属性定义
1. 目录结构通常用于组织模块，而布局和视图通常是二级的关系，很多时候无法通过目录结构生成布局，因此使用布局文件解决这个问题。约定以 _开头的 SFC 文件为布局文件。同目录下的路由组件可以使用默认布局文件_Layout.vue 或其他自定义布局文件，下级目录如果没有布局文件，则使用上级目录的布局文件。

## 菜单生成

1. 根据路由生成菜单
1. 根据目录生成菜单分组
1. 生成菜单分组的目录必须具备同名 SFC 组件，使用该 SFC 组件 template 属性作为菜单属性
1. 没有同名 SFC 组件的目录，不生成菜单分组，使用上级目录的菜单分组
1. 菜单和菜单分组的排序件使用对应 SFC 组件的 template 的 order 属性定义
1. 菜单和菜单分组的图标组件使用对应 SFC 组件的 template 的 icon 属性定义
1. 图标使用异步方式加载图标文件，默认目录为 src/assets/icon，扩展名为 .svg

## vite.config.js

```js
// ...
import vuePages from 'vite-plugin-vue-pages';

export default defineConfig({
  // ...
  plugins: [
    // { pageDir: 'src/pages', menuDir: 'src/assets/icons' }
    vuePages({ pageDir: 'src/views' })
  ],
});

```

## views

|--- _Layout.vue
|---_Empty.vue
|--- Index.vue
|--- About.vue
|--- Login.vue
|--- NotFound.vue
|--- Account.vue
|--- Account
|　　　|--- _Layout.vue
|　　　|--- Index.vue
|--- Admin.vue
|--- Admin
|　　　|---_Layout.vue
|　　　|--- Index.vue
|　　　|--- Group1
|　　　　　　|--- Index.vue
|　　　|--- Group2
|　　　　　　|---_Layout.vue
|　　　　　　|--- Index.vue

## routes & menus

```js
// import { routes,menus } from 'virtual:vuepages';
import { defineAsyncComponent } from "vue";

const routes = [
{
  "children": [
    {
      "name": "About",
      "component": () => import('./src/views/About.vue'),
      "meta": {
        "title": "About",
        "order": "3",
        "icon": "folder"
      },
      "path": "/About"
    },
    {
      "name": "Index",
      "component": () => import('./src/views/Index.vue'),
      "meta": {
        "title": "Home",
        "roles": "*",
        "icon": "home"
      },
      "path": "/"
    }
  ],
  "isDirectory": false,
  "fileNameWithoutExt": "_Layout",
  "name": "_Layout",
  "component": () => import('./src/views/_Layout.vue'),
  "meta": {
    "icon": "folder"
  },
  "path": "/"
},
{
  "children": [
    {
      "name": "Account-Index",
      "component": () => import('./src/views/Account/Index.vue'),
      "meta": {
        "title": "Account-Index",
        "icon": "folder"
      },
      "path": "/Account"
    }
  ],
  "isDirectory": false,
  "fileNameWithoutExt": "_Layout",
  "name": "Account-_Layout",
  "component": () => import('./src/views/Account/_Layout.vue'),
  "meta": {
    "icon": "folder"
  },
  "path": "/Account"
},
{
  "children": [
    {
      "name": "Admin-Group2-Index",
      "component": () => import('./src/views/Admin/Group2/Index.vue'),
      "meta": {
        "title": "Admin-Group2-Index",
        "order": "1",
        "icon": "folder"
      },
      "path": "/Admin/Group2"
    }
  ],
  "isDirectory": false,
  "fileNameWithoutExt": "_Layout",
  "name": "Admin-Group2-_Layout",
  "component": () => import('./src/views/Admin/Group2/_Layout.vue'),
  "meta": {
    "icon": "folder"
  },
  "path": "/Admin/Group2"
},
{
  "children": [
    {
      "name": "Admin-Group1-Index",
      "component": () => import('./src/views/Admin/Group1/Index.vue'),
      "meta": {
        "title": "Admin-Group1-Index",
        "order": "2",
        "icon": "folder"
      },
      "path": "/Admin/Group1"
    },
    {
      "name": "Admin-Index",
      "component": () => import('./src/views/Admin/Index.vue'),
      "meta": {
        "title": "Admin-Index",
        "icon": "folder"
      },
      "path": "/Admin"
    }
  ],
  "isDirectory": false,
  "fileNameWithoutExt": "_Layout",
  "name": "Admin-_Layout",
  "component": () => import('./src/views/Admin/_Layout.vue'),
  "meta": {
    "icon": "folder"
  },
  "path": "/Admin"
},
{
  "children": [
    {
      "name": "Login",
      "component": () => import('./src/views/Login.vue'),
      "meta": {
        "title": "Login",
        "layout": "_Empty",
        "hidden": true,
        "icon": "folder"
      },
      "path": "/Login"
    }
  ],
  "isDirectory": false,
  "fileNameWithoutExt": "_Empty",
  "name": "_Empty",
  "component": () => import('./src/views/_Empty.vue'),
  "meta": {
    "icon": "folder"
  },
  "path": "/"
},
{
  "name": "NotFound",
  "component": () => import('./src/views/NotFound.vue'),
  "meta": {
    "path": ":pathMatch(.*)*",
    "layout": "null",
    "title": "404",
    "hidden": true,
    "icon": "folder"
  },
  "path": "/:pathMatch(.*)*"
}];

const menus = [
{
  "isDirectory": false,
  "path": "/",
  "title": "Home",
  "icon": "home",
  "order": 0,
  "component": defineAsyncComponent(() => import('./src/assets/icons/home.svg'))
},
{
  "isDirectory": false,
  "path": "/Login",
  "hidden": true,
  "title": "Login",
  "icon": "folder",
  "order": 0,
  "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
},
{
  "isDirectory": false,
  "path": "/:pathMatch(.*)*",
  "hidden": true,
  "title": "404",
  "icon": "folder",
  "order": 0,
  "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
},
{
  "isDirectory": true,
  "title": "Admin",
  "icon": "file",
  "order": 1,
  "component": defineAsyncComponent(() => import('./src/assets/icons/file.svg')),
  "children": [
    {
      "isDirectory": false,
      "path": "/Admin",
      "title": "Admin-Index",
      "icon": "folder",
      "order": 0,
      "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
    },
    {
      "isDirectory": false,
      "path": "/Admin/Group2",
      "title": "Admin-Group2-Index",
      "icon": "folder",
      "order": 1,
      "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
    },
    {
      "isDirectory": false,
      "path": "/Admin/Group1",
      "title": "Admin-Group1-Index",
      "icon": "folder",
      "order": 2,
      "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
    }
  ]
},
{
  "isDirectory": true,
  "title": "Account",
  "icon": "user",
  "order": 2,
  "component": defineAsyncComponent(() => import('./src/assets/icons/user.svg')),
  "children": [
    {
      "isDirectory": false,
      "path": "/Account",
      "title": "Account-Index",
      "icon": "folder",
      "order": 0,
      "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
    }
  ]
},
{
  "isDirectory": false,
  "path": "/About",
  "title": "About",
  "icon": "folder",
  "order": 3,
  "component": defineAsyncComponent(() => import('./src/assets/icons/folder.svg'))
}];

export { routes, menus };
```
