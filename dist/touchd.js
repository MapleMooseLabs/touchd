'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CustomEvent = function CustomEvent(name, props) {
  props = props || { bubbles: false, cancelable: false, detail: undefined };
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(name, props, props.cancelable, props.detail);
  return event;
};

CustomEvent.prototype = window.CustomEvent.prototype;
window.CustomEvent = CustomEvent;

var DEFAULT_OPTIONS = {
  swipeThreshold: 200,
  swipeTimeout: 500,
  panThreshold: 10
};

var Touchd = function () {
  function Touchd(el) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Touchd);

    this.swipeThreshold = options.swipeThreshold ? options.swipeThreshold : DEFAULT_OPTIONS.swipeThreshold;
    this.swipeTimeout = options.swipeTimeout ? options.swipeTimeout : DEFAULT_OPTIONS.swipeTimeout;
    this.panThreshold = options.panThreshold ? options.panThreshold : DEFAULT_OPTIONS.panThreshold;
    this.el = (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' ? el : document.getElementById(el);
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

  _createClass(Touchd, [{
    key: 'resetTouches',
    value: function resetTouches() {
      this.touches = {
        touchstart: { x: -1, y: -1, t: 0 },
        touchmove: { x: -1, y: -1, t: 0 },
        touchend: false,
        direction: null
      };
    }
  }, {
    key: 'delta',
    value: function delta() {
      return {
        x: this.touches.touchstart.x - this.touches.touchmove.x,
        y: this.touches.touchstart.y - this.touches.touchmove.y
      };
    }
  }, {
    key: 'direction',
    value: function direction() {
      var touches = this.touches;
      var delta = this.delta();
      var direction = void 0;

      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        // right or left
        direction = this.touches.touchstart.x < this.touches.touchmove.x ? 'right' : 'left';
      } else {
        // up or down
        direction = this.touches.touchstart.y < this.touches.touchmove.y ? 'down' : 'up';
      }
      return direction;
    }
  }, {
    key: 'pan',
    value: function pan() {
      var e = new CustomEvent('pan', { bubbles: false, cancelable: false, detail: { direction: this.direction(), delta: this.delta() } });
      e.initialTarget = this.target;
      this.el.dispatchEvent(e);
      if ('function' === typeof this.gestures.pan) {
        this.gestures.pan(e);
      }
    }
  }, {
    key: 'swipe',
    value: function swipe() {
      var e = new CustomEvent('swipe', { bubbles: false, cancelable: false, detail: { direction: this.direction(), delta: this.delta() } });
      e.initialTarget = this.target;
      this.el.dispatchEvent(e);
      if ('function' === typeof this.gestures.swipe) {
        this.gestures.swipe(e);
        this.resetTouches();
      }
    }
  }, {
    key: 'tap',
    value: function tap() {
      var e = new CustomEvent('tap', { bubbles: false, cancelable: false, detail: undefined });
      e.initialTarget = this.target;
      this.el.dispatchEvent(e);
      if ('function' === typeof this.gestures.tap) {
        this.gestures.tap(e);
        this.resetTouches();
      }
    }
  }, {
    key: 'handleTouch',
    value: function handleTouch(event) {
      var touch = void 0;
      var delta = this.delta();
      if ((typeof event === 'undefined' ? 'undefined' : _typeof(event)) !== undefined) {
        if (_typeof(event.touches) !== undefined) {
          touch = event.touches[0];
          this.target = event.target;
          if (event.type === 'touchstart' || event.type === 'touchmove') {
            this.touches[event.type].x = touch.pageX;
            this.touches[event.type].y = touch.pageY;
            this.touches[event.type].t = event.timeStamp;
            // console.log(this.panThreshold);
            if (event.type === 'touchmove' && (Math.abs(delta.x) >= this.panThreshold || Math.abs(delta.y) >= this.panThreshold)) {
              this.pan();
            }
          } else if (event.type === 'touchend') {
            var timeToSwipe = event.timeStamp - this.touches.touchstart.t;
            this.touches[event.type] = true;

            if (timeToSwipe <= this.swipeTimeout && (this.touches.touchstart.x > -1 && this.touches.touchmove.x > -1 || this.touches.touchstart.y > -1 && this.touches.touchmove.y > -1)) {
              // if there was any movement
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
  }, {
    key: 'init',
    value: function init() {
      this.resetTouches();
      this.el.addEventListener('touchstart', this.handleTouch.bind(this), false);
      this.el.addEventListener('touchmove', this.handleTouch.bind(this), false);
      this.el.addEventListener('touchend', this.handleTouch.bind(this), false);
    }
  }, {
    key: 'on',
    value: function on(event, cb, prevent) {
      this.gestures[event] = cb;
      this.prevents[event] = prevent || false;
    }
  }, {
    key: 'swipeThreshold',
    value: function swipeThreshold(value) {
      if (value) {
        this.swipeThreshold = value;
      }
      return this.swipeThreshold;
    }
  }]);

  return Touchd;
}();

exports.default = Touchd;
module.exports = exports['default'];