import { shader } from "../logic/engine.js";

export function createPlane(gl, props, colorMap) {

    let {min, max, srtm, size } = props.matrix;
    let wire = props.wire;
    let res = props.res;

    let steps = Math.floor(size / res.steps);

    let positions = [];
    let colors = [];

    /*
    1 - 2
    4 - 3
    */

    console.log("min: " + min + " " + max);

    for (let x = 0; x <= size - steps; x += steps) {
        for (let y = 0; y < size - steps; y += steps) {
            let x1 = x;
            let y1 = y;
            let z1 = getPercentFromHeight(min, max, srtm[x][y]);
            let color1 = getColorForPercentage(z1, colorMap);

            let x2 = x + steps;
            let y2 = y;
            let z2 = getPercentFromHeight(min, max, srtm[x + steps][y]);
            let color2 = getColorForPercentage(z2, colorMap);

            let x3 = x + steps;
            let y3 = y + steps;
            let z3 = getPercentFromHeight(min, max, srtm[x + steps][y + steps]);;
            let color3 = getColorForPercentage(z3, colorMap);

            let x4 = x;
            let y4 = y + steps;
            let z4 = getPercentFromHeight(min, max, srtm[x][y + steps]);
            let color4 = getColorForPercentage(z4, colorMap);

            if (!wire) {
                positions.push(x1, y1, z1);
                positions.push(x2, y2, z2);
                positions.push(x4, y4, z4);

                positions.push(x2, y2, z2);
                positions.push(x3, y3, z3);
                positions.push(x4, y4, z4);

                colors.push(color1.r, color1.g, color1.b, 1);
                colors.push(color2.r, color2.g, color2.b, 1);
                colors.push(color4.r, color4.g, color4.b, 1);

                colors.push(color2.r, color2.g, color2.b, 1);
                colors.push(color3.r, color3.g, color3.b, 1);
                colors.push(color4.r, color4.g, color4.b, 1);
            }
            else {
                positions.push(x1, y1, z1);
                positions.push(x2, y2, z2);

                positions.push(x2, y2, z2);
                positions.push(x3, y3, z3);

                positions.push(x3, y3, z3);
                positions.push(x4, y4, z4);

                positions.push(x4, y4, z4);
                positions.push(x1, y1, z1);

                colors.push(color1.r, color1.g, color1.b, 1);
                colors.push(color2.r, color2.g, color2.b, 1);

                colors.push(color2.r, color2.g, color2.b, 1);
                colors.push(color3.r, color3.g, color3.b, 1);

                colors.push(color3.r, color3.g, color3.b, 1);
                colors.push(color4.r, color4.g, color4.b, 1);

                colors.push(color4.r, color4.g, color4.b, 1);
                colors.push(color1.r, color1.g, color1.b, 1);
            }
        }
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

    let vs = document.getElementById("vshader").textContent;
    let fs = document.getElementById("fshader").textContent;

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
            scaleFactor: gl.getUniformLocation(shaderProgram, "sf"),
            scaleFactorXY: gl.getUniformLocation(shaderProgram, "sfXY"),
            offset: gl.getUniformLocation(shaderProgram, "offset"),
        },
    };

    return {
        position: positionBuffer,
        color: colorBuffer,
        positionSize: positions.length,
        programInfo
    };
}

function getPercentFromHeight(min, max, height) {
    let erg = 0;
    erg = ((height - min) / (max - min)) * 100.0;
    if (min === max && min === 0) {
        return 0;
    }
    return erg / 100.0;
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

export function getColorForPercentage(pct, colors) {
    let percentColors = [];
    for (let i = 0; i < colors.length; i++) {
        let col = hexToRgb(colors[i].colorHex);
        percentColors[i] = {
            pct: colors[i].pct,
            color: {
                r: col.r,
                g: col.g,
                b: col.b
            }
        }
    }
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return color = {
        r: color.r / 255, g: color.g / 255, b: color.b / 255, a: 1.0
    }
}

export function draw(gl, projectionMatrix, modelViewMatrix, buffers, wire, sf, sfXY, size) {
    console.log("Plane draw");
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
        buffers.programInfo.uniformLocations.scaleFactor,
        sf
    );
    gl.uniform1f(
        buffers.programInfo.uniformLocations.scaleFactorXY,
        sfXY
    );
    gl.uniform1f(
        buffers.programInfo.uniformLocations.offset,
        sfXY * size / 2
    );

    if (wire) {
        gl.drawArrays(gl.LINES, 0, buffers.positionSize / 3);
    }
    else {
        gl.drawArrays(gl.TRIANGLES, 0, buffers.positionSize / 3);
    }
};