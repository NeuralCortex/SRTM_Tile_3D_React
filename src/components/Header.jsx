import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class Header extends Component {
  state = {
    time: "",
    obj: {
      srtm: [],
      min: null,
      max: null,
      size: null,
    },
  };

  componentDidMount() {
    setInterval(() => {
      this.getTime();
    }, 1000);
  }

  readFile = (file) => {
    let reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        console.log("Error");
        reject(new DOMException("Problem parsing input file."));
      };

      reader.onload = (e) => {
        let contents = e.target.result;
        resolve(this.readSrtmTile(contents));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  readSrtmTile = (content) => {
    let erg = [];

    let view = new DataView(new ArrayBuffer(3601 * 3601 * 2 * 2));

    let array = new Int8Array(content);
    console.log(array.length);
    for (let i = 0; i < array.length; i++) {
      //Little Endian
      view.setInt8(i, array[i], true);
    }

    let min = 99999;
    let max = -99999;
    let size = 0;

    for (let i = 0; i < array.length; i++) {
      if (i % 2 === 0) {
        let height = view.getInt16(i);

        if (height < min) {
          min = height;
        }
        if (height > max) {
          max = height;
        }
        if (min < 0) {
          min = 0;
        }
        if (height < 0) {
          height = 0;
        }

        erg.push(height);

        size++;
      }
    }

    console.log("BufferSize: " + array.length);

    //SRTM-3
    if (size === 1201 * 1201) {
      size = 1201;
    }

    //SRTM-1
    if (size === 3601 * 3601) {
      size = 3601;
    }

    return { min, max, srtm: this.buildMatrix(erg, size), size };
  };

  buildLine = (buffer, start, lenght) => {
    let erg = [];
    let count = 0;
    for (let i = start; i < start + lenght; i++) {
      erg[count++] = buffer[i];
    }
    return erg;
  };

  buildMatrix = (buffer, size) => {
    let matrix = new Array(size);
    let count = size - 1;
    for (let k = 0; k < buffer.length; k += size) {
      let subList = buffer.slice(k, k + size).reverse();
      matrix[count] = subList;
      count--;
    }
    return matrix;
  };

  genRect = (fileName) => {
    let lat = fileName.substring(4, 7);
    let lon = fileName.substring(1, 3);

    let n = fileName.toUpperCase().substring(0, 1);
    let e = fileName.toUpperCase().substring(3, 4);

    let lonStart = +lon;
    let latStart = +lat;

    if (n === "S") {
      lonStart = -1 * lonStart;
    }
    if (e === "W") {
      latStart = -1 * latStart;
    }

    let rect = [
      [lonStart + 1, latStart],
      [lonStart, latStart + 1],
    ];

    return rect;
  };

  onImportFile = async (e) => {
    let file = e.target.files[0];
    let obj = await this.readFile(file);
    let rect = this.genRect(file.name);

    let { min, max, srtm, size } = obj;

    let matrix = {
      rect,
      srtm,
      min,
      max,
      size,
      fileName: file.name,
    };
    this.props.setMatrix(matrix);
    this.setState({ obj });
  };

  getTime = () => {
    let d = new Date();
    let time =
      this.pad(d.getHours(), 2) +
      ":" +
      this.pad(d.getMinutes(), 2) +
      ":" +
      this.pad(d.getSeconds(), 2);
    this.setState({ time });
  };

  pad = (num, size) => {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  onResetValues = (e) => {
    e.target.value = "";
  };

  render() {
    return (
      <header id="header">
        <div className="w3-container w3-padding w3-indigo">
          <div className="w3-right w3-tiny">
            <FontAwesomeIcon
              icon="wifi"
              style={{ marginRight: "10px" }}
            ></FontAwesomeIcon>
            <FontAwesomeIcon
              icon="battery-half"
              style={{ marginRight: "10px" }}
            ></FontAwesomeIcon>
            <label>{this.state.time} CET</label>
          </div>
        </div>
        <div className="w3-bar w3-blue w3-xlarge">
          <div className="w3-bar-item" style={{ fontFamily: "arial" }}>
            SRTM Tile 3D-Viewer{" "}
            <FontAwesomeIcon icon={["fab", "react"]}></FontAwesomeIcon> React
            <div style={{ fontSize: "11px" }} className="w3-wide">
              NASA Mission STS-99 3D Geo Tile Viewer
            </div>
          </div>
        </div>
        <div className="w3-blue w3-margin">
          <FontAwesomeIcon
            icon="fa-regular fa-folder-open"
            className="w3-container"
          />
          <label className="w3-margin-right">Open SRTM-File:</label>
          <input
            type="file"
            onChange={this.onImportFile}
            onClick={this.onResetValues}
          />
        </div>
      </header>
    );
  }
}

export default Header;
