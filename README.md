# grid-draggable [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Draggable grid system

## Installation

```sh
$ npm install --save grid-draggable
```

## Usage

**IMPORTANT NOTE:** You need to use `webpack` as build tool, cause the grid system is based on [react-flexbox-grid](https://github.com/roylee0704/react-flexbox-grid), it'll load [flexboxgrid](https://github.com/kristoferjoseph/flexboxgrid) via `style-loader` and `css-loader` make sure you installed both of them.


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
