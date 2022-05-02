/**
 * @file Gouraud vertex shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.2) and (2.1.3) */

var shaderID = "vShaderGouraud";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


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

	vColor = ambientReflection;
	vec4 temp = modelViewMat * vec4(position, 1);
	vec3 vertex_pos = (temp.xyz) / temp.w;
	vec3 normalCam = normalize(normalMat * normal);

	if (NUM_POINT_LIGHTS > 0){
		for (int i = 0; i < NUM_POINT_LIGHTS; i++){
			PointLight curr_light = pointLights[i];
			vec4 view_light = viewMat * vec4(curr_light.position, 1);
			vec3 normalized_view_light = view_light.xyz / view_light.w;

			float max_dot_product = max(dot(normalize(normalized_view_light - vertex_pos), normalCam), 0.0);

			float d = length(normalized_view_light - vertex_pos);
			float curr_attenuation = 1.0 / (2.0 + 0.0 * d + 0.001 * d * d);
			vec3 R = normalize(-reflect(normalize(normalized_view_light - vertex_pos), normalCam));
			float max_rv_product = max(dot(R, normalize(-vertex_pos)), 0.0);
			float max_rv_shin = pow(max_rv_product, material.shininess);

			vColor += curr_attenuation * (material.diffuse * curr_light.color * max_dot_product + material.specular * curr_light.color * max_rv_shin);
			

		}
	}
	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
