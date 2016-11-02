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
    const {onDrag, matchGrid} = this.props; // eslint-disable-line react/prop-types
    const match = matchGrid({clientX: e.clientX, clientY: e.clientY});
    onDrag(e, data, match.length ? match : null);
  }

  handleStop(e, data) {
    const {dragStop} = this.props; // eslint-disable-line react/prop-types
    dragStop(e, data);

    // swap when stop!
    const grandParentNode = data.node.parentNode.parentNode;
    const fromKey = grandParentNode.children[0].getAttribute('data-grid-key');
    this.setState({
      dragging: false,
      fromKey,
      e
    });

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    const {e, fromKey, dragging} = this.state;
    if (prevState.dragging && !dragging) {
      this.props.swapGrid({clientX: e.clientX, clientY: e.clientY}, +fromKey);  // eslint-disable-line react/prop-types
    }
  }

  componentDidMount() {
    const {setBounding, gridKey} = this.props; // eslint-disable-line react/prop-types
    setBounding(+gridKey, this.refs.grid.getBoundingClientRect());
  }

  render() {
    const {children, gridKey} = this.props; // eslint-disable-line react/prop-types
    const {dragging} = this.state;

    return (
      <div ref="grid" role="draggable-grid" data-grid-key={gridKey}>
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
