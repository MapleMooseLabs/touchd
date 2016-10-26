const CustomEvent = (name, props) => {
  props = props || { bubbles: false, cancelable: false, detail: undefined };
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(name, props, props.cancelable, props.detail);
  return event;
};

CustomEvent.prototype = window.CustomEvent.prototype;
window.CustomEvent = CustomEvent;

const DEFAULT_OPTIONS = {
  swipeThreshold: 200,
  swipeTimeout: 500,
  panThreshold: 10,
};

class Touchd {

  constructor(el, options={}) {
    this.swipeThreshold = options.swipeThreshold ? options.swipeThreshold : DEFAULT_OPTIONS.swipeThreshold;
    this.swipeTimeout = options.swipeTimeout ? options.swipeTimeout : DEFAULT_OPTIONS.swipeTimeout;
    this.panThreshold = options.panThreshold ? options.panThreshold : DEFAULT_OPTIONS.panThreshold;
    this.el = (typeof el === 'object' ? el : document.getElementById(el));
    this.gestures = {
      pan: null,
      swipe: null,
      tap: null
    };

    this.prevents = {
      pan: false,
      swipe: false,
      tap: false
    };

    this.init();
  }

  resetTouches() {
    this.touches = {
      touchstart: { x: -1, y: -1, t: 0 },
      touchmove: { x: -1, y: -1, t: 0 },
      touchend: false,
      direction: null
    };
  }

  delta() {
    return {
      x: this.touches.touchstart.x - this.touches.touchmove.x,
      y: this.touches.touchstart.y - this.touches.touchmove.y
    };
  }

  direction() {
    const touches = this.touches;
    const delta = this.delta();
    let direction;

    if (Math.abs(delta.x) > Math.abs(delta.y)) { // right or left
      direction = (this.touches.touchstart.x < this.touches.touchmove.x ? 'right' : 'left');
    } else { // up or down
      direction = (this.touches.touchstart.y < this.touches.touchmove.y ? 'down' : 'up');
    }
    return direction;
  }

  pan() {
    const detail = {
      direction: this.direction(),
      delta: this.delta(),
      initialTarget: this.target
    };
    const e = new CustomEvent('pan', { bubbles: false, cancelable: true, detail: detail });

    this.el.dispatchEvent(e);
    if ('function' === typeof this.gestures.pan) {
      this.gestures.pan(e);
    }
  }

  swipe() {
    const detail = {
      direction: this.direction(),
      delta: this.delta(),
      initialTarget: this.target
    };
    const e = new CustomEvent('swipe', { bubbles: false, cancelable: true, detail: detail });

    this.el.dispatchEvent(e);
    if ('function' === typeof this.gestures.swipe) {
      this.gestures.swipe(e);
    }
    this.resetTouches();
  }

  tap() {
    const detail = {
      initialTarget: this.target
    };
    const e = new CustomEvent('tap', { bubbles: false, cancelable: true, detail: detail });

    this.el.dispatchEvent(e);
    if ('function' === typeof this.gestures.tap) {
      this.gestures.tap(e);
    }
    this.resetTouches();
  }

  handleTouch(event) {
    let touch;
    const delta = this.delta();
    if (typeof event !== undefined) {
      if (typeof event.touches !== undefined) {
        touch = event.touches[0];
        this.target = event.target;
        if (event.type === 'touchstart' || event.type === 'touchmove') {
          this.touches[event.type].x = touch.pageX;
          this.touches[event.type].y = touch.pageY;
          this.touches[event.type].t = event.timeStamp;
          
          if (event.type === 'touchmove' && (Math.abs(delta.x) >= this.panThreshold || Math.abs(delta.y) >= this.panThreshold)) {
            if (this.prevents.pan) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
            }
            this.pan();
          }
        } else if (event.type === 'touchend') {
          const timeToSwipe = event.timeStamp - this.touches.touchstart.t;
          this.touches[event.type] = true;

          if (timeToSwipe <= this.swipeTimeout && ((this.touches.touchstart.x > -1 && this.touches.touchmove.x > -1) || (this.touches.touchstart.y > -1 && this.touches.touchmove.y > -1))) { // if there was any movement
            // check for swipe
            if (Math.abs(delta.x) >= this.swipeThreshold || Math.abs(delta.y) >= this.swipeThreshold) {
              if (this.prevents.swipe) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
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

  swipeThreshold(value) {
    if (value) {
      this.swipeThreshold = value;
    }
    return this.swipeThreshold;
  }
}

export default Touchd;
