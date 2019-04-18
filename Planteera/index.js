class Smooth {
    constructor() {
      this.content = document.querySelector('[data-scroll-content]')
      this.elems = [...this.content.querySelectorAll('article')]
      
      this.cache = []
      
      this.init()
    }
    
    setHeight() {
      document.body.style.height = this.content.clientHeight + 300 + 'px'
    }
    
    setCache() {
      this.elems.forEach((elem) => {
        const elemCache = {}
        
        elemCache.el = elem
        elemCache.sy = 0
        elemCache.dy = elemCache.sy
        elemCache.ease = elem.dataset.ease
  
        this.cache.push(elemCache)
      })
    }
    
    scroll() {
      this.cache.forEach((el) => {
        el.sy = window.scrollY
      })
    }
    
    transformElem() {
      this.cache.forEach((elem, i) => {
        const ease = `0.1${i}`
        elem.dy = lerp(elem.dy, elem.sy, ease)
        elem.dy = Math.floor(elem.dy * 100) / 100;
        
        TweenMax.set(elem.el, { y: -elem.dy })
      })
  
      window.requestAnimationFrame(this.transformElem.bind(this))   
    }
    
    init() {
      this.setHeight()
      this.setCache()
      
      window.addEventListener('scroll', this.scroll.bind(this))
      window.requestAnimationFrame(this.transformElem.bind(this))
    }
  }
  
  const smooth = new Smooth()
  
  function lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }