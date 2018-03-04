// @flow
import * as React from 'react';
import Draggable from 'react-draggable';
import type {Mouse} from './types';
const noop = (arg: any) => (arg: any); // eslint-disable-line

type SectionProps = {
  children: React.ChildrenArray<React.Element<*>>,
  setBounding: (key: string, bound: DOMRect) => void,
  getMatchGrid: (mouse: Mouse) => void,
  dragStart: (MouseEvent, ReactDraggableCallbackData) => void,
  onDrag: (MouseEvent, ReactDraggableCallbackData, ?Array<HTMLDivElement>) => void,
  dragStop: (MouseEvent, ReactDraggableCallbackData) => void,
  swapGrid: (mouse: Mouse, fromKey: number) => void,
  className: string,
  gridKey: string,
  style: {[string]: any},
  dragClassName: string,
  handle: string
}

type SectionState = {
  dragging: boolean,
  fromKey: ?string,
  e: ?MouseEvent
}

type ReactDraggableCallbackData = {
  node: HTMLElement,
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
  lastX: number,
  lastY: number
};

export default class Section extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props);

    (this: any).handleStart = this.handleStart.bind(this);
    (this: any).handleDrag = this.handleDrag.bind(this);
    (this: any).handleStop = this.handleStop.bind(this);
    (this: any).setBounding = this.setBounding.bind(this);

    this.state = {
      dragging: false,
      fromKey: null,
      e: null
    };
  }

  static defaultProps = {
    dragStart: noop,
    onDrag: noop,
    dragStop: noop
  };

  handleStart(e: MouseEvent, data: ReactDraggableCallbackData) {
    this.setState({dragging: true});
    this.props.dragStart(e, data);
  }

  handleDrag(e: MouseEvent, data: ReactDraggableCallbackData) {
    const {onDrag, getMatchGrid} = this.props; // eslint-disable-line react/prop-types
    const match = getMatchGrid({clientX: e.clientX, clientY: e.clientY});
    onDrag(e, data, match);
  }

  handleStop(e: MouseEvent, data: ReactDraggableCallbackData) {
    const {dragStop} = this.props; // eslint-disable-line react/prop-types
    dragStop(e, data);

    // swap when stop!
    // $FlowFixMe
    const grandParentNode = ((data.node.parentNode: HTMLElement).parentNode: HTMLElement);
    const fromKey = grandParentNode.children[0].getAttribute('data-grid-key');
    this.setState({
      dragging: false,
      fromKey,
      e
    });

    return false;
  }

  componentDidUpdate(prevProps: SectionProps, prevState: SectionState) {
    const {e, fromKey, dragging} = this.state;
    if (prevState.dragging && !dragging && fromKey && e) {
      this.props.swapGrid({clientX: e.clientX, clientY: e.clientY}, +fromKey);
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
    setBounding(gridKey, this.refs.grid.parentNode.getBoundingClientRect());
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
