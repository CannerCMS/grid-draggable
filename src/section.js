/* eslint-disable no-implicit-coercion */
import React, {Component, PropTypes} from 'react';
import Draggable from 'react-draggable';
const noop = arg => arg;

export default class Section extends Component {
  constructor(props) {
    super(props);

    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleStop = this.handleStop.bind(this);

    this.state = {
      dragging: false
    };
  }

  static propTypes = {
    children: PropTypes.any,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func
  };

  static defaultProps = {
    dragStart: noop,
    onDrag: noop,
    dragStop: noop
  };

  handleStart(e, data) {
    this.setState({dragging: true});
    this.props.dragStart(e, data);
  }

  handleDrag(e, data) {
    this.props.onDrag(e, data);
  }

  handleStop(e, data) {
    const {swapGrid, dragStop} = this.props; // eslint-disable-line react/prop-types
    this.setState({dragging: false});

    // swap when stop!
    const grandParentNode = data.node.parentNode.parentNode;
    const nextNode = grandParentNode.nextSibling;
    const prevNode = grandParentNode.previousSibling;

    const nextNodeWidth = nextNode &&
      nextNode.children[0].getAttribute('role') === 'draggable-grid' ?
      nextNode.clientWidth : null;
    const prevNodeWidth = prevNode &&
      prevNode.children[0].getAttribute('role') === 'draggable-grid' ?
      prevNode.clientWidth : null;

    const fromKey = grandParentNode.children[0].getAttribute('data-grid-key');
    if (nextNode && nextNodeWidth && data.x > nextNodeWidth) {
      // swap place with the next tab
      const nextKey = nextNode.children[0].getAttribute('data-grid-key');
      swapGrid(+fromKey, +nextKey);
    } else if (prevNode && prevNodeWidth && data.x < -prevNodeWidth) {
      // swap place with the previous tab
      const prevKey = prevNode.children[0].getAttribute('data-grid-key');
      swapGrid(+fromKey, +prevKey);
    }
    dragStop(e, data);
  }

  render() {
    const {children, gridKey} = this.props; // eslint-disable-line react/prop-types
    const {dragging} = this.state;

    return (
      <div role="draggable-grid" data-grid-key={gridKey}>
        {
          dragging ? (
            <div style={{position: 'absolute'}}>
              {children}
            </div>
          ) : null
        }
        <Draggable
          defaultPosition={{x: 0, y: 0}}
          position={dragging ? null : {x: 0, y: 0}}
          zIndex={100}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          <div>
            {children}
          </div>
        </Draggable>
      </div>
    );
  }
}
