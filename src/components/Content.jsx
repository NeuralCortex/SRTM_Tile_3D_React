import React, { Component } from "react";
import { View3D } from "./View3D";
import Control from "./Control";
import { Toast } from "primereact/toast";

export class Content extends Component {
  state = {
    colors: [
      { pct: 0.0, colorHex: "0000FF" },
      { pct: 0.5, colorHex: "ADFF2F" },
      { pct: 0.6, colorHex: "9ACD32" },
      { pct: 0.7, colorHex: "FFA500" },
      { pct: 0.8, colorHex: "B8860B" },
      { pct: 0.9, colorHex: "B3801A" },
      { pct: 1.0, colorHex: "FFFFFF" },
    ],
    wire: true,
    sf: 0.3,
    res: { name: "Low resolution", steps: 50 },
    lonlat: { lon: 0, lat: 0, show: false },
  };

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      let lonlat = { lon: 0, lat: 0, show: false };
      this.setState({ lonlat });
    }
  }

  setColors = (colors) => {
    if (this.checkMatrix()) this.setState({ colors });
  };

  setWireFrame = (wire) => {
    if (this.checkMatrix()) this.setState({ wire });
  };

  setSF = (sf) => {
    if (this.checkMatrix()) this.setState({ sf });
  };

  setRes = (res) => {
    if (this.checkMatrix()) this.setState({ res });
  };

  setLonLat = (lonlat) => {
    if (this.checkMatrix()) {
      let ok = this.checkRect(lonlat);
      if (ok) this.setState({ lonlat });
    }
  };

  checkRect = (lonlat) => {
    let lon = lonlat.lon;
    let lat = lonlat.lat;

    let { rect } = this.props.matrix;

    let ul = rect[0];
    let lr = rect[1];

    let ulLon = ul[0];
    let ulLat = ul[1];

    let lrLon = lr[0];
    let lrLat = lr[1];
    /*
    51-10
    50-11
    */
    if (lon > ulLon || lon < lrLon || lat < ulLat || lat > lrLat) {
      this.toast.show({
        severity: "error",
        summary: "Error Message",
        detail: "Position out of Range",
      });
      return false;
    }
    return true;
  };

  checkMatrix = () => {
    if (this.props.matrix === null) {
      this.toast.show({
        severity: "error",
        summary: "Error Message",
        detail: "Please open SRTM-File first.",
      });
      return false;
    }
    return true;
  };

  render() {
    return (
      <div className="w3-orange content">
        <Toast ref={(el) => (this.toast = el)} />
        <div className="w3-row">
          <View3D
            matrix={this.props.matrix}
            colors={this.state.colors}
            wire={this.state.wire}
            sf={this.state.sf}
            res={this.state.res}
            lonlat={this.state.lonlat}
          ></View3D>
          <Control
            colors={this.state.colors}
            setColors={this.setColors}
            setWireFrame={this.setWireFrame}
            setSF={this.setSF}
            setRes={this.setRes}
            setLonLat={this.setLonLat}
          ></Control>
        </div>
      </div>
    );
  }
}

export default Content;
