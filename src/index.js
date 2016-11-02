import React, {Component, PropTypes, Children} from 'react';
import GridBreakpoint from 'grid-breakpoint';

export default class GridDraggable extends Component {
  constructor(props) {
    super(props);
    this.swapGrid = this.swapGrid.bind(this);

    const childrenWithProps = Children.map(this.props.children,
      (child, i) => React.cloneElement(child, {
        dragStart: props.dragStart,
        onDrag: props.onDrag,
        dragStop: props.dragStop,
        swapGrid: this.swapGrid,
        gridKey: i
      })
    );

    this.state = {
      children: Children.toArray(childrenWithProps)
    };
  }

  static propTypes = {
    children: PropTypes.any,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func
  };

  swapGrid(fromKey, toKey) {
    const {children} = this.state;
    // create new array for children.
    const newChildren = children.slice();

    if (fromKey !== undefined && toKey !== undefined) {
      const fromIndex = children.findIndex(child =>
        child.props.gridKey === fromKey);
      const toIndex = children.findIndex(child =>
        child.props.gridKey === toKey);
      const tmp = newChildren[fromIndex];
      newChildren[fromIndex] = newChildren[toIndex];
      newChildren[toIndex] = tmp;
    }

    console.log('swap', fromKey, toKey)

    this.setState({
      children: newChildren
    });
  }

  render() {
    const {children, dragStart, onDrag, dragStop, ...rest} = this.props; // eslint-disable-line
    const modifiedChildren = this.state.children;
    console.log(modifiedChildren)

    return (
      <GridBreakpoint {...rest}>
        {modifiedChildren}
      </GridBreakpoint>
    );
  }
}

export {default as Section} from './section';
