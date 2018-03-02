import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GridDraggable, {Section} from '../src';
import {range} from 'lodash';

const list = range(20).map((col, i) => {
  return (
    <Section
      key={i}
      style={{width: '100%', height: '100px'}}
      handle=".handle"
      dragClassName="dragging">
      <div style={{width: '100%', height: '100px'}} key={i}>
        {col}
        <button className="handle">Click me to drag</button>
      </div>
    </Section>
  );
});

class Demo extends Component {
  constructor(props) {
    super(props);

    this.dragStart = this.dragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.dragStop = this.dragStop.bind(this);
    this.onSwap = this.onSwap.bind(this);
  }

  dragStart(e, data) {
    console.log('start: ', data);
  }

  onDrag(e, data, match) {
    // console.log('drag: ', data, match);
    if (match && match[0] !== data.node.parentNode) {
      this.match = match[0];
      match[0].style.backgroundColor = '#CCC';
    } else if (this.match) {
      this.match.style.backgroundColor = null;
      this.match = null;
    }
  }

  dragStop(e, data) {
    console.log('stop: ', data);
  }

  onSwap(from, to) {
    console.log(from, to);
  }

  render() {
    return (
      <div>
        <h1>Try drag and drop the grids! GridDraggable</h1>
        <GridDraggable
          dragStart={this.dragStart}
          onDrag={this.onDrag}
          dragStop={this.dragStop}
          onSwap={this.onSwap}
          lg={4}
          md={3}
          xs={6}
          rowClassName="row-test"
          colClassName="col-test">
          {list}
        </GridDraggable>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo/>
, document.getElementById('root'));
