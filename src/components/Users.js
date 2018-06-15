import React, {Component} from 'react'
import Contract from '../contract';
import map from 'async/map';
import UserList from './UserList'

import {default as TruffleContract} from 'truffle-contract';


class Users extends Component {

    constructor(props) {
        super(props);

        this.state = {
            accounts: null,
            balancesEth: [],
            balancesStd: [],
            balancesGold: [],
            accountsInfo: [],
            accountsReward: [],
            accountsVoterInfo: []
        };

    }

    componentWillMount() {
        this.refreshAll();
    }

    refreshAll()
    {
        // Get the initial account balance so it can be displayed.
        Contract.web3RPC.eth.getAccounts( (err, accs) => {
            if (err) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length === 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            this.setState({
                accounts: accs
            });

            this.refreshBalances(accs);
            this.refreshRewards(accs);

        });

    }

    refreshBalances(accounts)
    {
        this.getBalancesEth(accounts);
        this.getBalancesStd(accounts);
        this.getBalancesGold(accounts);

    }

    refreshRewards(accounts)
    {
        // get instance
        Contract.GigBlack.deployed().then((instance) => {

            map(accounts, (account, callback)=>{

                instance.getAccountReward.call(account).then((value)=>{
                    callback(null, value);
                });

            }, (err, results) =>{
                const accountsReward = results.map((value)=>{
                    return {
                        reward: value[0].toNumber(),
                        total: value[1].toNumber()
                    };
                });

                this.setState ({accountsReward});

            });

        });
    }


    getBalancesEth(accounts) {

        // get ethereum balances
        map(accounts, (account, callback)=>{
            const balance = Contract.web3RPC.eth.getBalance(account);
            callback(null, balance);
        }, (err,results)=>{

            const balancesEth = results.map((value)=>{
                return Contract.web3RPC.fromWei(value.toNumber(), "ether");
            });

            this.setState({
                balancesEth
            });


        });
    }

    getBalancesStd (accounts) {

        // get instance
        Contract.GigBlack.deployed().then((instance) => {

            map(accounts, (account, callback)=>{
                instance.balanceOf.call(account).then((value)=>{
                    callback(null, value);
                });
            }, (err, results) =>{
                const balancesStd = results.map((value)=>{
                    return Contract.fromGig(value.toNumber());
                });

                this.setState({
                    balancesStd
                });


            });
        });
    }

    getBalancesGold (accounts) {

        // get instance
        Contract.GigGold.deployed().then((instance) => {

            map(accounts, (account, callback)=>{
                instance.balanceOf.call(account).then((value)=>{
                    callback(null, value);
                });
            }, (err, results) =>{
                const balancesGold = results.map((value)=>{
                    return Contract.fromGig(value.toNumber());
                });

                this.setState({
                    balancesGold
                });

            });
        });
    }

    render() {

        return (
            <div>

                <h3>Users</h3>

                <div className="grid">
                    <UserList accounts={this.state.accounts}
                              balancesEth={this.state.balancesEth}
                              balancesStd={this.state.balancesStd}
                              balancesGold={this.state.balancesGold}
                              accountsInfo={this.state.accountsInfo}
                              accountsReward={this.state.accountsReward}
                    />
                </div>

            </div>
        );
    }
}

export default Users;