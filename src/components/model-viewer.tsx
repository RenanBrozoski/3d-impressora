"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { extensaoArquivo, isModelo3DVisualizavel } from "@/lib/model-utils";

export { isModelo3DVisualizavel };

function Modelo({ url, ext, onError }: { url: string; ext: string; onError: (mensagem: string) => void }) {
  const [objeto, setObjeto] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Não foi possível baixar o arquivo.");
        const buffer = await resp.arrayBuffer();
        if (cancelado) return;

        let obj: THREE.Object3D;
        if (ext === ".stl") {
          const geometria = new STLLoader().parse(buffer);
          geometria.computeVertexNormals();
          obj = new THREE.Mesh(
            geometria,
            new THREE.MeshStandardMaterial({ color: "#a78bfa", roughness: 0.55, metalness: 0.1 }),
          );
        } else if (ext === ".obj") {
          const texto = new TextDecoder().decode(buffer);
          obj = new OBJLoader().parse(texto);
          obj.traverse((filho) => {
            if (filho instanceof THREE.Mesh) {
              filho.material = new THREE.MeshStandardMaterial({ color: "#a78bfa", roughness: 0.55, metalness: 0.1 });
            }
          });
        } else if (ext === ".3mf") {
          obj = new ThreeMFLoader().parse(buffer);
        } else if (ext === ".gltf" || ext === ".glb") {
          const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
            new GLTFLoader().parse(buffer, "", resolve, reject);
          });
          obj = gltf.scene;
        } else if (ext === ".fbx") {
          obj = new FBXLoader().parse(buffer, "");
        } else if (ext === ".ply") {
          const geometria = new PLYLoader().parse(buffer);
          geometria.computeVertexNormals();
          const temCor = !!geometria.getAttribute("color");
          obj = new THREE.Mesh(
            geometria,
            temCor
              ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1 })
              : new THREE.MeshStandardMaterial({ color: "#a78bfa", roughness: 0.55, metalness: 0.1 }),
          );
        } else if (ext === ".dae") {
          const texto = new TextDecoder().decode(buffer);
          const collada = new ColladaLoader().parse(texto, "");
          if (!collada) throw new Error("Não foi possível interpretar o arquivo Collada.");
          obj = collada.scene;
        } else {
          throw new Error("Formato não suportado pro visualizador.");
        }

        if (!cancelado) setObjeto(obj);
      } catch (err) {
        if (!cancelado) onError(err instanceof Error ? err.message : "Erro ao carregar o modelo.");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [url, ext, onError]);

  if (!objeto) return null;
  return <primitive object={objeto} />;
}

export function ModelViewer({
  url,
  nomeArquivo,
  height = 320,
  className,
}: {
  url: string;
  nomeArquivo: string;
  height?: number;
  className?: string;
}) {
  const ext = extensaoArquivo(nomeArquivo);
  const [erro, setErro] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);

  if (!isModelo3DVisualizavel(nomeArquivo)) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[var(--surface-border)] bg-neutral-950 ${className ?? ""}`}
      style={{ height }}
    >
      {erro ? (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-400">{erro}</div>
      ) : (
        <>
          {!carregado && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
              Carregando modelo...
            </div>
          )}
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} onCreated={() => setCarregado(true)}>
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} intensity={40} />
            <pointLight position={[-5, -5, -5]} intensity={15} color="#60a5fa" />
            <Bounds fit clip observe margin={1.3}>
              <Modelo url={url} ext={ext} onError={setErro} />
            </Bounds>
            <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
          </Canvas>
        </>
      )}
    </div>
  );
}
