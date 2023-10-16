# SRTM Tile 3D-Viewer React 1.0.0

![image](https://github.com/NeuralCortex/SRTM_Tile_3D_React/blob/main/app.png)

The SRTM Tile 3D viewer is a Web-App besed on React that enables the user to view topographic data</br>
of the NASA mission STS-99 [Shuttle Radar Topography Mission (SRTM)](https://en.wikipedia.org/wiki/STS-99) in three dimensions.</br>
The web app can load and display both SRTM-3 and SRTM-1 tiles.</br>

## How the web app works

To use the app, you need to execute following steps:
1. Install Node.js
2. Go to the project's main directory.
3. Type `npm install` - Wait for Completion
4. Type `npm start` for Development-Mode or
5. Or type `npm run build` for Production-Mode

After importing an SRTM tile, the user can view the elevation data as a 3D model.</br>
If you hold down the left mouse button and move the mouse, the SRTM tile can be rotated.</br>
The zoom is triggered by operating the mouse wheel.</br> 
The coordinates of the marker can be taken from Google Maps by placing the cursor in the Longitude or Latitude field by entering the key combination Crtl-V.</br>
All other functions should be self-explanatory.

## Structure of a file

The file name typically has the form: "N49E011.hgt".

### Internal structure

The ".hgt" file contains 16-bit signed integer values, with no header or trailer.

<pre>
                 1x1 degree SRTM3 tile
North X=0,Y=1201 ********************* X=1201,Y=1201</br>
                 *********************</br>
                 *********************</br>
                 *********************</br>
   South X=0,Y=0 ********************* X=1201,Y=0</br>
                 West             East
</pre>

<pre>
                 1x1 degree SRTM1 tile
North X=0,Y=3601 ********************* X=3601,Y=3601</br>
                 *********************</br>
                 *********************</br>
                 *********************</br>
   South X=0,Y=0 ********************* X=3601,Y=0</br>
                 West             East
</pre>

## Technology used

This web app was created with Create React App.

The following tools were used:

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org)
- [Google Chrome](https://www.google.com/chrome/)


## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
