import React, {Component} from 'react'

import User from './User'
import LoaderHOC from '../HOC/LoaderHOC';

class UserList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let accounts = this.props.accounts;

        const listItems = accounts.map((acc, index) =>
            <User
                key={index.toString()}
                address={acc}
                balanceEth={this.props.balancesEth[index]}
                balanceStd={this.props.balancesStd[index]}
                balanceGld={this.props.balancesGold[index]}
                userReward={this.props.accountsReward[index]}
                even={index%2}
                onSelectUser={this.props.onSelectUser}/>
        );

        return(
            <div>
                {listItems}
            </div>
        )
    }
}

export default LoaderHOC("accounts")(UserList)