import logo from './logo.svg';
import { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.column = ["label", "value", "input", "Allocation %", "Allocation Val", "Variance %"]
    const salesData = {
      "rows": [
        {
          "id": "electronics",
          "label": "Electronics",
          "value": 1400, //this value needs to be calculated from the children values (800+700)
          "children": [
            {
              "id": "phones",
              "label": "Phones",
              "value": 800
            },
            {
              "id": "laptops",
              "label": "Laptops",
              "value": 700
            }
          ]
        },
        {
          "id": "furniture",
          "label": "Furniture",
          "value": 1000, //this need to be calculated from the children values (300+700)
          "children": [
            {
              "id": "tables",
              "label": "Tables",
              "value": 300
            },
            {
              "id": "chairs",
              "label": "Chairs",
              "value": 700
            }
          ]
        }
      ]
    }
    const data =  (salesData.rows || []).reduce((acc, data)=>{
      acc[data.id] = {
        "label": data.label,
        "value": data.value, 
        "parent": null,
        "isChild": false,
        "variance": 0
      }
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
    },{})
    this.state = {
      tableData: data,
      tableCount: 0,
      input: {}
    }
  }

  addDefaultRow() {
    const dummy = { label: "dummy", value: "0", children: [], parent_label: null }
    this.setState(prevState => ({
      tableData: prevState.tableData.push(dummy),
      tableCount: prevState.tableCount + 1
    }));
  }

  updateInput(label, inputVal){
    const tmp = {};
    tmp[label] = inputVal
    this.setState(prevState => ({
      ...prevState,
      input : {...prevState.input, ...tmp}
    }));
  }

  addPercent(label, inputVal, currentVal){
    let newVal = (currentVal * inputVal/100) + currentVal;
    const labelObj = this.state.tableData;
    labelObj[label]["value"] = newVal
    const isChild = labelObj[label]["isChild"]
    let variance = (Math.abs(currentVal - newVal)/currentVal)*100;
    labelObj[label]["variance"] = variance
    if(isChild){
      let diff = newVal - currentVal;
      let parent = labelObj[label]["parent"]
      
      newVal = labelObj[parent]["value"] + diff
      variance = (Math.abs(labelObj[parent]["value"] - newVal)/labelObj[parent]["value"])*100;
      labelObj[parent]["value"] = newVal
      labelObj[parent]["variance"] = variance

    }
    this.setState((prevState)=>({
      ...prevState,
      tableData: labelObj,
      input: {...prevState.input, [label] : 0}
    }))
  }

  addValue(label, inputVal, currentVal){
    let newVal = inputVal;
    const labelObj = this.state.tableData;
    labelObj[label]["value"] = newVal
    const isChild = labelObj[label]["isChild"]
    let variance = (Math.abs(currentVal - newVal)/currentVal)*100;
    labelObj[label]["variance"] = variance
    if(isChild){
      let diff = newVal - currentVal;
      let parent = labelObj[label]["parent"]
      newVal = labelObj[parent]["value"] + diff
      variance = (Math.abs(labelObj[parent]["value"] - newVal)/labelObj[parent]["value"])*100;
      labelObj[parent]["value"] = newVal
      labelObj[parent]["variance"] = variance
    }
    this.setState((prevState)=>({
      ...prevState,
      tableData: labelObj,
      input: {...prevState.input, [label] : 0}
    }))
  }


  render() {
    const table_label = Object.keys(this.state.tableData);

    return <div>
      <button onClick={this.addDefaultRow}>
        Add Row
      </button>
      <table>
        <tr>
          {this.column.map(c => (<th>{c}</th>))}
        </tr>
        {table_label.length ? table_label.map((label, key) => {
           
          return (<tr>
            <td>{this.state.tableData[label].isChild ? `--${this.state.tableData[label].label}`: this.state.tableData[label].label}</td>
            <td>{this.state.tableData[label].value}</td>
            <td><input value= {this.state.input[label] } type='number' onInvalid={label} key={key} onChange={e=>this.updateInput(label,e.target.value )}></input></td>
            <td><button onClick={()=>this.state.input[label] ? this.addPercent(label, this.state.input[label], this.state.tableData[label].value): null}>
        Add Row
      </button></td>
            <td><button onClick={()=>this.state.input[label] ? this.addValue(label, this.state.input[label], this.state.tableData[label].value): null}>
        Add Row
      </button></td>
      <td>{`${this.state.tableData[label].variance} %`}</td>
          </tr>)
        }) : null}
      </table>
    </div>
  };
}

export default App;
