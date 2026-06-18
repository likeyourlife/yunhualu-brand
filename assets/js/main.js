/* ==========================================================================
   云华录品牌全案网站 · 主交互逻辑（main.js）
   Prototype Builder: 筑原型（Zhu）| 2026.06

   功能：移动端汉堡菜单切换、菜单链接点击收起、当前页面导航高亮、窗口 resize 处理
   技术：纯原生 JS，IIFE 模块化，不污染全局
   支持 prefers-reduced-motion
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. 移动端汉堡菜单切换
     ======================================================================== */

  var navToggle = document.querySelector('.nav-toggle');
  var navDrawer = document.querySelector('.nav-drawer');
  var body = document.body;

  var isMenuOpen = false;

  /**
   * 打开移动端抽屉菜单
   */
  function openMenu() {
    if (!navToggle || !navDrawer) return;
    isMenuOpen = true;
    navToggle.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('is-open');
    body.style.overflow = 'hidden';
  }

  /**
   * 关闭移动端抽屉菜单
   */
  function closeMenu() {
    if (!navToggle || !navDrawer) return;
    isMenuOpen = false;
    navToggle.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('is-open');
    body.style.overflow = '';
  }

  /**
   * 切换菜单状态
   */
  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // 绑定汉堡按钮点击事件
  if (navToggle) {
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMenu();
    });
  }

  // ESC 键关闭菜单
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
      if (navToggle) {
        navToggle.focus();
      }
    }
  });


  /* ========================================================================
     2. 点击菜单链接后自动收起菜单
     ======================================================================== */

  var drawerLinks = document.querySelectorAll('.nav-drawer-link');

  drawerLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  // 点击抽屉外部区域关闭菜单
  if (navDrawer) {
    navDrawer.addEventListener('click', function (e) {
      // 点击背景（非链接）时关闭
      if (e.target === navDrawer) {
        closeMenu();
      }
    });
  }


  /* ========================================================================
     3. 当前页面导航高亮
     根据 URL pathname 匹配导航链接
     ======================================================================== */

  function highlightCurrentNav() {
    var currentPath = window.location.pathname;
    var fileName = currentPath.split('/').pop() || 'index.html';

    // 处理首页特殊 case
    if (fileName === '' || fileName === 'index.html') {
      fileName = 'index.html';
    }

    // 桌面端导航链接
    var navLinks = document.querySelectorAll('.nav-link, .nav-drawer-link');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // 解析 href 中的文件名
      var hrefFileName = href.split('/').pop();

      // 跳过锚点链接
      if (href.startsWith('#')) return;

      // 移除已有的 active 类
      link.classList.remove('active');

      // 匹配逻辑
      if (hrefFileName === fileName) {
        link.classList.add('active');
      } else if (fileName === 'index.html' && (hrefFileName === 'index.html' || hrefFileName === '')) {
        link.classList.add('active');
      } else if (hrefFileName !== 'index.html' && fileName.indexOf(hrefFileName.replace('.html', '')) === 0) {
        // 模糊匹配：如 product.html 匹配 product 开头的路径
        link.classList.add('active');
      }
    });
  }

  highlightCurrentNav();


  /* ========================================================================
     4. 窗口 resize 时处理菜单状态
     桌面端自动关闭移动菜单
     ======================================================================== */

  var resizeTimer = null;

  function handleResize() {
    // 桌面端（≥768px）自动关闭移动抽屉菜单
    if (window.innerWidth >= 768 && isMenuOpen) {
      closeMenu();
    }
  }

  window.addEventListener('resize', function () {
    // 节流处理
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(handleResize, 150);
  });


  /* ========================================================================
     5. 移动端目录折叠（TOC Toggle）
     ======================================================================== */

  var tocToggle = document.querySelector('.toc-toggle');
  var tocContent = document.querySelector('.toc-content');

  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', function () {
      var expanded = tocToggle.getAttribute('aria-expanded') === 'true';

      if (expanded) {
        tocToggle.setAttribute('aria-expanded', 'false');
        tocContent.classList.remove('is-open');
      } else {
        tocToggle.setAttribute('aria-expanded', 'true');
        tocContent.classList.add('is-open');
      }
    });
  }


  /* ========================================================================
     6. 初始化——DOM 就绪后执行
     ======================================================================== */

  function init() {
    highlightCurrentNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
