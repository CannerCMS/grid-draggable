// @flow
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import flow from 'lodash/flow';
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
  className?: string,
  gridKey: string,
  style?: {[string]: any},
  dragStyle?: {[string]: any},
  dragClassName?: string,
  handle: string
}

type SectionState = {
  dragging: boolean,
  match: boolean,
  fromKey: ?string,
  data: ?ReactDraggableCallbackData
}

function dragSourceCollect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging(),
  }
}

const dragSourceSpec = {
  beginDrag(props) {
    return {
      ...props,
    }
  },
};

function dropTargetCollect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
  }
}

const dropTargetSpec = {
  canDrop(props, monitor) {
    const item = monitor.getItem();

    return item.gridKey !== props.gridKey;
  },
  drop(props, monitor) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return;
    }

    const item = monitor.getItem();
    const { gridKey: fromKey } = item;
    const { gridKey: toKey } = props;

    props.swapGrid(fromKey, toKey);

    return { moved: true };
  },
}

const childrenBlockStyle = {
  left: 0,
  position: 'absolute',
  top: 0,
  zIndex: 200,
};

class Section extends React.Component<SectionProps, SectionState> {
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

  getNodeByEventTarget(e) {
    return findDOMNode(e.target);
  }

  handleStart(e: MouseEvent) {
    const data = this.getNodeByEventTarget(e);
    this.setState({dragging: true});
    this.props.dragStart(e, data);
  }

  handleDrag(e: MouseEvent) {
    const node = this.getNodeByEventTarget(e);
    const nodeBoundingClientRect = node.getBoundingClientRect();
    const { x = 0, y = 0 } = nodeBoundingClientRect;
    const data = { node, x, y };
    const {onDrag, getMatchGrid} = this.props;
    const match = getMatchGrid(data);
    onDrag(e, data, match);
  }

  handleStop(e: MouseEvent) {
    const data = this.getNodeByEventTarget(e);
    const {dragStop} = this.props;

    // reset bounding
    this.setBounding();
    dragStop(e, data);

    // TODO(fredalai): Need to make sure have another way to get parentNode since someone situation will get the wrong
    const grandParentNode = (((data.parentNode: HTMLElement).parentNode: HTMLElement).parentNode: HTMLElement);
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
    const { connectDragPreview } = this.props
    if (connectDragPreview) {
      // Use empty image as a drag preview so browsers don't draw it
      // and we can draw whatever we want on the custom drag layer instead.
      connectDragPreview(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      })
    }

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
    setBounding(gridKey, this.grid.parentNode.getBoundingClientRect(), this);
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
      dragStyle,
      handle,
      connectDropTarget,
      connectDragSource,
      isDragging,
    } = this.props;

    let wrappedChildren = children;
    // const {dragging} = this.state;

    if (typeof children === 'function') {
      const renderedChildren = children(this.state)
      wrappedChildren = renderedChildren && React.Children.only(renderedChildren)
    }

    return connectDragSource(connectDropTarget(
      <div
        ref={grid => { this.grid = grid }}
        role="draggable-grid"
        data-grid-key={gridKey}
        className={className}
        style={{...style, position: 'relative'}}
      >
        <div
          className={isDragging ? dragClassName : null}
          draggable
          handle={handle}
          onDrag={this.handleDrag}
          onDragStart={this.handleStart}
          onDrop={this.handleStop}
          style={isDragging ? { ...dragStyle, ...childrenBlockStyle } : {}}
        >
          {wrappedChildren}
        </div>
      </div>
    ));
  }
}

export default flow(
  DragSource('SECTION', dragSourceSpec, dragSourceCollect),
  DropTarget('SECTION', dropTargetSpec, dropTargetCollect)
)(Section)
