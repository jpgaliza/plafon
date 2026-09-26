"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Environment, useGLTF, useTexture } from "@react-three/drei";
import { useTransform, MotionValue } from "framer-motion";
import * as THREE from "three";
import { useRef } from "react";

// Tipagem básica para os nós exportados pelo gltfjsx
type GLTFResult = {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

function IphoneModel({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const { nodes, materials } = useGLTF('/iphone.glb') as unknown as GLTFResult;
  const screenTex = useTexture('/app_screen.png');

  // Corrige a orientação da textura que geralmente vem invertida no formato GLTF
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    screenTex.flipY = false;
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [screenTex]);

  // Baseado no seu print, o ângulo inicial estava perfeito! 
  // Vamos começar daquele ângulo estiloso e, no scroll, ele apenas se endireita e sobe para o centro.
  const rotateX = useTransform(scrollProgress, [0, 1], [Math.PI / 3, 0]);
  const rotateY = useTransform(scrollProgress, [0, 1], [Math.PI / 6, 0]);
  const rotateZ = useTransform(scrollProgress, [0, 1], [Math.PI / 8, 0]);
  const y = useTransform(scrollProgress, [0, 1], [-2.5, -1.8]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotateX.get();
      groupRef.current.rotation.y = rotateY.get();
      groupRef.current.rotation.z = rotateZ.get();
      groupRef.current.position.y = y.get();
    }
  });

  return (
    <group
      ref={groupRef}
      scale={19} // Ainda maior conforme solicitado
      dispose={null}
    >
      <mesh geometry={nodes.Front_Cam_Lens.geometry} material={materials.BASE_Cam_Lens_Front} />
      <mesh geometry={nodes.USB_Metal.geometry} material={materials.BASE_Chrome_Dark} />
      <mesh geometry={nodes.Antenna.geometry} material={materials.COLOUR_Cherry_Antenna} />
      <mesh geometry={nodes.Front_Cam_Glass.geometry} material={materials.BASE_Glass} />
      <mesh geometry={nodes.Back_Panel.geometry} material={materials.COLOUR_Cherry_Backpanel} />
      <mesh geometry={nodes.Front_Speaker.geometry} material={materials.BASE_Speakers_Front} />
      <mesh geometry={nodes.Front_Panel.geometry} material={materials.BASE_Glass_Black} />
      <mesh geometry={nodes.Back_Cam_Lens.geometry} material={materials.BASE_Cam_Lens01} />
      <mesh geometry={nodes.Back_Cam_Edge.geometry} material={materials.COLOUR_Cherry_Side_Panel} />
      <mesh geometry={nodes.Back_Flash_Glass.geometry} material={materials.BASE_Flash_Glass} />
      <mesh geometry={nodes.Back_Flash_Base.geometry} material={materials.BASE_Flash_Base} />
      <mesh geometry={nodes.Back_Cam_Edge_black.geometry} material={materials.BASE_Cam_Edge_Black} />
      <mesh geometry={nodes.Back_Cam_Glass.geometry} material={materials.BASE_Glass} />
      <mesh geometry={nodes.Back_Cam_Base.geometry} material={materials.BASE_Grey} />
      <mesh geometry={nodes.Back_Flash_Light.geometry} material={materials.BASE_Flash_Light} />
      <mesh geometry={nodes.Back_Flash_Ref.geometry} material={materials.BASE_Flash_Ref}>
        <mesh geometry={nodes.Gradient.geometry} material={materials.BASE_Flash_Ref_Gradient} />
      </mesh>
      <mesh geometry={nodes.Screws_Aniso_01.geometry} material={materials.COLOUR_Cherry_Aniso} />
      <mesh geometry={nodes.Screws_Aniso_02.geometry} material={materials.COLOUR_Cherry_Aniso} />
      <mesh geometry={nodes.Side_Panel_Speakers.geometry} material={materials.BASE_Speakers} />
      <mesh geometry={nodes.USB_Border.geometry} material={materials.COLOUR_Cherry_Antenna} />
      <mesh geometry={nodes.USB_Base.geometry} material={materials.COLOUR_Cherry_Plastic} />
      <mesh geometry={nodes.USB_Pin.geometry} material={materials.BASE_Copper} />
      <mesh geometry={nodes.Back_Cam_Black.geometry} material={materials.BASE_Black} />
      <mesh geometry={nodes.Holes.geometry} material={materials.BASE_Black} />
      <mesh geometry={nodes.Back_Cam_Lens_02.geometry} material={materials.BASE_Cam_Lens02} />
      <mesh geometry={nodes.Back_Cam_Lens_03.geometry} material={materials.BASE_Cam_Lens03} />
      <mesh geometry={nodes.Back_IR_Glass.geometry} material={materials.BASE_Sensor} />

      {/* 
        A MÁGICA ACONTECE AQUI:
        Substituímos o material padrão da tela pelo nosso print do App!
      */}
      <mesh geometry={nodes.Front_Screen.geometry}>
        <meshBasicMaterial map={screenTex} toneMapped={false} />
      </mesh>

      <mesh geometry={nodes.Back_Mic.geometry} material={materials.BASE_Black} />
      <mesh geometry={nodes.Side_Button_Detail_Border.geometry} material={materials.COLOUR_Cherry_Button_Detail_Border} />
      <mesh geometry={nodes.Front_Sensor.geometry} material={materials.BASE_Sensor} />
      <mesh geometry={nodes.Side_Panel.geometry} material={materials.COLOUR_Cherry_Side_Panel} />
      <mesh geometry={nodes.Back_Flash_Glass_Matte.geometry} material={materials['BASE_Flash_Glass duplicate']} />
      <mesh geometry={nodes.Back_Logo.geometry} material={materials.COLOUR_Cherry_Apple} />
      <mesh geometry={nodes.Screws.geometry} material={materials.COLOUR_Cherry_Screws} />
      <mesh geometry={nodes.Side_Button.geometry} material={materials.COLOUR_Cherry_Side_Button_Detail} />
      <mesh geometry={nodes.Back_Cam_Aperture.geometry} material={materials.BASE_Grey} />
      <mesh geometry={nodes.Front_Cam_Inset.geometry} material={materials.BASE_Black} />
      <mesh geometry={nodes.Front_Cam_Base.geometry} material={materials.BASE_Grey} />
      <mesh geometry={nodes.Side_Panel_Gloss.geometry} material={materials.COLOUR_Cherry_Side_Panel_Gloss} />
      <mesh geometry={nodes.Back_Cam_Base001.geometry} material={materials.BASE_Grey_02} />
      <mesh geometry={nodes.Back_Cam_Lens_Outer.geometry} material={materials.BASE_Cam_Lens_Outer} />
    </group>
  );
}

// Faz o pre-load do arquivo 3D pesado antes mesmo de renderizar o componente
useGLTF.preload('/iphone.glb');

export function IPhoneCanvas({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Resolução retina
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Iluminação de estúdio invisível (Preset City cria reflexos ultrarrealistas em metais/vidros) */}
          <Environment preset="city" environmentIntensity={1.2} />

          <IphoneModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
