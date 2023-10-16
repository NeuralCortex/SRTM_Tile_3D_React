import { math3d, shader, tex } from "./engine.js"

export const ROT_AXIS = {
    X: 0,
    Y: 1,
    Z: 2
}

export const DESC = {
    N: 0,
    S: 1,
    E: 2,
    W: 3,
}

export function createLabel(gl, desc) {

    /*
    firstN = true;
    firstS = true;
    firstE = true;
    firstW = true;
    */

    console.log("create label new: " + desc);

    let coords = buildQuadricTriangleStrip(0.5);

    if (desc === DESC.N) {
        coords = translateQuad(coords, 0.5, -0.25, 0);
    }

    if (desc === DESC.S) {
        coords = rotateQuad(coords, ROT_AXIS.Z, 180);
        coords = translateQuad(coords, -0.5, 0.25, 0);
    }

    if (desc === DESC.E) {
        coords = rotateQuad(coords, ROT_AXIS.Z, 180);
        //coords = rotateQuad(coords, ROT_AXIS.Z, 180);
        coords = translateQuad(coords, 0.25, -0.5, 0);
    }

    if (desc === DESC.W) {
        coords = rotateQuad(coords, ROT_AXIS.Z, 180);
        coords = translateQuad(coords, 0.25, 1, 0);
    }

    //console.log(texture);

    const textureCoordinates = [
        0, 1,
        1, 1,
        0, 0,
        1, 0
    ]

    const indices = [
        2, 3, 1,
        0, 1, 2
    ]

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let vs = document.getElementById("vshaderlabel").textContent;
    let fs = document.getElementById("fshaderlabel").textContent;

    const shaderProgram = shader.initShaderProgram(gl, vs, fs);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };

    let texture = null;

    if (desc === DESC.N) {
        texture = textureN;
    }
    if (desc === DESC.S) {
        texture = textureS;
    }
    if (desc === DESC.E) {
        texture = textureE;
    }
    if (desc === DESC.W) {
        texture = textureW;
    }

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        positionSize: coords.length,
        texture: texture === null ? gl.createTexture() : texture,
        programInfo
    };
}

let firstN = true;
let firstS = true;
let firstE = true;
let firstW = true;
let textureN = null;
let textureS = null;
let textureE = null;
let textureW = null;

export function draw(gl, projectionMatrix, modelViewMatrix, buffers, desc, callback) {
    //const texture = gl.createTexture();
    //gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue

    /*
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );
    */

    let url = "";
    let first = false;

    if (desc === DESC.N) {
        url = "/images/n.png"
        first = firstN;
    }
    if (desc === DESC.S) {
        url = "/images/s.png"
        first = firstS;
    }
    if (desc === DESC.E) {
        url = "/images/e.png"
        first = firstE;
    }
    if (desc === DESC.W) {
        url = "/images/w.png"
        first = firstW;
    }

    if (first) {
        const image = new Image();

        image.addEventListener('load', function () {
            console.log("Load texture");
            gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image,
            );

            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(buffers.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(buffers.programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
            gl.vertexAttribPointer(buffers.programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(buffers.programInfo.attribLocations.textureCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

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

            gl.activeTexture(gl.TEXTURE0);
            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(buffers.programInfo.uniformLocations.uSampler, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.positionSize / 3);

            callback();
        });
        image.src = url;

        if (desc === DESC.N) {
            firstN = false;
            textureN = buffers.texture;
        }
        if (desc === DESC.S) {
            firstS = false;
            textureS = buffers.texture;
        }
        if (desc === DESC.E) {
            firstE = false;
            textureE = buffers.texture;
        }
        if (desc === DESC.W) {
            firstW = false;
            textureW = buffers.texture;
        }
    }
    else {
        tex.draw(gl, projectionMatrix, modelViewMatrix, buffers);
        //callback();
    }
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function buildQuadricTriangleStrip(size) {
    let coords = [];
    coords[0] = size;
    coords[1] = 0;
    coords[2] = 0;

    coords[3] = size;
    coords[4] = size;
    coords[5] = 0;

    coords[6] = 0;
    coords[7] = 0;
    coords[8] = 0;

    coords[9] = 0;
    coords[10] = size;
    coords[11] = 0;

    return coords;
}

function translateVertex(coord, x, y, z) {
    let vertex = [];
    vertex[0] = coord[0] + x;
    vertex[1] = coord[1] + y;
    vertex[2] = coord[2] + z;
    return vertex;
}

function translateQuad(coord, x, y, z) {
    let quad = [];
    for (let i = 0; i < 4; i++) {
        let sub = coord.slice(i * 3, i * 3 + 3);
        let erg = translateVertex(sub, x, y, z);
        quad.push(erg[0], erg[1], erg[2]);
    }
    return quad;
}

function rotateVertex(coord, axis, angle) {
    let vertex = [];
    let x = coord[0];
    let y = coord[1];
    let z = coord[2];
    let rad = math3d.toRadians(angle);
    if (axis === ROT_AXIS.X) {
        vertex[0] = x;
        vertex[1] = (y * Math.cos(rad) - z * Math.sin(rad));
        vertex[2] = (y * Math.sin(rad) + z * Math.cos(rad));
    }
    if (axis === ROT_AXIS.Y) {
        vertex[0] = (x * Math.cos(rad) + z * Math.sin(rad));;
        vertex[1] = y;
        vertex[2] = (-x * Math.sin(rad) + z * Math.cos(rad));
    }
    if (axis === ROT_AXIS.Z) {
        vertex[0] = (x * Math.cos(rad) - y * Math.sin(rad));
        vertex[1] = (x * Math.sin(rad) + y * Math.cos(rad));
        vertex[2] = z;
    }
    return vertex;
}

function rotateQuad(coord, axis, angle) {
    let quad = [];
    for (let i = 0; i < 4; i++) {
        let sub = coord.slice(i * 3, i * 3 + 3);
        sub = rotateVertex(sub, axis, angle);
        quad.push(sub[0], sub[1], sub[2]);
    }
    return quad;
}