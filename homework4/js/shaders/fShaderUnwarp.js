/**
 * @file Unwarp fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/21
 */

/* TODO (2.2.2) Fragment shader implementation */

var shaderID = "fShaderUnwarp";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

varying vec2 textureCoords;

// texture rendered in the first rendering pass
uniform sampler2D map;

// center of lens for un-distortion
// in normalized coordinates between 0 and 1
uniform vec2 centerCoordinate;

// [width, height] size of viewport in [mm]
// viewport is the left/right half of the browser window
uniform vec2 viewportSize;

// lens distortion parameters [K_1, K_2]
uniform vec2 K;

// distance between lens and screen in [mm]
uniform float distLensScreen;

void main() {
	// xu, yu: undistroted point
	// xd = xu (1+K1 * r^2 + K2 * r^4)
	// yd = yu (1+K1 * r^2 + K2 * r^4)
	// 
	float temp_x = viewportSize.x * (textureCoords.x - centerCoordinate.x);
	float temp_y = viewportSize.y * (textureCoords.y - centerCoordinate.y);

	float r_tilde = sqrt((temp_x * temp_x) + (temp_y * temp_y));
	float d = distLensScreen;
	float r = r_tilde / d;

	float factor = 1.0 + K.x * r * r + K.y * pow(r, 4.0);

	// if (factor == 1.0){gl_FragColor = texture2D( map, textureCoords );}
	

	float curr_x = (textureCoords.x - centerCoordinate.x) * factor + centerCoordinate.x;
	float curr_y = (textureCoords.y - centerCoordinate.y) * factor + centerCoordinate.y;

	if (curr_x < 1.0 && curr_x >= 0.0 && curr_y < 1.0 && curr_y >= 0.0 ){
		gl_FragColor = texture2D( map, vec2(curr_x, curr_y) );
	}
	else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}

	//gl_FragColor = texture2D( map, textureCoords);
}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
