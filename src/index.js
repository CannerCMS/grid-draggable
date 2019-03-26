// @flow
import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import GridBreakpoint from 'grid-breakpoint';
import pickBy from 'lodash.pickby';
import type Section from './section';
import type {ReactDraggableCallbackData} from './types';
const {Component} = React;

type DraggableProps = {
  children: React.ChildrenArray<React.Element<*>>,
  onSwap?: (number, number) => void,
  dragStart?: (MouseEvent, ReactDraggableCallbackData) => void,
  onDrag?: (MouseEvent, ReactDraggableCallbackData, ?MatchNode) => void,
  dragStop?: (MouseEvent, ReactDraggableCallbackData) => void
}

type MatchNode = ?{
  node: Array<HTMLDivElement>,
  ReactElement: React.Element<*>
}

type DraggableState = {
  children: Array<React.Element<*>>,
  ready: boolean
}

type BoundKey = {
  key: string,
  bound: DOMRect,
  ref: Section
}

class GridDraggable extends Component<DraggableProps, DraggableState> {
  constructor(props: DraggableProps) {
    super(props);
    (this: any).swapGrid = this.swapGrid.bind(this);
    (this: any).setBounding = this.setBounding.bind(this);
    (this: any).matchGrid = this.matchGrid.bind(this);
    (this: any).getMatchGrid = this.getMatchGrid.bind(this);
    (this: any).cloneChildren = this.cloneChildren.bind(this);
    (this: any).bounding = {};

    this.state = {
      children: [],
      ready: false
    };
  }

  container: ?HTMLDivElement
  prevBoundingKey: ? number

  bounding: {
    [string]: BoundKey
  }

  componentWillReceiveProps(nextProps: DraggableProps) {
    const childrenWithProps = this.cloneChildren(nextProps);

    this.setState({
      children: childrenWithProps
    });
  }

  cloneChildren(props: DraggableProps) {
    const that = this;

    const childrenWithProps = React.Children.map(props.children,
      (child, i) => {
        return React.cloneElement(child, {
          dragStart: props.dragStart,
          onDrag: props.onDrag,
          container: this.container,
          dragStop: props.dragStop,
          swapGrid: that.swapGrid,
          setBounding: that.setBounding,
          getMatchGrid: that.getMatchGrid,
          gridKey: i
        })
      }
    );

    return childrenWithProps;
  }

  componentDidMount() {
    const childrenWithProps = this.cloneChildren(this.props);
    this.setState({
      children: childrenWithProps,
      ready: true
    });
  }

  matchGrid(data: ReactDraggableCallbackData): Array<BoundKey> {
    if (this.container) {
      const {x, y} = data;
      const pickRect: {
        [string]: BoundKey
      } = pickBy(
        this.bounding,
        val =>
          val.bound &&
          (
            // chrome
            val.bound.constructor.name === 'ClientRect' ||
            // in firefox called DOMReact
            val.bound.constructor.name === 'DOMRect'
          )
      );

      // $FlowFixMe
      const containerBound = this.container.getBoundingClientRect();
      const {
        left: containerBoundLeft,
        top: containerBoundTop
      } = containerBound;

      // $FlowFixMe
      const currentNodeBounding = data.node.parentNode.getBoundingClientRect();
      const gridRectValues = Object.keys(pickRect).map(key => pickRect[key]);
      const filterGrid = gridRectValues.filter(val => {
        if (val && val.bound) {
          // get each grid's bounding
          const {left, top, width, height} = val.bound;

          // calculate grid position that relative to container
          const relativeTop = top - containerBoundTop;
          const relativeLeft = left - containerBoundLeft;
          const currentRelativeTop = currentNodeBounding.top - containerBoundTop;
          const currentRelativeLeft = currentNodeBounding.left - containerBoundLeft;
          const newPositionX = currentRelativeLeft + x;
          const newPositionY = currentRelativeTop + y;
          if (
            (newPositionX >= relativeLeft && newPositionX <= (relativeLeft + width) &&
            newPositionY >= relativeTop && newPositionY <= (relativeTop + height))
            || ((newPositionX + currentNodeBounding.width) <= (relativeLeft + width) && (newPositionX + currentNodeBounding.width) >= relativeLeft &&
            (newPositionY  + currentNodeBounding.height) <= (relativeTop + height) && (newPositionY + currentNodeBounding.height) >= relativeTop)
          ) {
            return true;
          }
        }

        return false;
      });

      return filterGrid;
    }

    return [];
  }

  getMatchGrid(data: ReactDraggableCallbackData): MatchNode {
    const filterGrid = this.matchGrid(data);
    const allGridEle: Array<HTMLDivElement> = Array.prototype.slice.call(
                          document.querySelectorAll('[data-grid-key]'));

    if (filterGrid.length) {
      const matchNode = filterGrid.map(grid => {
        const key = grid.key;
        return {
          key: +key,
          node: allGridEle.filter(node => {
            return +node.getAttribute('data-grid-key') === key; // eslint-disable-line no-implicit-coercion
          }),
          ReactElement: this.state.children[+key]
        };
      });

      const currentBoundingKey = matchNode[matchNode.length - 1].key;

      // call unmatch method to remove previous match element
      if (
        this.prevBoundingKey !== undefined
        && this.prevBoundingKey !== null
        && currentBoundingKey !== this.prevBoundingKey) {
        this.bounding[`__bounding${this.prevBoundingKey}`].ref.unmatch();
      }

      if (currentBoundingKey !== this.prevBoundingKey) {
        // call match method in section
        this.bounding[`__bounding${currentBoundingKey}`].ref.match();
        // set current match key to prev
        this.prevBoundingKey = currentBoundingKey
      }

      return matchNode[matchNode.length - 1];
    }


    return null;
  }

  swapGrid(data: ReactDraggableCallbackData, fromKey: number) {
    const {onSwap} = this.props;
    const {children} = this.state;
    const filterGrid = this.matchGrid(data);

    if (filterGrid.length > 0) {
      // create new array for children.
      const newChildren = children.slice();
      const toKey = filterGrid[0].key;

      if (fromKey !== undefined && toKey !== undefined) {
        const fromIndex = children.findIndex(child =>
          child.props.gridKey === fromKey);
        const toIndex = children.findIndex(child =>
          child.props.gridKey === toKey);
        const tmp = newChildren[fromIndex];
        newChildren[fromIndex] = newChildren[toIndex];
        newChildren[toIndex] = tmp;

        if (onSwap) {
          onSwap(fromIndex, toIndex);
        }
      }

      this.setState({
        children: newChildren
      });
    }
  }

  setBounding(key: string, bound: DOMRect, ref: Section) {
    this.bounding[`__bounding${key}`] = {
      key,
      bound,
      ref
    };

    if (this.prevBoundingKey !== undefined && this.prevBoundingKey !== null) {
      this.bounding[`__bounding${this.prevBoundingKey}`].ref.unmatch();
      this.prevBoundingKey = undefined;
    }
  }

  render() {
    const {children, dragStart, onDrag, dragStop, ...rest} = this.props; // eslint-disable-line
    const modifiedChildren = this.state.children;
    return (
      <div
        ref={parent => {
          this.container = parent;
        }}>
        <GridBreakpoint {...rest}>
          {modifiedChildren}
        </GridBreakpoint>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(GridDraggable);
export {default as Section} from './section';
