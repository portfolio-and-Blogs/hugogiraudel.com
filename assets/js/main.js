(function (global) {
  var ANALYTICS_URL = '//www.google-analytics.com/ga.js'
  var ADS_URL = '//engine.carbonads.com/z/24598/azcarbon_2_1_0_HORIZ'
  var CODEPEN_URL = '//codepen.io/assets/embed/ei.js'
  var SASSMEISTER_URL = '//static.sassmeister.com/js/embed.js'
  var DISQUS_URL = '//{shortname}.disqus.com/embed.js'
  var ANALYTICS_OPTIONS = [
    ['_setAccount','UA-30333387-2'],
    ['_trackPageview']
  ]
  var DISQUS_OPTIONS = {
    name: 'hugogiraudel',
    title: false,
    url: window.location.href
  }
  var TOC_SELECTOR = '.article h2[id]'
  var CONTAINER_SELECTOR = '.container'
  var ARTICLE_PAGE_SELECTOR = '.article'
  var TOC_ANCHOR_SELECTOR = '.post-date'

  function $ (selector, context) {
    var nodes = (context || document).querySelectorAll(selector)
    if (!nodes.length) return null
    if (nodes.length === 1) return nodes[0]
    return Array.prototype.slice.call(nodes)
  }

  function isArticlePage () {
    return document.querySelector(ARTICLE_PAGE_SELECTOR)
  }

  function isLargeScreen () {
    return window.matchMedia('(min-width: 750px').matches
  }

  function getContainerWidth () {
    var container = $(CONTAINER_SELECTOR)
    if (!container) return 0
    return container.offsetWidth - (40 * 2)
  }

  function insertAfter(node, anchor) {
    if (anchor && anchor.nextSibling) {
      anchor.parentNode.insertBefore(node, anchor.nextSibling)
    } else {
      anchor.parentNode.appendChild(node)
    }
  }

  function getToCMarkup () {
    var headings = $(TOC_SELECTOR)

    if (headings.length === 0) {
      return ''
    }

    var items = headings.map(function (heading) {
      var content = heading.innerText
      var href = '#' + heading.id
      var text = content.substr(0, content.length - 1)

      return '<a href="' + href + '">' + text + '</a>'
    })
    
    return '<ol>'
      + '<li>'
      + items.join('</li><li>')
      + '</li>'
      + '</ol>'
  }

  function createToC () {
    var anchor = $(TOC_ANCHOR_SELECTOR),
        nav  = document.createElement('nav'),
        frag = document.createDocumentFragment()
    
    nav.setAttribute('role', 'navigation')
    nav.innerHTML = getToCMarkup()
    frag.appendChild(nav)
    
    insertAfter(frag, anchor)
  }

  function gridifyImage (image) {
    var containerWidth = getContainerWidth()
    var i = new Image()

    i.onload = function () {
      var height = i.height
      var width = Math.min(i.width, containerWidth)
      var height = i.width > containerWidth
        ? containerWidth * i.height / i.width
        : i.height
      var roundedHeight = (Math.round(height / 40) * 40)

      image.style.width = width + 'px'
      image.style.height = roundedHeight + 'px'
    }

    i.src = image.src
  }

  function gridifyImages () {
    var images = $('.main img')
    Array.prototype.forEach.call(images, gridifyImage)
  }

  function loadAnalytics (callback) {
    global._gaq = ANALYTICS_OPTIONS
    loadJS(ANALYTICS_URL, callback)
  }

  function loadAds (callback) {
    loadJS(ADS_URL, callback)
  }

  function loadComments (options, callback) {
    global.disqus_shortname = options.name
    global.disqus_url = options.url
    global.disqus_title = options.title

    var url = DISQUS_URL.replace('{shortname}', disqus_shortname)

    $('#disqus_thread') && loadJS(url, callback)
  }

  function loadCodePen (callback) {
    $('.codepen') && loadJS(CODEPEN_URL, callback)
  }

  function loadSassMeister (callback) {
    $('.sassmeister') && loadJS(SASSMEISTER_URL, callback)
  }
  
  function extend (obj, extObj) {
    obj = obj || {};
    if (arguments.length > 2) {
      for (var a = 1; a < arguments.length; a++) {
        global.extend(obj, arguments[a])
      }
    } else {
      for (var i in extObj) {
        obj[i] = extObj[i]
      }
    }
    return obj
  }
  
  function App (options) {
    var shouldLoadComments = options.loadComments || true
    var shouldCreateToC = isArticlePage() && options.createToC || false
    var shouldGridifyImages = isArticlePage() && isLargeScreen()
    var disqusOptions = extend(DISQUS_OPTIONS, options.disqusOptions)

    loadAnalytics()
    loadAds()
    loadSassMeister()
    loadCodePen()

    shouldLoadComments && loadComments(disqusOptions)
    shouldCreateToC && createToC()
    shouldGridifyImages && window.addEventListener('resize', gridifyImages)
  }

  global.App = App;

}(window));