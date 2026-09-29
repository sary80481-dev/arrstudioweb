"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export interface MathCaptchaHandle {
  reset: () => void;
}

interface Props {
  onChange: (ok: boolean) => void;
}

type Status = "idle" | "ok" | "err";

function makeQuestion() {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const rnd = (min: number, span: number) => Math.floor(Math.random() * span) + min;

  if (op === "+") {
    const [a, b] = [rnd(3, 15), rnd(3, 15)];
    return { text: `${a} + ${b} = ?`, answer: a + b };
  }
  if (op === "-") {
    const [a, b] = [rnd(10, 15), rnd(2, 8)];
    return { text: `${a} - ${b} = ?`, answer: a - b };
  }
  const [a, b] = [rnd(2, 8), rnd(2, 8)];
  return { text: `${a} × ${b} = ?`, answer: a * b };
}

/** Gambar soal dengan noise — warna diambil dari token tema */
function draw(canvas: HTMLCanvasElement, text: string) {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => css.getPropertyValue(name).trim();
  const [bg, fg, gold] = [color("--bg"), color("--fg"), color("--gold")];

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.08 + Math.random() * 0.2;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.font = `bold ${Math.min(24, h * 0.45)}px ui-monospace, monospace`;
  ctx.textBaseline = "middle";
  let x = (w - ctx.measureText(text).width) / 2;

  for (const c of text) {
    const cw = ctx.measureText(c).width;
    ctx.save();
    ctx.translate(x + cw / 2, h / 2 + (Math.random() - 0.5) * 8);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillStyle = Math.random() > 0.5 ? fg : gold;
    ctx.fillText(c, -cw / 2, 0);
    ctx.restore();
    x += cw;
  }
}

const MathCaptcha = forwardRef<MathCaptchaHandle, Props>(function MathCaptcha({ onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const answerRef = useRef(0);
  const textRef = useRef("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const generate = useCallback(() => {
    const q = makeQuestion();
    answerRef.current = q.answer;
    textRef.current = q.text;
    setInput("");
    setStatus("idle");
    onChange(false);
    if (canvasRef.current) draw(canvasRef.current, q.text);
  }, [onChange]);

  useEffect(() => {
    // canvas hanya bisa digambar setelah mount
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // gambar ulang saat tema berganti, supaya warna canvas ikut
  useEffect(() => {
    const obs = new MutationObserver(() => canvasRef.current && draw(canvasRef.current, textRef.current));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({ reset: generate }));

  const verify = (value: string) => {
    setInput(value);
    const ok = value !== "" && parseInt(value, 10) === answerRef.current;
    setStatus(value === "" ? "idle" : ok ? "ok" : "err");
    onChange(ok);
  };

  const tone = status === "ok" ? "text-green" : status === "err" ? "text-red-500" : "text-dim";

  return (
    <div className="overflow-hidden border border-line-strong bg-surface">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2">
        <span className="text-sm font-medium text-fg">Quick check</span>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${tone}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status === "ok" ? "Verified" : status === "err" ? "Wrong" : "Pending"}
        </span>
      </div>

      <div className="flex items-stretch">
        <div className="relative h-14 w-[170px] shrink-0 border-r border-line sm:w-[190px]">
          <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
          <button
            type="button"
            onClick={generate}
            title="New question"
            aria-label="New question"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md border border-line-strong bg-bg/80 text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => verify(e.target.value.replace(/[^0-9-]/g, ""))}
          placeholder="Answer"
          aria-label="Captcha answer"
          className={`min-w-0 flex-1 bg-transparent px-4 font-mono text-sm placeholder:text-dim focus:outline-none ${
            status === "idle" ? "text-fg" : tone
          }`}
        />
      </div>
    </div>
  );
});

export default MathCaptcha;
