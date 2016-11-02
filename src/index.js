import React, {Component, PropTypes, Children} from 'react';
import GridBreakpoint from 'grid-breakpoint';
import {pickBy} from 'lodash';

export default class GridDraggable extends Component {
  constructor(props) {
    super(props);
    const that = this;
    this.swapGrid = this.swapGrid.bind(this);
    this.setBounding = this.setBounding.bind(this);
    this.matchGrid = this.matchGrid.bind(this);
    this.bounding = {};

    const childrenWithProps = Children.map(this.props.children,
      (child, i) => React.cloneElement(child, {
        dragStart: props.dragStart,
        onDrag: props.onDrag,
        dragStop: props.dragStop,
        swapGrid: that.swapGrid,
        setBounding: that.setBounding,
        matchGrid: that.matchGrid,
        gridKey: i
      })
    );

    this.state = {
      children: childrenWithProps
    };
  }

  static propTypes = {
    children: PropTypes.any,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func
  };

  matchGrid(mouse) {
    const {clientX, clientY} = mouse;
    const pickRect = pickBy(
      this.bounding,
      val => val.bound && val.bound.constructor.name === 'ClientRect'
    );

    const gridRectValues = Object.values(pickRect);
    const filterGrid = gridRectValues.filter(val => {
      const {left, top, width, height} = val.bound;
      if (
        clientX >= left && clientX <= (left + width) &&
        clientY >= top && clientY <= (top + height)
      ) {
        return true;
      }

      return false;
    });

    return filterGrid;
  }

  swapGrid(mouse, fromKey) {
    const {children} = this.state;
    const filterGrid = this.matchGrid(mouse);

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
      }

      this.setState({
        children: newChildren
      });
    }
  }

  setBounding(key, bound) {
    this.bounding[`__bounding${key}`] = {
      key,
      bound
    };
  }

  render() {
    const {children, dragStart, onDrag, dragStop, ...rest} = this.props; // eslint-disable-line
    const modifiedChildren = this.state.children;
    return (
      <div>
        <GridBreakpoint {...rest}>
          {modifiedChildren}
        </GridBreakpoint>
      </div>
    );
  }
}

export {default as Section} from './section';
