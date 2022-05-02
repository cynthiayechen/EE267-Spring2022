/**
 * @file Phong fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.2) */

var shaderID = "fShaderPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;

	vec3 fColor = ambientReflection;
	vec3 re_normalCam = normalize(normalCam);

	if (NUM_POINT_LIGHTS > 0){
		for (int i = 0; i < NUM_POINT_LIGHTS; i++){
			PointLight curr_light = pointLights[i];
			vec4 view_light = viewMat * vec4(curr_light.position, 1);
			vec3 normalized_view_light = view_light.xyz / view_light.w;

			float max_dot_product = max(dot(normalize(normalized_view_light - fragPosCam), re_normalCam), 0.0);

			vec3 R = normalize(-reflect(normalize(normalized_view_light - fragPosCam), re_normalCam));
			float max_rv_product = max(dot(R, normalize(-fragPosCam)), 0.0);
			float max_rv_shin = pow(max_rv_product, material.shininess);
			
			float d = length(normalized_view_light - fragPosCam);
			float curr_attenuation = 1.0 / (2.0 + 0.0 * d + 0.001 * d * d);

			fColor += curr_attenuation * (material.diffuse * curr_light.color * max_dot_product + material.specular * curr_light.color * max_rv_shin);
		}
	}

	gl_FragColor = vec4( fColor, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
