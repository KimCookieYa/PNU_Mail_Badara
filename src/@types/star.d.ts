declare module "star" {
  export interface StarType {
    orbitRadius: number;
    radius: number;
    orbitX: number;
    orbitY: number;
    timePassed: number;
    speed: number;
    alpha: number;
    draw: () => void;
  }
}
