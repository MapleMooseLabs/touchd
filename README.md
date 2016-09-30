# Touchd

A lightweight (3kb minified) library for handling touch events.

## Usage

Install with NPM: `npm install --save touchd`

Or clone/download the repo and copy `dist/touchd.js` to your project folder.

---
## Methods
Touchd doesn't have many methods (yet), but the ones currently available are as follows:

### `Touchd(el, options)` - create new Touchd instance

- `el` (***required***) - Node Element element ID to apply Touchd events to
- `options` (***optional***) - an object to configure the following options:
  - `panThreshold` (***default:*** `10`) - distance to be moved before firing `pan` event
  - `swipeTimeout` (***default:*** `500`) - timeout from touchstart to touchend in milliseconds. If the time difference between touchstart and touchend is greater than this value, the swipe event will not fire
  - `swipeThreshold` (***default:*** `200`) - distance to be moved before firing `swipe` event

### `on(event, handler, prevent)`

- `event` - the 'type' of event to trigger (currently supports `pan`, `swipe` & `tap` events)
- `handler` - function to call when the event is triggered
- `prevent` - boolean (***default:***  `false`). This adds `preventDefault()` to default touch listeners


---
## Examples

Example with React Component:
```javascript
import React from 'react';
import Touchd from 'touchd';

export default class MyComponent extends React.Component {
  constructor(props) {
    // ...your code
  }

  // Should be called in or after componentDidMount()
  componentDidMount() {
    const element = document.getElementById('root');
    const touchd = new Touchd(element);

    touchd.on('swipe', (e) => {
      // do something with the event (e)
    });
  }
}
```

More to come.

---
## TODO

- better handling for `pan` - needs to handle switching directions
- available by default, rather than using `element = new Touchd(...)`
