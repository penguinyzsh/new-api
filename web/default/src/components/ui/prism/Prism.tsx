/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

import './Prism.css'

type PrismAnimationType = 'rotate' | 'hover' | '3drotate'

interface PrismProps {
  height?: number
  baseWidth?: number
  animationType?: PrismAnimationType
  glow?: number
  offset?: { x?: number; y?: number }
  noise?: number
  transparent?: boolean
  scale?: number
  hueShift?: number
  colorFrequency?: number
  hoverStrength?: number
  inertia?: number
  bloom?: number
  suspendWhenOffscreen?: boolean
  timeScale?: number
}

export function Prism(props: PrismProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const height = Math.max(0.001, props.height ?? 3.5)
    const baseHalf = Math.max(0.001, props.baseWidth ?? 5.5) * 0.5
    const glow = Math.max(0, props.glow ?? 1)
    const noise = Math.max(0, props.noise ?? 0.5)
    const offsetX = props.offset?.x ?? 0
    const offsetY = props.offset?.y ?? 0
    const saturation = (props.transparent ?? true) ? 1.5 : 1
    const scale = Math.max(0.001, props.scale ?? 3.6)
    const hueShift = props.hueShift ?? 0
    const colorFrequency = Math.max(0, props.colorFrequency ?? 1)
    const bloom = Math.max(0, props.bloom ?? 1)
    const timeScale = Math.max(0, props.timeScale ?? 0.5)
    const hoverStrength = Math.max(0, props.hoverStrength ?? 2)
    const inertia = Math.max(0, Math.min(1, props.inertia ?? 0.05))
    const animationType = props.animationType ?? 'rotate'
    const transparent = props.transparent ?? true
    const dpr = Math.min(1, window.devicePixelRatio || 1)
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const renderer = new Renderer({ dpr, alpha: transparent, antialias: false })
    const gl = renderer.gl
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.disable(gl.BLEND)

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
    })
    container.appendChild(gl.canvas)

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3 uRot;
      uniform int uUseBaseWobble;
      uniform float uGlow;
      uniform vec2 uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x) {
        vec4 e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p) {
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p) {
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      mat3 hueRotation(float a) {
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main() {
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
        float z = 5.0;
        float d = 0.0;
        vec3 p;
        vec4 o = vec4(0.0);
        mat2 wob = mat2(1.0);

        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = 40;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += uCenterShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * uColorFreq + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);
        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);
        float lightness = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(lightness), col, uSaturation), 0.0, 1.0);

        if (abs(uHueShift) > 0.0001) {
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `

    const geometry = new Triangle(gl)
    const resolution = new Float32Array(2)
    const offset = new Float32Array(2)
    const rotation = new Float32Array(9)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
        uHeight: { value: height },
        uBaseHalf: { value: baseHalf },
        uUseBaseWobble: { value: 1 },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: glow },
        uOffsetPx: { value: offset },
        uNoise: { value: noise },
        uSaturation: { value: saturation },
        uHueShift: { value: hueShift },
        uColorFreq: { value: colorFrequency },
        uBloom: { value: bloom },
        uCenterShift: { value: height * 0.25 },
        uInvBaseHalf: { value: 1 / baseHalf },
        uInvHeight: { value: 1 / height },
        uMinAxis: { value: Math.min(baseHalf, height) },
        uPxScale: { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * scale) },
        uTimeScale: { value: timeScale },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      renderer.setSize(container.clientWidth || 1, container.clientHeight || 1)
      resolution[0] = gl.drawingBufferWidth
      resolution[1] = gl.drawingBufferHeight
      offset[0] = offsetX * dpr
      offset[1] = offsetY * dpr
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * scale)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const setRotation = (yaw: number, pitch: number, roll: number) => {
      const cy = Math.cos(yaw)
      const sy = Math.sin(yaw)
      const cx = Math.cos(pitch)
      const sx = Math.sin(pitch)
      const cz = Math.cos(roll)
      const sz = Math.sin(roll)
      rotation[0] = cy * cz + sy * sx * sz
      rotation[1] = cx * sz
      rotation[2] = -sy * cz + cy * sx * sz
      rotation[3] = -cy * sz + sy * sx * cz
      rotation[4] = cx * cz
      rotation[5] = sy * sz + cy * sx * cz
      rotation[6] = sy * cx
      rotation[7] = -sx
      rotation[8] = cy * cx
      return rotation
    }

    let frame = 0
    let intersectionObserver: IntersectionObserver | undefined
    let yaw = 0
    let pitch = 0
    let targetYaw = 0
    let targetPitch = 0
    const pointer = { x: 0, y: 0, inside: true }
    const startedAt = performance.now()
    const frameInterval = 1000 / 30
    let lastRenderedAt = 0
    const randomX = 0.3 + Math.random() * 0.6
    const randomY = 0.2 + Math.random() * 0.7
    const randomZ = 0.1 + Math.random() * 0.5
    const phaseX = Math.random() * Math.PI * 2
    const phaseZ = Math.random() * Math.PI * 2

    const render = (time: number) => {
      if (time - lastRenderedAt < frameInterval) {
        frame = requestAnimationFrame(render)
        return
      }
      lastRenderedAt = time
      const elapsed = (time - startedAt) * 0.001
      program.uniforms.iTime.value = elapsed
      let continueRendering = true

      if (animationType === 'hover') {
        targetYaw = (pointer.inside ? -pointer.x : 0) * 0.6 * hoverStrength
        targetPitch = (pointer.inside ? pointer.y : 0) * 0.6 * hoverStrength
        yaw += (targetYaw - yaw) * inertia
        pitch += (targetPitch - pitch) * inertia
        program.uniforms.uRot.value = setRotation(yaw, pitch, 0)
        if (noise < 1e-6) {
          continueRendering =
            Math.abs(yaw - targetYaw) >= 1e-4 ||
            Math.abs(pitch - targetPitch) >= 1e-4
        }
      } else if (animationType === '3drotate') {
        const scaledTime = elapsed * timeScale
        yaw = scaledTime * randomY
        pitch = Math.sin(scaledTime * randomX + phaseX) * 0.6
        const roll = Math.sin(scaledTime * randomZ + phaseZ) * 0.5
        program.uniforms.uRot.value = setRotation(yaw, pitch, roll)
        continueRendering = !prefersReducedMotion && timeScale >= 1e-6
      } else {
        program.uniforms.uRot.value = setRotation(0, 0, 0)
        continueRendering = !prefersReducedMotion && timeScale >= 1e-6
      }

      renderer.render({ scene: mesh })
      frame = continueRendering ? requestAnimationFrame(render) : 0
    }

    const startRendering = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const stopRendering = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }
    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = Math.max(
        -1,
        Math.min(
          1,
          (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
        )
      )
      pointer.y = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
        )
      )
      pointer.inside = true
      startRendering()
    }
    const handlePointerLeave = () => {
      pointer.inside = false
    }
    const handleVisibilityChange = () => {
      if (document.hidden) stopRendering()
      else startRendering()
    }

    program.uniforms.uUseBaseWobble.value = animationType === 'rotate' ? 1 : 0
    if (animationType === 'hover') {
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })
      window.addEventListener('mouseleave', handlePointerLeave)
      window.addEventListener('blur', handlePointerLeave)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (props.suspendWhenOffscreen) {
      intersectionObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) startRendering()
        else stopRendering()
      })
      intersectionObserver.observe(container)
    } else {
      startRendering()
    }

    return () => {
      stopRendering()
      resizeObserver.disconnect()
      intersectionObserver?.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('blur', handlePointerLeave)
      if (gl.canvas.parentElement === container)
        container.removeChild(gl.canvas)
    }
  }, [
    props.animationType,
    props.baseWidth,
    props.bloom,
    props.colorFrequency,
    props.glow,
    props.height,
    props.hoverStrength,
    props.inertia,
    props.noise,
    props.offset?.x,
    props.offset?.y,
    props.scale,
    props.suspendWhenOffscreen,
    props.timeScale,
    props.transparent,
    props.hueShift,
  ])

  return <div ref={containerRef} className='prism-container' />
}
