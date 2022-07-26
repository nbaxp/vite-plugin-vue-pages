import { parse } from '@vue/compiler-sfc';
import Enumerable from 'linq'

const fs = require('fs');
const path = require('path');

function parseFiles(pagesRootDir, dir, ext) {
  const fullPath = getPath(dir);
  const files = fs.readdirSync(fullPath, { withFileTypes: true });
  const list = [];
  files.forEach((file) => {
    if ((file.isDirectory() && file.name.toLocaleLowerCase() !== 'components') || file.name.endsWith(ext)) {
      const filePath = `${dir}/${file.name}`;
      const fileNameWithoutExt = path.basename(file.name, ext);
      const item = {
        isDirectory: file.isDirectory(),
        fileNameWithoutExt: fileNameWithoutExt,
        name: `${dir}/${fileNameWithoutExt}`.substring(pagesRootDir.length + 1).replaceAll('/', '-')
      };
      if (file.isDirectory()) {
        item.children = parseFiles(pagesRootDir, `${dir}/${file.name}`, ext);
        const directoryFile = files.find(o => o.name === `${file.name}${ext}`);
        if (directoryFile) {
          const descriptor = getDescriptor(`${dir}/${file.name}${ext}`);
          item.meta = descriptor.template.attrs;
        }
      }
      else {
        item.component = `^() => import('./${filePath}')$`;
        const descriptor = getDescriptor(`${dir}/${file.name}`);
        item.meta = descriptor.template.attrs;
        //
        let routePath = (file.name.startsWith("_") ? path.dirname(filePath) : filePath.substring(0, filePath.length - 4))
          .substring(pagesRootDir.length);
        if (item.meta.path) {
          routePath = `${path.dirname(filePath).substring(pagesRootDir.length)}/${item.meta.path}`;
        }
        const defaultPath = '/index';
        if (routePath.toLocaleLowerCase().endsWith(defaultPath)) {
          routePath = routePath.substring(0, routePath.length - defaultPath.length);
        }
        if (routePath === '') {
          routePath = '/';
        }
        item.path = routePath;
      }
      if (item.meta && !item.meta.icon) {
        item.meta.icon = item.isDirectory ? 'file' : 'folder';
      }
      list.push(item);
    }
  });
  return list;
}

function getRoutes(list) {
  const plainRoutes = getPlainRoutes(list);
  const layouts = getLayouts(list);
  layouts.sort((a, b) => a.path.length > b.path.length);
  console.log('plainRoutes:');
  console.log(plainRoutes);
  console.log('layouts:');
  console.log(layouts);
  plainRoutes.forEach(route => {
    if (route.meta.layout === undefined) {
      const layout = Enumerable.from(layouts)
        .where(o => o.fileNameWithoutExt.toLocaleLowerCase() === '_layout')
        .where(o => route.path.startsWith(o.path))
        .orderByDescending(o => o.path.length)
        .firstOrDefault();
      if (layout) {
        layout.children.push(route);
      }
      else {
        layouts.push(route);
      }
    }
    else if (route.meta.layout === 'null') {
      layouts.push(route);
    }
    else {
      const layout = Enumerable.from(layouts)
        .where(o => o.fileNameWithoutExt === route.meta.layout)
        .where(o => route.path.startsWith(o.path))
        .orderByDescending(o => o.path.length)
        .firstOrDefault();
      if (layout) {
        layout.children.push(route);
      }
      else {
        layouts.push(route);
      }
    }
  });
  return Enumerable.from(layouts)
    .orderBy(o => o.children && o.children.find(r => r.path === '/'))
    .toArray();
}

function getPlainRoutes(list) {
  const routes = [];
  list.forEach(item => {
    if (!item.isDirectory) {
      if (!item.fileNameWithoutExt.startsWith('_') && !list.find(o => o.isDirectory && o.fileNameWithoutExt === item.fileNameWithoutExt)) {
        const route = {};
        Object.assign(route, item);
        delete route["isDirectory"];
        delete route["fileNameWithoutExt"];
        routes.push(route);
      }
    }
    else {
      routes.push(...getPlainRoutes(item.children));
    }
  });
  return routes;
}

function getLayouts(list) {
  const layouts = [];
  list.forEach(item => {
    if (!item.isDirectory) {
      if (item.fileNameWithoutExt.startsWith('_')) {
        const layout = {
          children: []
        };
        Object.assign(layout, item);
        layouts.push(layout);
      }
    }
    else {
      layouts.push(...getLayouts(item.children));
    }
  });
  return layouts;
}

function getMenus(dir, ext, list) {
  const menus = [];
  list.forEach(item => {
    const menu = {
      isDirectory: item.isDirectory,
      path: item.path,
      hidden: item.meta?.hidden,
      title: item.meta?.title,
      icon: item.meta?.icon,
      order: parseInt(item.meta?.order ?? 0)
    };
    menu.component = `^defineAsyncComponent(() => import('./${dir}/${menu.icon}${ext}'))$`
    if (menu.path === '') {
      menu.path = '/';
    }
    if (item.isDirectory) {
      const children = getMenus(dir, ext, item.children);
      if (item.meta?.title) {
        menu.children = children;
        menus.push(menu);
      }
      else {
        menus.push(...children);
      }
    }
    else {
      if (!item.fileNameWithoutExt.startsWith('_') && !list.find(o => o.isDirectory && o.fileNameWithoutExt === item.fileNameWithoutExt)) {
        menus.push(menu);
      }
    }
  });
  sortMenus(menus);
  return menus;
}

function onFileChange(server, folder, file) {
  if (file.replaceAll('\\', '/').startsWith(folder)) {
    server.ws.send({
      type: 'full-reload',
    });
  }
}

function sortMenus(list) {
  list.sort((a, b) => a.order - b.order);
  list.forEach(item => {
    if (item.children) {
      sortMenus(item.children);
    }
  });
}

function getPath(dir) {
  return path.resolve(process.cwd(), dir).replaceAll('\\', '/');
}

function getDescriptor(file) {
  const componentSource = fs.readFileSync(getPath(file), 'utf8');
  const descriptor = parse(componentSource, {
    pad: 'space',
  }).descriptor;
  return descriptor;
}

function vuePages(config = {}) {
  const options = { pageDir: 'src/pages', pageExt: ".vue", iconDir: 'src/assets/icons', iconExt: ".svg" };
  Object.assign(options, config);
  console.log(options);
  const pagesRootDir = getPath(options.pageDir)
  const pluginName = 'vite-plugin-vue-pages';
  const virtualModuleId = 'virtual:vuepages';
  return {
    name: pluginName,
    enforce: 'pre',
    resolveId(source) {
      if (source === virtualModuleId) {
        return source;
      }
      return null;
    },
    load(id) {
      if (id === virtualModuleId) {
        const list = parseFiles(options.pageDir, options.pageDir, options.pageExt);
        console.log('list:');
        console.log(JSON.stringify(list, null, 2));
        const routes = getRoutes(list);
        console.log('routes:');
        console.log(JSON.stringify(routes, null, 2));
        const menus = getMenus(options.iconDir, options.iconExt, list);
        console.log('menus:');
        console.log(JSON.stringify(menus, null, 2));
        const source = `import { defineAsyncComponent } from "vue";\n\nconst routes = [\n${routes
          .map((o) => JSON.stringify(o, null, 2))
          .join(',\n')
          }];\n\nconst menus = [\n${menus
            .map((o) => JSON.stringify(o, null, 2))
            .join(',\n')
          }];\n\nexport { routes, menus };`
          .replaceAll('"^', '')
          .replaceAll('$"', '');
        return source;
      }
      return null;
    },
    configureServer(server) {
      server.watcher.on('unlink', async (file) => {
        onFileChange(server, pagesRootDir, file);
      });
      server.watcher.on('add', async (file) => {
        onFileChange(server, pagesRootDir, file);
      });
      server.watcher.on('change', async (file) => {
        onFileChange(server, pagesRootDir, file);
      });
    },
  };
}
export default vuePages;
