export interface IVidSrcResponse {
  status: number;
  info: string;
  sources: Source[];
}

interface Source {
  name: string;
  data: Data;
}

interface Data {
  stream: string;
  subtitle: Subtitle[];
}

interface Subtitle {
  lang: string;
  file: string;
}
