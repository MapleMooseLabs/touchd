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

var Touchd = function () {
  function Touchd(el) {
    _classCallCheck(this, Touchd);

    this.threshold = 200;
    this.el = (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' ? el : document.getElementById(el);
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

  _createClass(Touchd, [{
    key: 'resetTouches',
    value: function resetTouches() {
      this.touches = {
        touchstart: { x: -1, y: -1 },
        touchmove: { x: -1, y: -1 },
        touchend: false,
        direction: null
      };
    }
  }, {
    key: 'swipe',
    value: function swipe() {
      var e = new CustomEvent('swipe', { bubbles: false, cancelable: false, detail: { direction: this.touches.direction } });
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
      var e = new CustomEvent('tap', { bubbles: false, cancelable: false, detail: { direction: this.touches.direction } });
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

      if ((typeof event === 'undefined' ? 'undefined' : _typeof(event)) !== undefined) {
        if (_typeof(event.touches) !== undefined) {
          touch = event.touches[0];
          this.target = event.target;
          if (event.type === 'touchstart' || event.type === 'touchmove') {
            this.touches[event.type].x = touch.pageX;
            this.touches[event.type].y = touch.pageY;
          } else if (event.type === 'touchend') {

            this.touches[event.type] = true;

            if (this.touches.touchstart.x > -1 && this.touches.touchmove.x > -1) {
              // if there was any movement
              var deltaX = this.touches.touchstart.x - this.touches.touchmove.x;
              var deltaY = this.touches.touchstart.y - this.touches.touchmove.y;
              // check for swipe
              if (Math.abs(deltaX) >= this.threshold || Math.abs(deltaY) >= this.threshold) {
                if (this.prevents.swipe) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                }
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  // left or right
                  this.touches.direction = this.touches.touchstart.x < this.touches.touchmove.x ? 'right' : 'left';
                } else {
                  // up or down
                  this.touches.direction = this.touches.touchstart.y < this.touches.touchmove.y ? 'up' : 'down';
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
    key: 'threshold',
    value: function threshold(value) {
      if (value) {
        this.threshold = value;
      }
      return this.threshold;
    }
  }]);

  return Touchd;
}();

exports.default = Touchd;
module.exports = exports['default'];