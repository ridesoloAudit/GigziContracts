import React, { Component } from 'react';

const LoaderHOC = (propName) => (WrappedComponent) => {
    return class LoaderHOC extends Component {
        render() {
            return (!this.props[propName]) ? <div className="text-center"><img width="40px" height="40" src={require("../img/loader.svg")} alt="loader"/></div> : <WrappedComponent {...this.props}/>
        }
    }
};

export default LoaderHOC;