# grid-draggable [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Draggable grid system

## Installation

```sh
$ npm install --save grid-draggable
```

## Usage

**IMPORTANT NOTE:** You need to import react-flexbox-grid's css in order to let it work correctly

Or add

```html
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/react-flexbox-grid@2.1.2/dist/react-flexbox-grid.css"/>
```

into your HTML.


```js
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GridDraggable, {Section} from 'GridDraggable';
import {range} from 'lodash';

const list = range(20).map((col, i) => {
  return (
    <Section key={i}>
      <div key={i}>{col}</div>
    </Section>
  );
});

class Demo extends Component {
  constructor(props) {
    super(props);

    this.dragStart = this.dragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.dragStop = this.dragStop.bind(this);
  }

  dragStart(e, data) {
    console.log('start: ', data);
  }

  onDrag(e, data, match) {
    console.log('drag: ', data, match);
  }

  dragStop(e, data) {
    console.log('stop: ', data);
  }

  render() {
    return (
      <GridDraggable
        dragStart={this.dragStart}
        onDrag={this.onDrag}
        dragStop={this.dragStop}
        lg={4}
        md={3}
        xs={6}
        rowClassName="row-test"
        colClassName="col-test">
        {list}
      </GridDraggable>
    );
  }
}

ReactDOM.render(
  <Demo/>
, document.getElementById('root'));

```

## API

### `<GridDraggable/>`

`<GridDraggable/>` is a element that wraps all draggable sections. The children pass in this component **must** be `<Section/>`.

Like below:

```js
<GridDraggable {...props}>
  <Section/>
  <Section/>
  <Section/>
</GridDraggable>
```

**Props**:

| Name         | Type    | Default | Description |
| ------------ | ------- | ------- | ----------- |
| onSwap | (number, number) => void | undefined | When grid is swapping, this function will be called |
| dragStart | (MouseEvent, ReactDraggableCallbackData) => void | undefined | When grid is start dragging, this function will be called |
| onDrag | (MouseEvent, ReactDraggableCallbackData, ?MatchNode) => void | undefined | When grid is draggind, this function will be called |
| dragStop | (MouseEvent, ReactDraggableCallbackData) => void | undefined | When grid is stop dragging, this function will be called  |

Other props will directly pass to `grid-breakpoint` such as `lg`, `md`, `sm`, `sx` ... please reference to https://github.com/Canner/grid-breakpoint

### `<Section/>`

`<Section/>` is used to create a draggable section that adds draggability to its children. 

**Props**

| Name         | Type    | Default | Description |
| ------------ | ------- | ------- | ----------- |
| className | string | undefined | set className to the section |
| style | {[string]: any} | undefined | css styles |
| dragStyle | {[string]: any} | undefined | css styles for dragging element |
| dragClassName | string | undefined | When dragging the grid, it will clone the element and apply css classname `dragClassName` to this element. |
| handle | string | undefined | set your handler using css selector, pass string such as `.handle`  |

The child of `<Section/>` could **either be a function or react component**. The first parameter will pass `dragging`, and `match`, that allow you the ability to decide what component you would like to render when events like dragging and matched happened.

There's an example:

```js
<Section
  key={i}
  style={{width: '100%', height: '100%'}}
  handle=".handle" // set handler
  dragClassName="dragging">
  {({dragging, match}) => {
    if (match) return ( // when match return <div/>
      <div style={{color: 'red'}}>This is a match</div>
    );

    // create a react-motion animation, when dragging using animations.
    const motionStyle = dragging
    ? {
        scale: spring(1.1, springConfig),
        shadow: spring(16, springConfig)
      }
    : {
        scale: spring(1, springConfig),
        shadow: spring(1, springConfig)
      };

    return (
      <Motion style={motionStyle}>
        {({scale, shadow}) => (
            <div
              style={{
                boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                transform: `translate3d(0, 0, 0) scale(${scale})`,
                WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
              }}>
              <div>
                {col}
                <button className="handle">Click me to drag</button>
              </div>
            </div>
          )
        }
      </Motion>
    );
  }}
</Section>
```



## Start example server

```
npm start
```

## License

MIT © [Canner](https://github.com/canner)


[npm-image]: https://badge.fury.io/js/grid-draggable.svg
[npm-url]: https://npmjs.org/package/grid-draggable
[travis-image]: https://travis-ci.org/Canner/grid-draggable.svg?branch=master
[travis-url]: https://travis-ci.org/Canner/grid-draggable
[daviddm-image]: https://david-dm.org/Canner/grid-draggable.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Canner/grid-draggable
