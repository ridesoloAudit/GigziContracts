import React, {Component} from 'react'
import { Grid, Col,Row, Button, FormControl,Form, FormGroup } from 'react-bootstrap';

import Contract from '../contract';

export default class Payout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accounts: [],
            index: 0,
            count: 0,
            goldAmount: 0
        };
        
        
        this.requestPayoutInfo  = this.requestPayoutInfo.bind(this);
        this.processAccount = this.processAccount.bind(this);
        this.handleGoldAmount = this.handleGoldAmount.bind(this);
        
        this.processPayout = this.processPayout.bind(this);
    }

    handleGoldAmount(event)
    {
        this.setState({goldAmount: event.target.value});
    }
    
    processAccount(index, instance)
    {
        return new Promise( (resolve) =>{

            this.setState({index});
            instance.getAccountRewardByIdx.call(index).then(account=>{
                resolve(account);
            });
        } );
    }
    
    
    
    requestPayoutInfo()
    {
        let instance = null;
        Contract.GigBlack.deployed().then((inst) => {
            instance = inst;
            return instance.getAccountsCount.call();
        }).then(count=>{

            this.setState({count});
            
            let promises = [];
            for (let i=0;i<count;i++) {
                promises.push(this.processAccount(i, instance));
            }

            Promise.all(promises).then(result=>{
                let accounts = result.map((value)=>{
                    
                    const reward = value[1].toNumber();
                    const total = value[2].toNumber();
                    
                    return {
                        address: value[0],
                        reward: Contract.parseReward(reward, total),
                    }
                });
                
                this.setState({accounts});
            })
        });
    }

    static onValidateGoldAmount(amount)
    {
        // TODO: validation
        return true;
    }    
    
    processPayout()
    {
        // TODO: confirm process payout
        
        let accounts = this.state.accounts.slice(0);
            
        let promises = accounts.map((account, id)=>{
           return new Promise( (resolve) => {
               let goldToSend = account.reward * this.state.goldAmount / 100;

               Contract.GigGold.deployed().then((instance) => {
                   instance.transfer(
                       account.address,
                       Contract.toGig(goldToSend),
                       {from: Contract.getOwner()}
                   ).then((value)=> {
                       accounts[id].sent = goldToSend;
                       this.setState({accounts});
                       resolve();
                   });
               });
           })
        });

        Promise.all(promises).then(()=>{
            alert("Success");
        })
    }
    
    render() {
        const accounts = this.state.accounts.map((account) => 
            <Row>
                <Col sm={6}>
                    {account.address}
                </Col>
                <Col sm={3} >
                    {account.reward}
                </Col>
                <Col sm={3}>
                    {account.sent ? account.sent : ""}               
                </Col>
            </Row>
        );
        return (
            <div>
                <h2>Reward Payout</h2>

                <Button bsStyle="primary" onClick={this.requestPayoutInfo}>Request Payout Info</Button>


                <Form horizontal>
                    <FormGroup controlId="formHorizontalFrom" validationState={Payout.onValidateGoldAmount(this.state.goldAmount)}>
                        <Col sm={3}>
                            <Button onClick={this.processPayout}>Process Payout</Button>
                        </Col>
                        <Col sm={6}>
                            <FormControl type="text" placeholder="Gold amount" value={this.state.goldAmount} onChange={this.handleGoldAmount} />
                        </Col>
                    </FormGroup>
                </Form>
                
                

                <Grid fluid>
                    <Row>
                        <Col sm={6}>
                            Address
                        </Col>
                        <Col sm={3}>
                            Reward
                        </Col>
                        <Col sm={3}>
                            Payed
                        </Col>
                        
                    </Row>
                    {accounts}
                </Grid>

                
            </div>
        );
    }
}

 