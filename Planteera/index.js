class Smooth {
    constructor() {
      // Grab the node that contains the entire scrollable area
      this.content = document.querySelector('[data-scroll-content]')
      // Grab what we want to lerp / parallax scroll
      this.elems = [...this.content.querySelectorAll('article'), document.querySelector('nav')]
      
      this.cache = []
      
      // Initialize document, bind methods, start render loop
      this.init()
    }
    
    // Set the document height based on the height of the scrollable elements
    setHeight() {
      document.body.style.height = this.content.clientHeight + 1500 + 'px'
    }
    
    // Add metadata for each scrolling element
    setCache() {
      this.elems.forEach((elem) => {
        const elemCache = {}
        
        // The actual element
        elemCache.el = elem

        // Starting position
        elemCache.sy = 0

        // Changed position initialized as starting position
        elemCache.dy = elemCache.sy

        // wat
        elemCache.ease = elem.dataset.ease

        // element parallax value
        elemCache.parallax = 1;
        
        // Add this to the list of scrolling element objects
        this.cache.push(elemCache)
      })
    }
    
    // The event handler on when we scroll
    scroll() {
      // Iterate through scrolling element objects and update
      // metadata for the starting position
      this.cache.forEach((el) => {
        el.sy = window.scrollY
      })
    }
    
    // The render loop that animates the lerp scroll
    transformElem() {
      // Iterate through each object w/ index in mind
      this.cache.forEach((elem, i) => {
        // Calculate an ease value based on element index
        // ease will be used in lerp as the progress betweem
        // the two values
        const ease = `0.1${i}`

        // Calculate the element's change in position based
        // on the progress between the starting and changed
        // position
        elem.dy = lerp(elem.dy, elem.sy, ease)

        // Scale the scroll change up
        elem.dy = Math.floor(elem.dy * 100) / 100;
        
        // Set the actual change
        TweenMax.set(elem.el, { y: -elem.dy})
      })
  
      // After updating all scrolling element metadata
      // Animate the changes
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