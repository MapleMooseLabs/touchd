const CustomEvent = (name, props) => {
  props = props || { bubbles: false, cancelable: false, detail: undefined };
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(name, props, props.cancelable, props.detail);
  return event;
};

CustomEvent.prototype = window.CustomEvent.prototype;
window.CustomEvent = CustomEvent;

class Touchd {

  constructor(el) {
    this.threshold = 200;
    this.el = (typeof el === 'object' ? el : document.getElementById(el));
    this.gestures = {
      swipe: null,
      tap: null
    };

    this.prevents = {
      swipe: false,
      tap: false
    };

    this.init();
  }

  resetTouches() {
    this.touches = {
      touchstart: { x: -1, y: -1 },
      touchmove: { x: -1, y: -1 },
      touchend: false,
      direction: null
    };
  }

  swipe() {
    const e = new CustomEvent('swipe', { bubbles: false, cancelable: false, detail: { direction: this.touches.direction }});
    e.initialTarget = this.target;
    this.el.dispatchEvent(e);
    if ('function' === typeof this.gestures.swipe) {
      this.gestures.swipe(e);
      this.resetTouches();
    }
  }

  tap() {
    const e = new CustomEvent('tap', { bubbles: false, cancelable: false, detail: { direction: this.touches.direction }});
    e.initialTarget = this.target;
    this.el.dispatchEvent(e);
    if ('function' === typeof this.gestures.tap) {
      this.gestures.tap(e);
      this.resetTouches();
    }
  }

  handleTouch(event) {
    let touch;

    if (typeof event !== undefined) {
      if (typeof event.touches !== undefined) {
        touch = event.touches[0];
        this.target = event.target;
        if (event.type === 'touchstart' || event.type === 'touchmove') {
          this.touches[event.type].x = touch.pageX;
          this.touches[event.type].y = touch.pageY;
        } else if (event.type === 'touchend') {

          this.touches[event.type] = true;

          if (this.touches.touchstart.x > -1 && this.touches.touchmove.x > -1) { // if there was any movement
            const deltaX = this.touches.touchstart.x - this.touches.touchmove.x;
            const deltaY = this.touches.touchstart.y - this.touches.touchmove.y;
            // check for swipe
            if (Math.abs(deltaX) >= this.threshold || Math.abs(deltaY) >= this.threshold) {
              if (this.prevents.swipe) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              }
              if (Math.abs(deltaX) > Math.abs(deltaY)) { // left or right
                this.touches.direction = (this.touches.touchstart.x < this.touches.touchmove.x ? 'right' : 'left');
              } else { // up or down
                this.touches.direction = (this.touches.touchstart.y < this.touches.touchmove.y ? 'up' : 'down');
              }

              this.swipe();
            }
          } else {
            if (this.prevents.tap) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
            }
            this.tap();
          }

        }
      }
    }
  }

  init() {
    this.resetTouches();
    this.el.addEventListener('touchstart', this.handleTouch.bind(this), false);
		this.el.addEventListener('touchmove', this.handleTouch.bind(this), false);
		this.el.addEventListener('touchend', this.handleTouch.bind(this), false);
  }

  on(event, cb, prevent) {
    this.gestures[event] = cb;
    this.prevents[event] = prevent || false;
  }

  threshold(value) {
    if (value) {
      this.threshold = value;
    }
    return this.threshold;
  }
}

export default Touchd;
