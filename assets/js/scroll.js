/* ==========================================================================
   云华录品牌全案网站 · 滚动效果（scroll.js）
   Prototype Builder: 筑原型（Zhu）| 2026.06

   功能：阅读进度条更新、回到顶部按钮显隐、回到顶部平滑滚动、
        元素入场动画（IntersectionObserver）、节流处理
   技术：纯原生 JS，IIFE 模块化，不污染全局
   支持 prefers-reduced-motion
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     检查是否偏好减少动效
     ======================================================================== */

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     节流函数（Throttle）——使用 requestAnimationFrame
     ======================================================================== */

  var ticking = false;

  function requestTick(callback) {
    if (!ticking) {
      requestAnimationFrame(function () {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  }


  /* ========================================================================
     1. 阅读进度条（Reading Progress Bar）
     scroll 事件，计算百分比更新宽度
     ======================================================================== */

  var readingProgress = document.querySelector('.reading-progress');

  function updateReadingProgress() {
    if (!readingProgress) return;

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = 0;

    if (scrollHeight > 0) {
      progress = (scrollTop / scrollHeight) * 100;
      progress = Math.min(Math.max(progress, 0), 100);
    }

    readingProgress.style.width = progress + '%';
  }


  /* ========================================================================
     2. 回到顶部按钮（Back to Top）
     scrollTop > 300 时 fadeIn，否则 fadeOut
     ======================================================================== */

  var backToTopBtn = document.querySelector('.back-to-top');
  var SCROLL_THRESHOLD = 300;

  function updateBackToTopVisibility() {
    if (!backToTopBtn) return;

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > SCROLL_THRESHOLD) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }


  /* ========================================================================
     3. 回到顶部——点击平滑滚动
     ======================================================================== */

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();

      if (prefersReducedMotion) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }


  /* ========================================================================
     4. 滚动事件监听（合并节流）
     ======================================================================== */

  function onScroll() {
    requestTick(function () {
      updateReadingProgress();
      updateBackToTopVisibility();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ========================================================================
     5. 元素入场动画（Scroll Reveal）
     IntersectionObserver，元素进入视口时添加 .visible 类
     ======================================================================== */

  var revealElements = document.querySelectorAll('.reveal');

  function initScrollReveal() {
    if (revealElements.length === 0) return;

    // 如果偏好减少动效，直接显示所有元素
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 元素入场后停止观察，避免重复触发
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ========================================================================
     6. 茶语格线渐显动画（Tea Script Fade-in）
     Hero 区和篇章页头的茶语文字极缓慢淡入
     ======================================================================== */

  function initTeaScriptReveal() {
    var teaScriptElements = document.querySelectorAll('.tea-grid-bg-fade, .tea-grid-bg-dark, .hero-content');

    if (teaScriptElements.length === 0) return;

    if (prefersReducedMotion) {
      teaScriptElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    // 使用 IntersectionObserver 在元素进入视口时触发
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // 延迟触发，营造墨迹渐显感
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, 200);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2
      });

      teaScriptElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // 降级：直接显示
      teaScriptElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }


  /* ========================================================================
     7. ScrollSpy——侧边目录高亮当前章节
     滚动时高亮 TOC 中对应的章节链接
     ======================================================================== */

  function initScrollSpy() {
    var tocLinks = document.querySelectorAll('.toc-link');
    var sections = [];

    if (tocLinks.length === 0) return;

    // 收集所有 TOC 链接对应的章节
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var section = document.querySelector(href);
        if (section) {
          sections.push({
            link: link,
            section: section
          });
        }
      }
    });

    if (sections.length === 0) return;

    // 使用 IntersectionObserver 监听章节可见性
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // 移除所有 active
            tocLinks.forEach(function (l) {
              l.classList.remove('active');
            });

            // 找到对应的链接并高亮
            var matched = sections.find(function (s) {
              return s.section === entry.target;
            });

            if (matched) {
              matched.link.classList.add('active');
            }
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      });

      sections.forEach(function (s) {
        observer.observe(s.section);
      });
    }
  }


  /* ========================================================================
     8. 初始化——DOM 就绪后执行
     ======================================================================== */

  function init() {
    // 初始更新一次进度和按钮状态
    updateReadingProgress();
    updateBackToTopVisibility();

    // 初始化各类滚动效果
    initScrollReveal();
    initTeaScriptReveal();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
