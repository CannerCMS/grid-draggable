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
    this.setBounding = this.setBounding.bind(this);

    this.state = {
      dragging: false
    };
  }

  static propTypes = {
    children: PropTypes.any,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    dragClassName: PropTypes.string,
    handle: PropTypes.string
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
    const {onDrag, getMatchGrid} = this.props; // eslint-disable-line react/prop-types
    const match = getMatchGrid({clientX: e.clientX, clientY: e.clientY});
    onDrag(e, data, match);
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
    window.addEventListener('scroll', this.setBounding);
    this.setBounding();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setBounding);
  }

  setBounding() {
    const {setBounding, gridKey} = this.props; // eslint-disable-line react/prop-types
    setBounding(+gridKey, this.refs.grid.parentNode.getBoundingClientRect());
  }

  render() {
    const {
      children,
      gridKey, // eslint-disable-line react/prop-types
      className,
      style,
      dragClassName,
      handle
    } = this.props;
    const {dragging} = this.state;

    return (
      <div
        ref="grid"
        role="draggable-grid"
        data-grid-key={gridKey}
        className={className}
        style={{...style, position: 'relative'}}>
        {
          dragging ? (
            <div>
              {children}
            </div>
          ) : (
            <div style={{opacity: 0}}>
              {children}
            </div>
          )
        }
        <Draggable
          defaultPosition={{x: 0, y: 0}}
          position={dragging ? null : {x: 0, y: 0}}
          handle={handle}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: dragging ? 200 : 100
            }}
            className={dragging ? dragClassName : null}>
            {children}
          </div>
        </Draggable>
      </div>
    );
  }
}
