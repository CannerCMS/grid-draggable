import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GridDraggable, {Section} from '../src';
import {range} from 'lodash';

const list = range(20).map((col, i) => {
  return (
    <Section key={i} style={{width: '100%', height: '100px'}}>
      <div style={{width: '100%', height: '100px'}} key={i}>{col}</div>
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
      <div>
        <h1>Try drag and drop the grids!</h1>
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
      </div>
    );
  }
}

ReactDOM.render(
  <Demo/>
, document.getElementById('root'));
