// @flow
import * as React from 'react';
import Draggable from 'react-draggable';
import type {ReactDraggableCallbackData} from './types';
const noop = (arg: any) => (arg: any); // eslint-disable-line

type SectionProps = {
  children: React.ChildrenArray<React.Element<*>>,
  setBounding: (key: string, bound: DOMRect, ref: Section) => void,
  dragStart: (MouseEvent, ReactDraggableCallbackData) => void,
  getMatchGrid: (data: ReactDraggableCallbackData) => void,
  onDrag: (MouseEvent, ReactDraggableCallbackData, ?Node) => void,
  dragStop: (MouseEvent, ReactDraggableCallbackData) => void,
  swapGrid: (data: ReactDraggableCallbackData, fromKey: number) => void,
  container: HTMLDivElement,
  className: string,
  gridKey: string,
  style: {[string]: any},
  dragClassName: string,
  handle: string
}

type SectionState = {
  dragging: boolean,
  match: boolean,
  fromKey: ?string,
  data: ?ReactDraggableCallbackData
}


export default class Section extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props);

    (this: any).handleStart = this.handleStart.bind(this);
    (this: any).handleDrag = this.handleDrag.bind(this);
    (this: any).handleStop = this.handleStop.bind(this);
    (this: any).setBounding = this.setBounding.bind(this);

    this.state = {
      dragging: false,
      match: false,
      fromKey: null,
      data: null
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
    const {onDrag, getMatchGrid} = this.props;
    const match = getMatchGrid(data);
    onDrag(e, data, match);
  }

  handleStop(e: MouseEvent, data: ReactDraggableCallbackData) {
    const {dragStop} = this.props;

    // reset bounding
    this.setBounding();
    dragStop(e, data);

    // swap when stop!
    // $FlowFixMe
    const grandParentNode = ((data.node.parentNode: HTMLElement).parentNode: HTMLElement);
    const fromKey = grandParentNode.children[0].getAttribute('data-grid-key');
    this.setState({
      dragging: false,
      fromKey,
      data
    });

    return false;
  }

  componentDidUpdate(prevProps: SectionProps, prevState: SectionState) {
    const {data, fromKey, dragging} = this.state;
    if (prevState.dragging && !dragging && fromKey && data) {
      this.props.swapGrid(data, +fromKey);
    }
  }

  componentDidMount() {
    const {container} = this.props;
    container.addEventListener('mousedown', this.setBounding);
    window.addEventListener('resize', this.setBounding);
    this.setBounding();
  }

  componentWillUnmount() {
    const {container} = this.props;
    container.removeEventListener('mousedown', this.setBounding);
    window.removeEventListener('resize', this.setBounding);
  }

  setBounding() {
    const {setBounding, gridKey} = this.props;
    setBounding(gridKey, this.refs.grid.parentNode.getBoundingClientRect(), this);
  }

  match = () => {
    // if not dragging, set match to true
    if (!this.state.dragging) {
      this.setState({match: true});
    }
  }

  unmatch = () => {
    this.setState({match: false});
  }

  render() {
    const {
      children,
      gridKey,
      className,
      style,
      dragClassName,
      handle
    } = this.props;
    
    let wrappedChildren = children;
    const {dragging} = this.state;

    if (typeof children === 'function') {
      const renderedChildren = children(this.state)
      wrappedChildren = renderedChildren && React.Children.only(renderedChildren)
    }

    return (
      <div
        ref="grid"
        role="draggable-grid"
        data-grid-key={gridKey}
        className={className}
        style={{...style, position: 'relative'}}>
        {dragging && wrappedChildren}
        <Draggable
          defaultPosition={{x: 0, y: 0}}
          position={dragging ? null : {x: 0, y: 0}}
          handle={handle}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          <div
            style={dragging && {
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex:  200
            }}
            className={dragging ? dragClassName : null}>
            {wrappedChildren}
          </div>
        </Draggable>
      </div>
    );
  }
}
