import React, {Component} from 'react'

import './../css/ConfirmTxDialog.css'

export default class ConfirmTxDialog extends Component {

    render() {

        const value=String(this.props.value);
        const gas=String(this.props.gas);
        const balanceAfter=this.props.balanceAfter;

        if(!this.props.show) {
            return null;
        }

        return (
            <div className="modal-dialog">
                <div className="modal-dialog-root">
                    <div className="modal-dialog-header">
                        <h3>
                            <span>Transfer ETH</span>
                        </h3>
                    </div>
                    <div className="modal-dialog-content">
                        <div>
                            <table>
                                <tbody>
                                <tr>
                                    <td><span>To</span></td>
                                    <td>{this.props.to}</td>
                                </tr>
                                <tr>
                                    <td><span>Value</span></td>
                                    <td>
                                            <span className="token-value-root">
                                                <span className="token-value">{value}</span>
                                            </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>Fee</span></td>
                                    <td>
                                            <span className="token-value-root">
                                                <span>≈ </span>
                                                <span className="token-value">{gas} ETH</span>
                                            </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span>Balance after</span></td>
                                    <td>
                                            <span className="token-value-root">
                                                <span>≈ </span>
                                                <span className="token-value">{balanceAfter} ETH</span>
                                            </span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-dialog-footer">
                        <button className="dialog-btn cancel-dialog-btn" onClick={this.props.onClose}>Cancel</button>
                        <button className="dialog-btn confirm-dialog-btn">Confirm</button>
                    </div>
                    <a className="modal-dialog-close" onClick={this.props.onClose}>
                        <i className="glyphicon glyphicon-remove"> </i>
                    </a>
                </div>
                <div className="modal-dialog-backdrop" onClick={this.props.onClose}> </div>
            </div>
        )
    }
}