import React, {Component} from 'react';
import { Nav, NavItem, Button, Tabs, Tab } from 'react-bootstrap';
import Contract from './contract';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import CentralAuthority from './components/CentralAuthority'
import Send from './components/Send'
import NetworkController from './components/NetworkController'

import Users from './components/Users'
import Configure from './components/Configure'
import Payout from './components/Payout'
import ConfirmTxDialog from './components/ConfirmTxDialog'


class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            txCount: 0,
            txAmount: 0,

            fromAddress: "",
            toAddress: "",
            selectFirst: true,

            tabActiveKey: "keyUsers",

            ModalOpen: false
        };



        Contract.init();

        this.onUpdate = this.onUpdate.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);
        this.handleSelect = this.handleSelect.bind(this);


        Contract.GigBlack.deployed().then((instance) => {

            let transfer = instance.Transfer({fromBlock: "latest"});

            transfer.watch((error, result) => {

                if (!error) {

                    // update txCount/txAmount

                    instance.getTxFeeCollector.call().then((address)=>{

                        instance.balanceOf.call(address).then((value)=>{
                            this.setState({
                                txAmount: Contract.fromGig(value),
                                txCount: value / Contract.config.txFee
                            })
                        });
                    });
                }
            });

            let events = instance.allEvents();
            // watch for changes
            events.watch(function(error, event){
                if (!error) {
                    if (event.event === "logEvent") {

                        let time = event.args.time;
                        let msg  = event.args.msg;
                        console.log(time + ": " + msg);
                    }
                }

            });
        });

    }

    toggleModal = () => {
        this.setState({
            ModalOpen: !this.state.ModalOpen
        });
    };

    onUpdate(){
        if (this.users)
            this.users.refreshAll();
    }

    onSelectUser(value)
    {

        if (this.state.selectFirst)
            this.setState({
                fromAddress : value,
                selectFirst: !this.state.selectFirst
            });
        else
            this.setState({
                toAddress : value,
                selectFirst: !this.state.selectFirst
            });
    }


    handleSelect(eventKey, event) {
        event.preventDefault();
        this.setState({tabActiveKey:eventKey});
    }

    render() {

        /*TODO properties of Modal Dialog were hardcoded*/
        const balance = 93.172131286999999999;
        const to = "0x11623702b7d8b26177f952dcff84a39e965a4710";
        const gas = 0.000462;
        const value = 55.41;
        const balanceAfter = balance - value;

        
        const keyUsers = (
            <div>   

                <div className="users-container">
                    <Users ref={ref => this.users = ref} onSelectUser={this.onSelectUser}/>
                </div>

                <div className="control-container">
                    <CentralAuthority onUpdate={this.onUpdate} txCount={this.state.txCount}
                                      txAmount={this.state.txAmount}/>
                    <Send onSend={this.onUpdate} fromAddress={this.state.fromAddress}
                          toAddress={this.state.toAddress}/>
                    <div className="text-center confirmtx-block">
                        <Button bsStyle="primary" onClick={this.toggleModal.bind(this)}>Tx Info</Button>
                    </div>
                    <ConfirmTxDialog
                        show={this.state.ModalOpen}
                        onClose={this.toggleModal}
                        to={to}
                        gas={gas}
                        value={value}
                        balanceAfter={balanceAfter}
                    />
                </div>

            </div>
        );
        
        
        const keyConfig = (
            <div className="users-container">
                <Configure />
            </div>
        );
        
        const keyPayout = (
            <div className="users-container">
                <Payout />
            </div>
        );
        
        const pages = {
            keyUsers,
            keyConfig,
            keyPayout
        };
        
        
        const currentTab = pages[this.state.tabActiveKey];
        
        
            
        return (

            <div className="page-container">

                <NetworkController onUpdate={this.onUpdate} />

                <Nav bsStyle="tabs" activeKey={this.state.tabActiveKey} className="tab-control" onSelect={this.handleSelect}>
                    <NavItem eventKey="keyUsers">Users</NavItem>
                    <NavItem eventKey="keyConfig">Configure</NavItem>
                    <NavItem eventKey="keyPayout">Payout</NavItem>
                </Nav>

                {currentTab}

            </div>
        );
    }
}

export default App;
