import { shader, math3d } from "./engine.js";

export function createMarker(gl, props) {

    let { size } = props.matrix;
    let { lon, lat } = props.lonlat;

    let positions = [];
    let colors = [];

    let lonFloor = Math.floor(lon);
    let latFloor = Math.floor(lat);

    let diffLon = lon - lonFloor;
    let diffLat = lat - latFloor;

    let x = -size / 2 + diffLon * size;
    let y = -size / 2 + (1.0 - diffLat) * size;

    let z = 0.8;

    positions.push(x, y, 0);
    positions.push(x, y, z);

    let color = hexToRgb("00FF00");
    colors.push(color.r, color.g, color.b, 1);
    colors.push(color.r, color.g, color.b, 1);

    let sf = 50;

    for (let i = 0; i < 360; i++) {
        let x0 = x + sf * Math.cos(math3d.toRadians(i));
        let y0 = y + sf * Math.sin(math3d.toRadians(i));

        let x1 = x + sf * Math.cos(math3d.toRadians(i + 1));
        let y1 = y + sf * Math.sin(math3d.toRadians(i + 1));

        z = 0.5;

        positions.push(x0, y0, z);
        positions.push(x1, y1, z);

        color = hexToRgb("FF0000");

        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    let vs = document.getElementById("vshadermarker").textContent;
    let fs = document.getElementById("fshadermarker").textContent;

    const shaderProgram = shader.initShaderProgram(gl, vs, fs);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            scaleFactorXY: gl.getUniformLocation(shaderProgram, "sfXY"),
            offset: gl.getUniformLocation(shaderProgram, "offset")
        },
    };

    return {
        position: positionBuffer,
        color: colorBuffer,
        positionSize: positions.length,
        programInfo
    };
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return {
        r, g, b
    }
}

export function draw(gl, projectionMatrix, modelViewMatrix, buffers, show, sfXY, size) {

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(buffers.programInfo.attribLocations.vertexPosition);
    gl.vertexAttribPointer(
        buffers.programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.enableVertexAttribArray(buffers.programInfo.attribLocations.vertexColor);
    gl.vertexAttribPointer(
        buffers.programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.useProgram(buffers.programInfo.program);

    gl.uniformMatrix4fv(
        buffers.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        buffers.programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    gl.uniform1f(
        buffers.programInfo.uniformLocations.scaleFactorXY,
        sfXY
    );
    gl.uniform1f(
        buffers.programInfo.uniformLocations.offset,
        sfXY * size / 2
    );

    if (show) {
        gl.drawArrays(gl.LINES, 0, buffers.positionSize / 3);
    }
};