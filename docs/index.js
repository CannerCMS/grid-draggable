import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GridDraggable, {Section} from '../src';
import {range} from 'lodash';

const list = range(20).map((col, i) => {
  return (
    <Section>
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

  onDrag(e, data) {
    console.log('drag: ', data);
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
