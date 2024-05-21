import { Component } from 'react';
import './App.css';
import salesData from "./sales.json";

class App extends Component {
  constructor(props) {
    super(props)
    this.percent = 1;
    this.value = 2
    this.column = ["label", "value", "input", "Allocation %", "Allocation Val", "Variance %"]
   
    this.state = {
      tableData: {},
      tableCount: 0,
      input: {},
      total: 0
    }
  }

 // save the input changes
  updateInput(label, inputVal) {
    const tmp = {};
    tmp[label] = inputVal
    this.setState(prevState => ({
      ...prevState,
      input: { ...prevState.input, ...tmp }
    }));
  }

 // calculate variance
  calVariance(currentVal, newVal){
    return (Math.abs(currentVal - newVal) / currentVal) * 100;
  }

 // calculate new value based on type
  calulateNewVal(label, inputVal, currentVal, type){
    const labelObj = this.state.tableData;
    let newVal;
    let diff;
    let total;
    if(type == this.percent){
      newVal = (currentVal * inputVal / 100) + currentVal;
    }else{
      newVal = inputVal;
    }
    labelObj[label]["value"] = newVal
    const isChild = labelObj[label]["isChild"]
    let variance = this.calVariance(currentVal, newVal)
    labelObj[label]["variance"] = variance
    diff = newVal - currentVal;
    total = this.state.total + diff;
    if (isChild) {
      let parent = labelObj[label]["parent"]
      newVal = labelObj[parent]["value"] + diff
      variance = this.calVariance(labelObj[parent]["value"], newVal)
      labelObj[parent]["value"] = newVal
      labelObj[parent]["variance"] = variance
    }
    this.setState((prevState) => ({
      ...prevState,
      tableData: labelObj,
      input: { ...prevState.input, [label]: 0 },
      total: total
    }))
  }

  

  componentDidMount(){
    let total = 0
    const data = (salesData.rows || []).reduce((acc, data) => {
      acc[data.id] = {
        "label": data.label,
        "value": data.value,
        "parent": null,
        "isChild": false,
        "variance": 0
      }
      total = total + data.value;
      data.children.forEach(element => {
        acc[element.id] = {
          "label": element.label,
          "value": element.value,
          "parent": data.id,
          "isChild": true,
          "variance": 0
        }
      });
      return acc;
    }, {})
    this.setState((prevState) => ({
      ...prevState,
      tableData: data,
      total: total
    }))
  }


  render() {
    const table_label = Object.keys(this.state.tableData);
    return <div className='sales-dashboard'>
      <div className='table-title'>Sales Dashboard</div>
      <div className='table-content'>
      <table>
        <tr className='table-column'>
          {this.column.map(c => (<th>{c}</th>))}
        </tr>
        {table_label.length ? table_label.map((label, key) => {

          return (<tr className='table-body'>
            <td>{this.state.tableData[label].isChild ? `--${this.state.tableData[label].label}` : this.state.tableData[label].label}</td>
            <td>{this.state.tableData[label].value}</td>
            <td><input value={this.state.input[label]} type='number' onInvalid={label} key={key} onChange={e => this.updateInput(label, e.target.value)}></input></td>
            <td><button onClick={() => this.state.input[label] ? this.calulateNewVal(label, this.state.input[label], this.state.tableData[label].value, this.percent) : null}>
              Allocate %
            </button></td>
            <td><button onClick={() => this.state.input[label] ? this.calulateNewVal(label, this.state.input[label], this.state.tableData[label].value, this.value) : null}>
            Allocate value
            </button></td>
            <td>{`${this.state.tableData[label].variance} %`}</td>
          </tr>)
        }) : null}
      </table></div>
      <div className='table-total'>
        Grand Total :  {this.state.total}
      </div>
    </div>
  };
}

export default App;
