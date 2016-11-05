import React, {Component, PropTypes, Children} from 'react';
import GridBreakpoint from 'grid-breakpoint';
import {pickBy} from 'lodash';

export default class GridDraggable extends Component {
  constructor(props) {
    super(props);
    this.swapGrid = this.swapGrid.bind(this);
    this.setBounding = this.setBounding.bind(this);
    this.matchGrid = this.matchGrid.bind(this);
    this.getMatchGrid = this.getMatchGrid.bind(this);
    this.cloneChildren = this.cloneChildren.bind(this);
    this.bounding = {};

    const childrenWithProps = this.cloneChildren(props);

    this.state = {
      children: childrenWithProps
    };
  }

  static propTypes = {
    children: PropTypes.any,
    onSwap: PropTypes.func,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func
  };

  componentWillReceiveProps(nextProps) {
    const childrenWithProps = this.cloneChildren(nextProps);

    this.setState({
      children: childrenWithProps
    });
  }

  cloneChildren(props) {
    const that = this;
    const {children, ...rest} = props;
    const childrenWithProps = Children.map(children,
      (child, i) => React.cloneElement(child, {
        ...rest,
        swapGrid: that.swapGrid,
        setBounding: that.setBounding,
        getMatchGrid: that.getMatchGrid,
        gridKey: i
      })
    );

    return childrenWithProps;
  }

  matchGrid(mouse) {
    const {clientX, clientY} = mouse;
    const pickRect = pickBy(
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

  getMatchGrid(mouse) {
    const filterGrid = this.matchGrid(mouse);
    const allGridEle = Array.prototype.slice.call(
                          document.querySelectorAll('[data-grid-key]'));

    if (filterGrid.length) {
      const matchNode = filterGrid.map(grid => {
        const key = grid.key;
        return allGridEle.filter(node => {
          return +node.getAttribute('data-grid-key') === key; // eslint-disable-line no-implicit-coercion
        });
      });

      return matchNode[0];
    }

    return null;
  }

  swapGrid(mouse, fromKey) {
    const {onSwap} = this.props;
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

        onSwap(fromIndex, toIndex);
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
