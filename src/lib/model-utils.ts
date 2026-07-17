const EXTENSOES_VISUALIZAVEIS = [".stl", ".obj", ".3mf"];

export function extensaoArquivo(nomeArquivo: string) {
  const i = nomeArquivo.lastIndexOf(".");
  return i === -1 ? "" : nomeArquivo.slice(i).toLowerCase();
}

export function isModelo3DVisualizavel(nomeArquivo: string) {
  return EXTENSOES_VISUALIZAVEIS.includes(extensaoArquivo(nomeArquivo));
}
