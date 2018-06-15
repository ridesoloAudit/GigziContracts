import React, {Component} from 'react'

import { Row, Col, Grid, Button, ButtonToolbar, FormGroup, FormControl, Form } from 'react-bootstrap';

import Contract from '../contract';

class CentralAuthority extends Component {

    constructor(props) {
        super(props);

        this.state = {
            amount: 0,
            addressCA: "",
            addressTxFeeCollector: ""
        };

        this.mintGold = this.mintGold.bind(this);
        this.onPayRewards = this.onPayRewards.bind(this);

        this.handleAmountChange = this.handleAmountChange.bind(this);

        this.onUpdate           = this.onUpdate.bind(this);
        this.burnBlack          = this.burnBlack.bind(this);
        this.burnGold           = this.burnGold.bind(this);
        
        
        this.getAddressCA();
        this.getAddressTxFeeCollector();

    }

    handleAmountChange(event)
    {
        let value = event.target.value;
        if(value < 0) {
            this.setState({amount: Math.abs(value)});
        }else{
            this.setState({amount: value})
        }
    }

    
    onUpdate()
    {
        if (this.props.onUpdate)
            this.props.onUpdate();
    }
    
    
    mintGold()
    {
        // get instance
        Contract.GigGold.deployed().then((instance) => {

            instance.mint(this.state.addressCA, Contract.toGig(this.state.amount),{from: this.state.addressCA }).then(()=>{

                this.onUpdate();
            });
        })
    }

    burnBlack()
    {
        Contract.GigBlack.deployed().then((instance) => {
            instance.burn(Contract.toGig(this.state.amount),{from: this.state.addressCA }).then(()=>{
                this.onUpdate();
            });
        })
    }

    burnGold()
    {
        Contract.GigGold.deployed().then((instance) => {

            instance.burn(Contract.toGig(this.state.amount),{from: this.state.addressCA }).then(()=>{

                this.onUpdate();
            });
        })
    }


    getAddressCA()
    {
        // get instance
        Contract.GigBlack.deployed().then((instance) => {
            instance.getCA.call().then((address)=>{
                this.setState({addressCA:address});
            });
        })
    }

    getAddressTxFeeCollector()
    {
        // get instance
        Contract.GigBlack.deployed().then((instance) => {
            instance.getTxFeeCollector.call().then((address)=>{

                if (parseInt(address, 16) === 0) {
                    setTimeout(this.getAddressTxFeeCollector, 2000);
                } else
                    this.setState({addressTxFeeCollector:address});
            });
        })
    }

    onPayRewards()
    {
        // get instance
        Contract.GigBlack.deployed().then((instance) => {

            instance.resetRewards({from: this.state.addressCA }).then(()=>{

                this.onUpdate();
            });
        })

    }


    render() {
        return (
            <div className="right-block central-authority">
                <h3>Central Authority</h3>

                <p className="address-label"><b>CA Address</b></p>
                <p>{this.state.addressCA}</p>

                <p className="address-label"><b>Collector Address</b></p>
                <p>{this.state.addressTxFeeCollector}</p>

                <Grid fluid className="grid">
                    <Row className="header">
                        <Col sm={6} md={6}>Black Tx Count</Col>
                        <Col sm={6} md={6}>Black Tx Fee Collected</Col>
                    </Row>
                    <Row>
                        <Col sm={6} md={6}>{this.props.txCount}</Col>
                        <Col sm={6} md={6}>{this.props.txAmount}</Col>
                    </Row>

                </Grid>


                <Form horizontal className="mint-amount-container">
                    <FormGroup controlId="formHorizontalAmount">
                        <Row className="firstRow">
                            <Col smOffset={1} sm={2}>
                                Amount
                            </Col>
                            <Col sm={6}>
                                <FormControl type="number" placeholder="Amount" value={this.state.amount} onChange={this.handleAmountChange} />
                            </Col>
                        </Row>
                        <Row>
                            <Col smOffset={2} sm={8}>
    
                                <ButtonToolbar>
                                    <Button bsStyle="warning" onClick={this.mintGold}>Mint Gold</Button>
                                    <Button bsStyle="danger" onClick={this.burnBlack}>Burn Black</Button>
                                    <Button bsStyle="danger" onClick={this.burnGold}>Burn Gold</Button>
                                </ButtonToolbar>
    
                            </Col>
                        </Row>
                    </FormGroup>

                </Form>


                <div className="divider"> </div>

                <Grid fluid className="grid">
                    <Row className="header">
                        <Col smOffset={2} sm={12}>
                            <Button bsStyle="primary" onClick={this.onPayRewards} disabled>Pay Rewards</Button>
                        </Col>
                    </Row>
                </Grid>

            </div>

        );
    }
}

export default CentralAuthority;