import React, {Component} from 'react'
import Contract from '../contract';

import SetFee from './SetFee'

export default class Configure extends Component {
    constructor(props) {
        super(props);

        this.state = {
            blackFeeMultiplier: 0,
            blackFeeDivider: 0,
            blackFeeLimit:0,
            
            goldFeeMultiplier: 0,
            goldFeeDivider: 0,
            goldFeeLimit:0
            
        };
        
        
        this.setParams          = this.setParams.bind(this);
        
        this.requestContract    = this.requestContract.bind(this);
        
        this.setParamsBlack     = this.setParamsBlack.bind(this);
        this.setParamsGold      = this.setParamsGold.bind(this);
    }

    componentWillMount() {
        this.refreshAll();
    }

    
    requestContract(contract)
    {
        return new Promise(resolve=>{
            let result = {
                feeMultiplier : 0,
                feeDivider: 0,
                feeLimit: 0
            };

            let instance = null;
            contract.deployed().then((inst) => {
                instance = inst;
                return instance.feeMultiplier.call();
            }).then(feeMultiplier=>{
                result.feeMultiplier = feeMultiplier.toNumber();
                return instance.feeDivider.call();
            }).then(feeDivider=>{
                result.feeDivider = feeDivider.toNumber();
                return instance.feeLimit.call();
            }).then(feeLimit=>{
                result.feeLimit = feeLimit.toNumber();
                resolve(result);
            });

        });
    }
    
    refreshAll()
    {
        this.requestContract(Contract.GigBlack).then((result)=>{
            this.setState({
                blackFeeMultiplier: result.feeMultiplier,
                blackFeeDivider: result.feeDivider,
                blackFeeLimit: result.feeLimit
            });
        });

        this.requestContract(Contract.GigGold).then((result)=>{
            this.setState({
                goldFeeMultiplier: result.feeMultiplier,
                goldFeeDivider: result.feeDivider,
                goldFeeLimit: result.feeLimit
            });
        });
        
    }

    setParamsBlack(newFee, newLimit)
    {
        this.setParams(Contract.GigBlack, newFee, newLimit);
    }

    setParamsGold(newFee, newLimit)
    {
        this.setParams(Contract.GigGold, newFee, newLimit);
    }
    

    setParams(contract, newFee, newLimit)
    {
        const percent = newFee / 100;
        
        // parse new fee
        const count = this.countDecimals(percent);

        const feeMul = percent * (10 ** count); 
        const feeDiv = 10 ** count;
        const feeLim = newLimit;

        contract.deployed().then((inst) => {
            
            console.log(feeMul, feeDiv, feeLim);
            
            return inst.setFee(feeMul, feeDiv, feeLim, {from: Contract.getOwner()} );
        }).then(()=>{
            this.refreshAll();
        });
    }

    countDecimals (/*Number*/ val) {
        if(Math.floor(val) === val) return 0;
        return val.toString().split(".")[1].length || 0;
    }
    
    render() {
        
        return (
          <div>
              <h2>Configure Black Fee</h2>
              
              <SetFee
                  feeMultiplier={this.state.blackFeeMultiplier}
                  feeDivider={this.state.blackFeeDivider}
                  feeLimit={this.state.blackFeeLimit}
                  setParams={this.setParamsBlack}
              />

              <h2>Configure Gold Fee</h2>

              <SetFee
                  feeMultiplier={this.state.goldFeeMultiplier}
                  feeDivider={this.state.goldFeeDivider}
                  feeLimit={this.state.goldFeeLimit}
                  setParams={this.setParamsGold}
              />
          </div>  
        );
    }
}

 