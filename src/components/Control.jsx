import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColorPicker } from "primereact/colorpicker";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";

export class Control extends Component {
  state = {
    dlgColorVisible: false,
    percent: 0,
    color: "ffffff",
    selectedRow: null,
    checked: true,
    sf: 0.3,
    res: { name: "Low resolution", steps: 50 },
    lon: 0,
    lat: 0,
  };

  onChangeColor = (value, row) => {
    let arr = [...this.props.colors];
    arr[row].colorHex = value.toUpperCase();
    this.setState(arr);
  };

  colorEditor = (props) => {
    return (
      <ColorPicker
        style={{ marginLeft: "-80px" }}
        format="hex"
        inline={true}
        value={props.value[props.rowIndex].colorHex}
        onChange={(e) => this.onChangeColor(e.value, props.rowIndex)}
      />
    );
  };

  colorCell = (rowData, column) => {
    let colorHex = "#" + rowData.colorHex;
    return (
      <div
        style={{
          backgroundColor: colorHex,
          backgroundImage: "none",
          borderStyle: "solid",
          borderWidth: "1px",
        }}
      >
        &nbsp;
      </div>
    );
  };

  percentCell = (rowData, column) => {
    let percent = rowData.pct * 100;
    return <div>{percent}</div>;
  };

  onColorClick = () => {
    this.setState({ dlgColorVisible: true });
  };

  onColorHide = () => {
    this.setState({ dlgColorVisible: false });
  };

  saveColor = () => {
    let arr = [...this.props.colors];
    let newColor = {
      pct: Math.floor(+this.state.percent) / 100,
      colorHex: this.state.color
        .substring(0, this.state.color.length)
        .toUpperCase(),
    };
    let add = true;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].pct === newColor.pct) {
        add = false;
        break;
      }
    }
    if (add) {
      arr = [...arr, newColor];
    } else {
      this.toast.show({
        severity: "error",
        summary: "Error Message",
        detail: "Duplicate found",
      });
    }
  
    arr.sort(this.compare);
   
    this.props.setColors(arr);
    this.setState({ dlgColorVisible: false });
  };

  deleteRow = () => {
    let sel = this.state.selectedRow;
   
    if (sel == null) {
      this.toast.show({
        severity: "error",
        summary: "Error Message",
        detail: "Select a row to delete",
      });
    } else {
      let erg = this.props.colors.filter((color) => color.pct !== sel.pct);
      this.setState({ selectedRow: null });
      this.props.setColors(erg);
    }
  };

  compare = (a, b) => {
    if (a.pct > b.pct) return 1;
    if (b.pct > a.pct) return -1;
    return 0;
  };

  setChecked = (checked) => {
    this.setState({ checked });
    this.props.setWireFrame(checked);
  };

  setSF = (sf) => {
    this.setState({ sf });
    this.props.setSF(sf);
  };

  setSelectedRes = (res) => {
    this.setState({ res });
    this.props.setRes(res);
  };

  setLon = (lon) => {
    this.setState({ lon });
  };

  setLat = (lat) => {
    this.setState({ lat });
  };

  paste = (e) => {
    //Ctrl+V
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
      navigator.clipboard
        .readText()
        .then((text) => {
          let lonlat = text.split(",");
          let lon = lonlat[0];
          let lat = lonlat[1];

          this.setState({ lon, lat });
        })
        .catch((err) => {
          console.error("Failed to read clipboard contents: ", err);
        });
    }
  };

  onAddMarker = () => {
    this.props.setLonLat({
      lon: this.state.lon,
      lat: this.state.lat,
      show: true,
    });
  };

  onDelMarker = () => {
    this.props.setLonLat({
      lon: this.state.lon,
      lat: this.state.lat,
      show: false,
    });
  };

  render() {
    const res = [
      { name: "Low resolution", steps: 50 },
      { name: "Mid resolution", steps: 150 },
      { name: "High resolution", steps: 250 },
      { name: "Ultra resolution", steps: 500 },
    ];

    const footer = (
      <div>
        <Button label="Add Color" onClick={this.saveColor} />
        <Button label="Cancel" onClick={this.onColorHide} />
      </div>
    );

    return (
      <div
        className="w3-col w3-margin-left"
        style={{ width: "calc(15% - 1*16px)" }}
      >
        <Toast ref={(el) => (this.toast = el)} />
        <div className="w3-container w3-blue w3-margin-top w3-margin-bottom w3-padding">
          <FontAwesomeIcon
            icon="fa-solid fa-table"
            className="w3-margin-right"
          />
          Control
        </div>
        <div
          className="w3-white w3-container w3-padding-16"
          style={{ height: "calc(100vh - 157.48px - 35.98px - 5*16px)" }}
        >
          <div className="w3-row">
            <label className="w3-text-blue w3-col below">Wireframe</label>
            <Checkbox
              onChange={(e) => this.setChecked(e.checked)}
              checked={this.state.checked}
              className="w3-col below"
            ></Checkbox>
            {/*
            <label className="w3-text-blue w3-col below">Scale</label>
            <Slider
              min={0.3}
              max={2.0}
              step={0.1}
              value={this.state.sf}
              onChange={(e) => this.setSF(e.value)}
              className="w3-col w3-margin-bottom"
            />
            */}
            <label className="w3-text-blue w3-col below">Resolution</label>
            <Dropdown
              value={this.state.res}
              onChange={(e) => this.setSelectedRes(e.value)}
              options={res}
              optionLabel="name"
              placeholder="Select a resolution"
              className="below"
              style={{ width: "100%" }}
            />
            <label className="w3-text-blue w3-col below">Latitude</label>
            <InputNumber
              id="lon"
              value={this.state.lon}
              minFractionDigits={2}
              maxFractionDigits={20}
              onValueChange={(e) => this.setLon(e.value)}
              onKeyDown={(e) => this.paste(e)}
              style={{ width: "100%" }}
              className="below"
            />
            <label className="w3-text-blue w3-col below">Longitude</label>
            <InputNumber
              id="lat"
              value={this.state.lat}
              minFractionDigits={2}
              maxFractionDigits={20}
              onValueChange={(e) => this.setLat(e.value)}
              onKeyDown={(e) => this.paste(e)}
              style={{ width: "100%" }}
            />
            <div className="w3-row below">
              <div className="w3-half">
                <Button
                  label="Show Marker"
                  style={{ width: "95%" }}
                  className="w3-btn w3-blue w3-margin-top"
                  onClick={this.onAddMarker}
                ></Button>
              </div>
              <div className="w3-half">
                <Button
                  label="Hide Marker"
                  style={{ width: "100%" }}
                  className="w3-btn w3-blue w3-margin-top"
                  onClick={this.onDelMarker}
                ></Button>
              </div>
            </div>
            <label className="w3-text-blue w3-col below">Color-Editor</label>
            <DataTable
              size="small"
              className="w3-tiny w3-col"
              value={this.props.colors}
              //editable={true}
              selectionMode="single"
              selection={this.state.selectedRow}
              onSelectionChange={(e) => this.setState({ selectedRow: e.value })}
            >
              <Column field="pct" header="Percent" body={this.percentCell} />
              <Column field="colorHex" header="Color" body={this.colorCell} />
              <Column field="colorHex" header="Hex" editor={this.colorEditor} />
            </DataTable>
          </div>
          <div className="w3-row">
            <div className="w3-half">
              <Button
                label="Add Color"
                style={{ width: "95%" }}
                className="w3-btn w3-blue w3-margin-top"
                onClick={this.onColorClick}
              ></Button>
            </div>
            <div className="w3-half">
              <Button
                label="Delete Row"
                style={{ width: "100%" }}
                className="w3-btn w3-blue w3-margin-top"
                onClick={this.deleteRow}
              ></Button>
            </div>
          </div>
        </div>

        <Dialog
          header="Dialog Color"
          visible={this.state.dlgColorVisible}
          footer={footer}
          onHide={this.onColorHide}
        >
          <span>
            <label className="w3-margin-right">New Percentage (0...100):</label>
            <InputText
              keyfilter="pnum"
              className="w3-margin-right"
              value={this.state.percent}
              onChange={(e) => this.setState({ percent: e.target.value })}
            ></InputText>
            <ColorPicker
              className="w3-margin-right"
              value={this.state.color}
              onChange={(e) => this.setState({ color: e.value })}
            ></ColorPicker>
          </span>
        </Dialog>
      </div>
    );
  }
}

export default Control;
