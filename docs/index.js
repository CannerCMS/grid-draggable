/* eslint-disable no-console */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Motion, spring} from 'react-motion';

import GridDraggable, {Section} from '../src';
import {range} from 'lodash';

const springConfig = {stiffness: 300, damping: 50};

const list = range(20).map((col, i) => {
  return (
    <Section
      key={i}
      style={{width: '100%', height: '100%'}}
      handle=".handle"
      dragClassName="dragging">
      {({dragging, match}) => {
        if (match) return (
          <div style={{color: 'red'}}>This is a match</div>
        );

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
    console.log(match)
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
