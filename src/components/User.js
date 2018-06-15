import React, {Component} from 'react'
import { Grid, Row, Col, Label } from 'react-bootstrap';

import Contract from '../contract';

class User extends Component {

    constructor(props) {
        super(props);

        this.selectUser = this.selectUser.bind(this);
    }

    selectUser()
    {
        if (this.props.onSelectUser)
             this.props.onSelectUser(this.props.address);
    }
    
    render() {

        const even       = this.props.even === 0 ? 'even' : 'odd' ;
        const cssClasses  = `${even} show-grid user`;
        const smallLoader = <span><img width="14px" height="14px" src={require("../img/loader.svg")} alt="loader"/></span>;

        function handleSmallLoader(elem) {
            if(elem || elem === 0) {
                return elem
            }
            else {
                return smallLoader
            }
        }

        let reward = null;
        if (this.props.userReward) {
            reward = Contract.parseReward(this.props.userReward.reward, this.props.userReward.total)
        }
        
        return (

            <div className={cssClasses}>
                <div className="address" onClick={this.selectUser}> {this.props.address} </div>

                <Grid fluid>
                    <Row>
                        <Col sm={3} md={3}>
                            <div><Label bsStyle="success">ETH</Label> {handleSmallLoader(this.props.balanceEth)}</div>
                            <div><Label bsStyle="default">BLK</Label> {handleSmallLoader(this.props.balanceStd)}</div>
                            <div><Label bsStyle="warning">GLD</Label> {handleSmallLoader(this.props.balanceGld)}</div>
                        </Col>
                        <Col sm={5} md={5}>
                            <div className="extended-info">
                                <div>Reward Share: {handleSmallLoader(reward)} </div>
                            </div>
                        </Col>

                    </Row>

                </Grid>

            </div>
        )
    }
}

export default User;