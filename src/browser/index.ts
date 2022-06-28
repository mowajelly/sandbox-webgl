// https://github.com/mrdoob/three.js/blob/master/examples/css3d_periodictable.html
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';


// Item element datas and generator
type IItem = {
	imgSrc: string;
}
const dataList: IItem[] = [];
new Array(50).fill(0).forEach(
	// (_, i) => dataList.push({imgSrc: '/secret/sample/img (' + (i+1) + ').jpg'})
	(_, i) => dataList.push({imgSrc: 'https://source.unsplash.com/random/200x200?' + i})
);

function ItemElement (item: IItem): HTMLDivElement {
	const element = document.createElement('div');
	element.className='item';
	element.style.backgroundColor = `rgba(0,127,127,${Math.random() * 0.5 + 0.25})`;

	const img = document.createElement('img');
	img.className = 'item__img';
	img.style.objectFit='cover';
	img.src = item.imgSrc;
	element.appendChild(img);

	return element;
}

// Three.js app ctx
type ICtx = {
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
	renderer: CSS3DRenderer,
	controls: TrackballControls,
	objects: THREE.Object3D[],
	targets: {
		table: THREE.Object3D[],
		sphere: THREE.Object3D[],
		helix: THREE.Object3D[],
		grid: THREE.Object3D[],
	},
};
// @ts-ignore
const ctx: ICtx = {
	objects: [],
	targets: {
		table: [],
		sphere: [],
		helix: [],
		grid: [],
	},
};

function render(): void {
	ctx.renderer.render(ctx.scene, ctx.camera);
}

function transform(targets: THREE.Object3D[], duration: number): void {
	TWEEN.removeAll();

	for (let i = 0; i < ctx.objects.length; i++) {
		const obj = ctx.objects[i];
		const target = targets[i];

		new TWEEN.Tween(obj.position)
			.to(
				{
					x: target.position.x,
					y: target.position.y,
					z: target.position.z,
				},
				Math.random() * duration + duration
			)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

		new TWEEN.Tween(obj.rotation)
			.to(
				{
					x: target.rotation.x,
					y: target.rotation.y,
					z: target.rotation.z,
				},
				Math.random() * duration + duration
			)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();
	}

	new TWEEN.Tween(ctx)
		.to({}, duration * 2)
		.onUpdate(render)
		.start()
		
}

function onWindowResize (): void {
	ctx.camera.aspect = window.innerWidth / window.innerHeight;
	ctx.camera.updateProjectionMatrix();

	ctx.renderer.setSize(window.innerWidth, window.innerHeight);

	render();
}

function animate (): void {
	requestAnimationFrame(animate);
	TWEEN.update();
	ctx.controls.update();
}

function init (): void {
	// Camera
	ctx.camera = new THREE.PerspectiveCamera(40, window.innerHeight / window.innerHeight, 1, 10000);
	ctx.camera.position.z = 3000;

	// Scene
	ctx.scene = new THREE.Scene();

	// Renderer
	ctx.renderer = new CSS3DRenderer();
	ctx.renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('app')?.appendChild(ctx.renderer.domElement);

	// Controller (mouse etc...)
	ctx.controls = new TrackballControls(ctx.camera, ctx.renderer.domElement);
	ctx.controls.minDistance = 500;
	ctx.controls.maxDistance = 6000;
	ctx.controls.addEventListener('change', render);

	// Load items
	dataList.forEach((v, i) => {
		const css3dObj = new CSS3DObject( ItemElement(v) );
		css3dObj.position.x = Math.random() * 4000 - 2000;
		css3dObj.position.y = Math.random() * 4000 - 2000;
		css3dObj.position.z = Math.random() * 4000 - 2000;
		ctx.objects.push(css3dObj);
		ctx.scene?.add(css3dObj);

		// Plain pos
		const obj = new THREE.Object3D();
		obj.position.x = (i % 5) * 250 - 625;
		obj.position.y = -(Math.floor(i / 5)) * 250 + 625;
		ctx.targets.table.push(obj);
	})

	// Sphere
	const vec3 = new THREE.Vector3();
	for(let i = 0, l = ctx.objects.length; i < l; i++) {
		const phi = Math.acos(-1 + (2 * i) / l);
		const theta = Math.sqrt(l * Math.PI) * phi;

		const obj = new THREE.Object3D();
		obj.position.setFromSphericalCoords(500, phi, theta);
		vec3.copy(obj.position).multiplyScalar(2);
		obj.lookAt(vec3);

		ctx.targets.sphere.push(obj);
	}

	// Helix
	for(let i = 0, l = ctx.objects.length; i < l; i++) {
		// const theta = i * 0.175 + Math.PI;
		const theta = i * 0.375 + Math.PI;
		const y = - (i * 20) + 400;

		const obj = new THREE.Object3D();

		obj.position.setFromCylindricalCoords(900, theta, y);

		vec3.x = obj.position.x * 2;
		vec3.y = obj.position.y;
		vec3.z = obj.position.z * 2;

		obj.lookAt(vec3);

		ctx.targets.helix.push(obj);
	}

	// Grid
	for (let i = 0; i < ctx.objects.length; i++) {
		const obj = new THREE.Object3D();
		obj.position.x = ((i % 5) * 400) - 800;
		obj.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
		obj.position.z = (Math.floor(i / 25)) * 1000 - 2000;

		ctx.targets.grid.push(obj);
	}

	transform(ctx.targets.table, 2000);

	window.addEventListener('resize', onWindowResize);

	document.querySelector('#float_controll .table')?.addEventListener('click', () => {
		console.log('tr');
		transform(ctx.targets.table, 2000);
	})
	document.querySelector('#float_controll .sphere')?.addEventListener('click', () => {
		transform(ctx.targets.sphere, 2000);
	})
	document.querySelector('#float_controll .helix')?.addEventListener('click', () => {
		transform(ctx.targets.helix, 2000);
	})
	document.querySelector('#float_controll .grid')?.addEventListener('click', () => {
		transform(ctx.targets.grid, 2000);
	})
	
	const blocker = document.getElementById('blocker');
	if (blocker) {
		blocker.style.display = 'none';

		ctx.controls.addEventListener('start', () => {
			blocker.style.display = '';
		});
		ctx.controls.addEventListener('end', () => {
			blocker.style.display = 'none';
		})
	}
}

init();
animate();


(<any>window).mw = {
	ctx,
	transform,
}
