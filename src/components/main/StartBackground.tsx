import { useRef, useEffect } from "react";
import type { StarType } from "star";

class Star implements StarType {
  orbitRadius: number;
  radius: number;
  orbitX: number;
  orbitY: number;
  timePassed: number;
  speed: number;
  alpha: number;

  constructor(w: number, h: number, maxStars: number) {
    this.orbitRadius = random(0, maxOrbit(w, h));
    this.radius = random(60, this.orbitRadius) / 12;
    this.orbitX = w / 2;
    this.orbitY = h / 2;
    this.timePassed = random(0, maxStars);
    this.speed = random(0, this.orbitRadius) / 900000;
    this.alpha = random(2, 10) / 10;
  }

  draw() {
    // 여기에 별을 그리는 코드를 작성하세요.
    // 예: ctx.arc(this.orbitX, this.orbitY, this.radius, 0, Math.PI * 2, false);
  }
}

export default function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let animationFrameId: number;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const stars: StarType[] = [];
    const maxStars = 1400;

    Star.prototype.draw = function () {
      const x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
      const y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
      const twinkle = random(0, 10);

      if (twinkle === 1 && this.alpha > 0) {
        this.alpha -= 0.05;
      } else if (twinkle === 2 && this.alpha < 1) {
        this.alpha += 0.05;
      }

      ctx.globalAlpha = this.alpha;
      ctx.drawImage(
        canvas2,
        x - this.radius / 2,
        y - this.radius / 2,
        this.radius,
        this.radius
      );
      this.timePassed += this.speed;
    };

    for (let i = 0; i < maxStars; i++) {
      stars.push(new Star(w, h, maxStars));
    }
    const hue = 217;
    function animation() {
      if (!ctx) {
        console.log("here11");
        return;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "hsla(" + hue + ", 64%, 6%, 1)";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 1, l = stars.length; i < l; i++) {
        stars[i].draw();
      }

      animationFrameId = window.requestAnimationFrame(animation);
    }

    // 그라디언트 캔버스 생성
    const canvas2 = document.createElement("canvas");
    const ctx2 = canvas2.getContext("2d");
    if (!ctx2) return;

    canvas2.width = 100;
    canvas2.height = 100;
    const half = canvas2.width / 2;
    const gradient2 = ctx2.createRadialGradient(
      half,
      half,
      0,
      half,
      half,
      half
    );
    gradient2.addColorStop(0.025, "#fff");
    gradient2.addColorStop(0.1, "hsl(" + hue + ", 61%, 33%)");
    gradient2.addColorStop(0.25, "hsl(" + hue + ", 64%, 6%)");
    gradient2.addColorStop(1, "transparent");

    ctx2.fillStyle = gradient2;
    ctx2.beginPath();
    ctx2.arc(half, half, half, 0, Math.PI * 2);
    ctx2.fill();

    // 애니메이션 시작
    animation();

    // 컴포넌트가 언마운트 될 때 애니메이션 중지
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [window.innerWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 right-0 w-screen h-screen m-auto -z-50 sm:w-full"
    ></canvas>
  );
}

function random(min: number, max: number) {
  if (arguments.length < 2) {
    max = min;
    min = 0;
  }

  if (min > max) {
    const hold = max;
    max = min;
    min = hold;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x: number, y: number) {
  const max = Math.max(x, y);
  const diameter = Math.round(Math.sqrt(max * max + max * max));
  return diameter / 2;
}
