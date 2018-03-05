/* eslint-disable no-console */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GridDraggable, {Section} from '../src';
import {range} from 'lodash';
import {Button, Modal} from 'antd';

import 'antd/dist/antd.css';

const list = range(20).map((col, i) => {
  return (
    <Section
      key={i}
      style={{width: '100%', height: '100px'}}
      handle=".handle"
      dragClassName="dragging">
      <div style={{width: '100%', height: '100px', backgroundColor: 'red'}} key={i}>
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
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    this.state = {
      visible: false
    };
  }

  showModal() {
    this.setState({
      visible: true
    });
  }
  handleOk() {
    this.setState({
      visible: false
    });
  }
  handleCancel() {
    this.setState({
      visible: false
    });
  }

  dragStart(e, data) {
    console.log('start: ', data);
  }

  onDrag(e, data, match) {
    console.log(e, data, match);
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
        <Button type="primary" onClick={this.showModal}>Open</Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
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
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo/>
, document.getElementById('root'));
