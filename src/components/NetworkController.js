import React, {Component} from 'react'

import Contract from '../contract';

class NetworkController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            blockNumber: 0
        };

        let filter = Contract.web3RPC.eth.filter('latest');

        // watch for changes
        filter.watch((error, result) => {
            if (!error) {
                this.setState({
                    blockNumber: Contract.web3RPC.eth.blockNumber
                });

                if (this.props.onUpdate)
                    this.props.onUpdate();
            }
        });

    }

    render() {

        return (
            <div className="network-controller">
                <p>Current Block #{this.state.blockNumber}</p>
                {/*<Button bsStyle="success" onClick={`his.sendEth} >Send Eth</Button>*/}
            </div>
        );
    }
}

export default NetworkController;