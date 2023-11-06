import React, { Component } from "react";
import { Toast } from "primereact/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { mat4 } from "../glmatrix/index.js";
import { plane, tex, marker, texnew } from "../logic/engine.js";

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

export class View3D extends Component {
  state = {
    lat: 10,
    lon: 50,
    tileName: "",
    rotX: 0,
    rotY: 0,
    gl: null,
    objects3d: {
      plane: null,
      n: null,
      s: null,
      e: null,
      w: null,
      m: null,
    },
    min: 0,
    max: 0,
    sfXY: 0.001,
  };

  componentDidMount() {
    this.setup();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      try {
        this.init(this.props);
      } catch (e) {
        this.toast.show({
          severity: "error",
          summary: "Error Message",
          detail: "Wrong SRTM-File format.",
        });
      }
    }
  }

  setup = () => {
    let draw = document.getElementById("draw");

    let rectDraw = draw.getBoundingClientRect();

    let width = rectDraw.width;
    let height = rectDraw.height;

    document.getElementById("glCanvas").width = width;
    document.getElementById("glCanvas").height = height;
  };

  init = (props) => {
    const canvas = document.querySelector("#glCanvas");
    const surr = document.querySelector("#draw");
    canvas.style.width = "100%";
    //canvas.style.height = "100%";
    canvas.width = surr.offsetWidth;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (props != null) {
      let p = plane.createPlane(gl, props, props.colors);

      let n = texnew.createLabel(gl, tex.DESC.N);
      let s = texnew.createLabel(gl, tex.DESC.S);
      let e = texnew.createLabel(gl, tex.DESC.E);
      let w = texnew.createLabel(gl, tex.DESC.W);

      let m = marker.createMarker(gl, props);

      let objects3d = {
        plane: p,
        n,
        s,
        e,
        w,
        m,
      };

      this.setState({ gl, objects3d });
      this.drawScene(gl, objects3d);
    }
  };

  drawScene = (gl, objects3d) => {
    if(gl===null){
      return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -2.7]
    );

    mat4.rotate(modelViewMatrix, modelViewMatrix, -45, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.state.rotY, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.state.rotX, [0, 0, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, 45, [0, 0, 1]);

    //console.log("draw " + this.state.wire);

    let size = this.props.matrix.size;

    function drawPlane(param){
      plane.draw(
        gl,
        projectionMatrix,
        modelViewMatrix,
        objects3d.plane,
        param.props.wire,
        param.props.sf,
        param.state.sfXY,
        size
      );
    }

    plane.draw(
      gl,
      projectionMatrix,
      modelViewMatrix,
      objects3d.plane,
      this.props.wire,
      this.props.sf,
      this.state.sfXY,
      size
    );

    texnew.draw(gl, projectionMatrix, modelViewMatrix, objects3d.n, texnew.DESC.N,()=>drawPlane(this));
    texnew.draw(gl, projectionMatrix, modelViewMatrix, objects3d.s, texnew.DESC.S,()=>drawPlane(this));
    texnew.draw(gl, projectionMatrix, modelViewMatrix, objects3d.e, texnew.DESC.E,()=>drawPlane(this));
    texnew.draw(gl, projectionMatrix, modelViewMatrix, objects3d.w, texnew.DESC.W,()=>drawPlane(this));

    marker.draw(
      gl,
      projectionMatrix,
      modelViewMatrix,
      objects3d.m,
      this.props.lonlat.show,
      this.state.sfXY,
      size
    );
  };

  onMouseMove = (evt) => {
    if (!mouseDown) {
      return;
    }

    evt.preventDefault();

    let deltaX = evt.clientX - mouseX;
    let deltaY = evt.clientY - mouseY;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    this.rotateScene(deltaX, deltaY);
  };

  onMouseDown = (evt) => {
    evt.preventDefault();

    mouseDown = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
  };

  onMouseUp = (evt) => {
    evt.preventDefault();
    mouseDown = false;
  };

  rotateScene = (deltaX, deltaY) => {
    this.setState({
      rotX: this.state.rotX + deltaX / 100,
      rotY: this.state.rotY + deltaY / 100,
    });
    this.drawScene(this.state.gl, this.state.objects3d);
  };

  wheelScene = (evt) => {
    //evt.preventDefault();
    if (evt.deltaY < 0) {
      //Up
      this.setState({ sfXY: this.state.sfXY + 0.0001 });
    } else {
      this.setState({ sfXY: this.state.sfXY - 0.0001 });
    }
    this.drawScene(this.state.gl, this.state.objects3d);
  };

  showInfos = () => {
    let info = "";
    if (this.props.matrix !== null) {
      let { rect, size, fileName } = this.props.matrix;

      let ul = rect[0];
      let lr = rect[1];

      let latStart = lr[0];
      let latEnd = ul[0];
      let lonEnd = lr[1];
      let lonStart = ul[1];

      let type = size === 1201 ? "SRTM-3" : "SRTM-1";

      info =
        fileName +
        " | " +
        size +
        "x" +
        size +
        " | " +
        type +
        " | " +
        "Lat(" +
        latStart +
        "° - " +
        latEnd +
        "°) " +
        " | Lon(" +
        lonStart +
        "° - " +
        lonEnd +
        "°)";
    }

    return info;
  };

  render() {
    return (
      <div
        className="w3-col w3-margin-left"
        style={{ width: "calc(85% - 2*16px)" }}
      >
        <Toast ref={(el) => (this.toast = el)} />
        <div className="w3-container w3-blue w3-margin-top w3-margin-bottom w3-padding">
          <FontAwesomeIcon icon="fa-solid fa-map" className="w3-margin-right" />
          {this.showInfos()}
        </div>
        <div
          id="draw"
          className="w3-black"
          style={{ height: "calc(100vh - 157.48px - 31px - 5*16px - 4.99px)" }}
        >
          <canvas
            id="glCanvas"
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onWheel={this.wheelScene}
          ></canvas>
        </div>
      </div>
    );
  }
}

export default View3D;
