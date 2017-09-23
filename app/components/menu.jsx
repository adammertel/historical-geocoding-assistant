import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';


@observer
export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.defaultOpen
    }
  }

  style() {
    return {
      marginTop: 10,
      marginBottom: 10
    }
  }

  headerStyle() {
    return {
      display: 'inline-flex',
      cursor: 'pointer'

    }
  }

  styleContent() {
    return {
      marginLeft: 10
    }
  }

  toggleOpen() {
    this.setState({open: !this.state.open});
  }

  render() {
    const store = appStore;
    
    return (
      <div className="menu-wrapper" style={this.style()} >
        <div 
          className="menu-header" 
          style={this.headerStyle()} 
          onClick={this.toggleOpen.bind(this)}
        >
          <h4 className="menu-label" style={{fontWeight: 800, color: 'black'}} >{this.props.label}
          </h4>
          {
            this.props.icon ?
            (
              <span className="icon is-small" style={{color: this.props.iconColor}}>
                <i className={'fa fa-' + this.props.icon}></i>
              </span>
            ) : null
          }
          <span className="icon" >
            <i 
              className={this.state.open ? 'fa fa-caret-down' : 'fa fa-caret-right'} 
              style={{marginBottom: 10}}
            />
          </span>
        </div>
        <div className="menu-content" style={this.styleContent()}>
        {
          this.state.open ? this.props.children : null
        }
        </div>
      </div>
    )
  }
}