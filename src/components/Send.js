import React, {Component} from 'react'

import { Button, ButtonToolbar, FormGroup, FormControl, Form, Col } from 'react-bootstrap';

import Contract from '../contract';

class Send extends Component {

    constructor(props) {
        super(props);

        this.state = {
            formFromAddress: this.props.fromAddress,
            formToAddress: this.props.toAddress,
            formAmount: "",
            insufficientFundsMsg: false,
            sendErrMsg: null,
            balanceBlk: null,
            balanceGld: null
        };

        this.handleFromAddressChange = this.handleFromAddressChange.bind(this);
        this.handleToAddressChange = this.handleToAddressChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.onSendEth = this.onSendEth.bind(this);
        this.onSendToken = this.onSendToken.bind(this);

    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.fromAddress !== nextProps.fromAddress)
            this.setState({formFromAddress: nextProps.fromAddress});

        if (this.props.toAddress !== nextProps.formToAddress)
            this.setState({formToAddress: nextProps.toAddress});
    }

    /*This function is only highlights the valid address during the input*/
    onValidateAddressInput(address)
    {
        let isAddress = Contract.web3RPC.isAddress(address);
        if (isAddress === true) {
            return 'success'
        } else if (!address){
            return null
        } else {
            return 'error'
        }
    }

    /*Get balance for Black or Gold token for current address*/
    getTokenCurrentBalance(account, token, tokenBalanceName)
    {
        return token.deployed().then((instance) => {
            return instance.balanceOf.call(account)
                .then((value)=> {
                    this.setState({
                        [tokenBalanceName]: Contract.fromGig(value.toNumber())
                    });
                    return Contract.fromGig(value.toNumber())
                })
                .catch(err => console.log(err));
        });
    }

    /*Get the balance of ethereum and check or sender have enough it to send*/
    checkInsufficientEthFunds(address)
    {
        let balance = Contract.web3RPC.eth.getBalance(address);
        let balanceEthNum = Number(Contract.web3RPC.fromWei(balance.toNumber(), "ether"));
        return this.initInsufficientFundsMsg(balanceEthNum)
    }

    /*Check or the sender have enough currency to send (ethereum/gold/black)*/
    initInsufficientFundsMsg(value) {
        if(this.state.formAmount > value) {
            this.setState({
                insufficientFundsMsg: true
            });
            return false
        } else {
            this.setState({
                insufficientFundsMsg: false
            });
            return true
        }
    }

    /*Init Ethereum transaction. This function executes after passing the validation*/
    sendEth()
    {
        Contract.web3RPC.eth.sendTransaction(
            {
                from: this.state.formFromAddress,
                to: this.state.formToAddress,
                value: Contract.web3RPC.toWei(this.state.formAmount, "ether")
            },
            () => {
                if (this.props.onSend)
                    this.props.onSend();
            }
        );
    }

    /*Init Gold/Black transaction. This function executes after passing the validation*/
    sendToken(token, gas)
    {
        let formAmount = parseFloat(this.state.formAmount).toFixed(2);
        token.deployed().then((instance) => {
            instance.transfer(
                this.state.formToAddress,
                Contract.toGig(formAmount),
                {from: this.state.formFromAddress, gas: gas }
            ).then((value)=>{
                if (this.props.onSend)
                    this.props.onSend();

            }).catch(function (e) {
                console.log(e);
            });

        });
    }

    /*Validate and send Ethereum*/
    onSendEth()
    {
        if (Contract.web3RPC.isAddress(this.state.formFromAddress) && Contract.web3RPC.isAddress(this.state.formToAddress)) {
                if (this.checkInsufficientEthFunds(this.state.formFromAddress) === true) {
                    /*Send transaction with Ethereum*/
                    this.sendEth();
                    this.clearErrMsgs()
                } else {
                    return false
                }
        } else {
            this.setState({
                sendErrMsg: <b className="text-danger">Wrong or empty address field</b>
            });
            return false
        }
    }

    /*Validate and send Black/Gold tokens*/
    onSendToken(token, gas)
    {
        if (Contract.web3RPC.isAddress(this.state.formFromAddress) && Contract.web3RPC.isAddress(this.state.formToAddress)) {
            let tokenName = "";
            if (token === Contract.GigBlack) {
                tokenName = "balanceBlk"
            } else if (token === Contract.GigGold) {
                tokenName = "balanceGld"
            } else {
                return false
            }
            this.getTokenCurrentBalance(this.state.formFromAddress, token, tokenName)
                .then(value => this.initInsufficientFundsMsg(value))
                .then(status => {
                    if(status === true) {
                        /*Send transaction with Black or Gold token*/
                        this.sendToken(token, gas)
                    } else {
                        return false
                    }
                })
                .then(this.clearErrMsgs())
        } else {
            this.setState({
                sendErrMsg: <b className="text-danger">Wrong or empty address field</b>
            });
            return false
        }

    }

    /*Clear previous error messages if transaction was successful*/
    clearErrMsgs()
    {
        this.setState({
            insufficientFundsMsg: false,
            sendErrMsg: null
        });
    }

    handleFromAddressChange(event)
    {
        this.setState({formFromAddress: event.target.value});
    }

    handleToAddressChange(event)
    {
        this.setState({formToAddress: event.target.value});
    }

    handleAmountChange(event)
    {
        let value = event.target.value;
        if(value < 0) {
            this.setState({formAmount: Math.abs(value)});
        }else{
            this.setState({formAmount: value})
        }
    }

    render() {

        return (
            <div className="send-block">
                    <Form horizontal>
                        <FormGroup controlId="formHorizontalFrom" validationState={this.onValidateAddressInput(this.state.formFromAddress)}>
                            <Col sm={2}>
                                From Address
                            </Col>
                            <Col sm={8}>
                                <FormControl type="text" placeholder="From address" value={this.state.formFromAddress} onChange={this.handleFromAddressChange} />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="formHorizontalTo" validationState={this.onValidateAddressInput(this.state.formToAddress)}>
                            <Col sm={2}>
                                To Address
                            </Col>
                            <Col sm={8}>
                                <FormControl type="text" placeholder="To address" value={this.state.formToAddress} onChange={this.handleToAddressChange} />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="formHorizontalAmount">
                            <Col sm={2}>
                                Amount
                            </Col>
                            <Col sm={8}>
                                <FormControl type="number" placeholder="Amount" minLength="0" value={this.state.formAmount} onChange={this.handleAmountChange} />
                                <div className="text-center">
                                    {this.state.insufficientFundsMsg ? <p><b className="text-danger">Insufficient funds</b></p> : null}
                                    {this.state.sendErrMsg}
                                </div>
                            </Col>
                        </FormGroup>


                        <FormGroup>
                            <Col smOffset={2} sm={8}>

                                <ButtonToolbar>
                                    <Button bsStyle="success" onClick={() => this.onSendEth()} >Send Eth</Button>
                                    <Button bsStyle="default" onClick={() => this.onSendToken(Contract.GigBlack, 1900000)}>Send Black</Button>
                                    <Button bsStyle="warning" onClick={() => this.onSendToken(Contract.GigGold)}>Send Gold</Button>
                                </ButtonToolbar>

                            </Col>
                        </FormGroup>
                    </Form>

                </div>
        );
    }
}

export default Send;