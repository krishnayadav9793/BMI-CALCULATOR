// HealthLanding.jsx
// Stack: React + Vite + Tailwind CSS + Three.js
// Install: npm install three @react-three/fiber @react-three/drei framer-motion
// Fonts: Add to index.html → <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Global CSS Variables (put in src/styles/globals.css) ───────────────────
// :root {
//   --color-primary: #0D4F3C;
//   --color-primary-light: #1A7A5E;
//   --color-accent: #2ECFA8;
//   --color-accent-glow: rgba(46, 207, 168, 0.25);
//   --bg-base: #F5F0E8;
//   --bg-dark: #0A0F0D;
//   --color-danger: #FF6B4A;
//   --color-warning: #F5A623;
//   --font-display: 'Clash Display', sans-serif;
//   --font-body: 'DM Sans', sans-serif;
// }

// ─── Three.js DNA Helix Scene ────────────────────────────────────────────────
function DNACanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Ambient + directional lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0x2ecfa8, 2);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xff6b4a, 1.2);
    dirLight2.position.set(-3, -2, 2);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);

    // DNA Strand parameters
    const TURNS = 4;
    const POINTS = 120;
    const RADIUS = 1.2;
    const HEIGHT = 6;

    const mat1 = new THREE.MeshPhongMaterial({ color: 0x2ecfa8, shininess: 120 });
    const mat2 = new THREE.MeshPhongMaterial({ color: 0x0d4f3c, shininess: 100 });
    const runMat = new THREE.MeshPhongMaterial({ color: 0xff6b4a, shininess: 80 });

    const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const cylinderGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);

    // Build helix strands
    for (let i = 0; i < POINTS; i++) {
      const t = i / POINTS;
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;

      // Strand A
      const xA = Math.cos(angle) * RADIUS;
      const zA = Math.sin(angle) * RADIUS;
      const sA = new THREE.Mesh(sphereGeo, mat1);
      sA.position.set(xA, y, zA);
      group.add(sA);

      // Strand B (opposite)
      const xB = Math.cos(angle + Math.PI) * RADIUS;
      const zB = Math.sin(angle + Math.PI) * RADIUS;
      const sB = new THREE.Mesh(sphereGeo, mat2);
      sB.position.set(xB, y, zB);
      group.add(sB);

      // Rungs every ~10 points
      if (i % 10 === 0) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, RADIUS * 2, 6),
          runMat
        );
        rung.position.set((xA + xB) / 2, y, (zA + zB) / 2);
        // Rotate rung to connect A→B
        rung.lookAt(new THREE.Vector3(xA, y, zA));
        rung.rotateX(Math.PI / 2);
        group.add(rung);
      }
    }

    // Floating particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x2ecfa8, size: 0.04, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(particleGeo, particleMat));

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.3;
      group.rotation.x = Math.sin(t * 0.15) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── Animated Number Counter ─────────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = end / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── BMI Gauge ───────────────────────────────────────────────────────────────
function BMIGauge({ bmi }) {
  const zones = [
    { label: "Under", max: 18.5, color: "#4fc3f7" },
    { label: "Normal", max: 25, color: "#2ECFA8" },
    { label: "Over", max: 30, color: "#F5A623" },
    { label: "Obese", max: 40, color: "#FF6B4A" },
  ];
  const clamp = Math.min(Math.max(bmi, 10), 40);
  const pct = ((clamp - 10) / 30) * 100;
  const current = zones.find((z) => bmi <= z.max) || zones[zones.length - 1];

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", gap: "4px", borderRadius: "99px", overflow: "hidden", height: "12px", marginBottom: "8px" }}>
        {zones.map((z) => (
          <div key={z.label} style={{ flex: 1, background: z.color, opacity: 0.4 }} />
        ))}
      </div>
      <div style={{ position: "relative", height: "12px", marginTop: "-20px" }}>
        <div style={{
          position: "absolute", left: `${pct}%`, transform: "translateX(-50%)",
          width: "18px", height: "18px", borderRadius: "50%",
          background: current.color, border: "3px solid #fff",
          boxShadow: `0 0 10px ${current.color}`,
          transition: "left 0.5s ease",
          marginTop: "-3px"
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
        {zones.map((z) => (
          <span key={z.label} style={{ fontSize: "11px", color: z.color, fontWeight: bmi <= z.max && zones[0] !== z ? "600" : "400" }}>{z.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Page() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState(1.55);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
  const bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * activity);
  const water = +(weight * 0.033).toFixed(1);
  const bmiStatus = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const statusColor = bmi < 18.5 ? "#4fc3f7" : bmi < 25 ? "#2ECFA8" : bmi < 30 ? "#F5A623" : "#FF6B4A";

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: scrollY > 60 ? "rgba(10,15,13,0.95)" : "transparent",
    backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
    borderBottom: scrollY > 60 ? "1px solid rgba(46,207,168,0.15)" : "none",
    transition: "all 0.3s ease",
    padding: "1rem 2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };

  const features = [
    { icon: "⚖️", title: "BMI Analysis", desc: "Precise body mass index with personalized risk assessment and recommendations." },
    { icon: "🔥", title: "Calorie Calculator", desc: "TDEE-based daily calorie targets tailored to your fitness goals." },
    { icon: "💧", title: "Hydration Tracker", desc: "Science-backed daily water intake based on your body weight and climate." },
    { icon: "🎯", title: "Ideal Weight", desc: "Multiple clinical formulas (Devine, Hamwi, Robinson) compared side by side." },
    { icon: "💪", title: "Body Fat %", desc: "Navy circumference method with visual body composition breakdown." },
    { icon: "🧬", title: "Health Score", desc: "Composite wellness score combining all your metrics into one clear number." },
  ];

  return (
    <div style={{ background: "#0A0F0D", color: "#F5F0E8", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #2ECFA8, #0D4F3C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🌿</div>
          <span style={{ fontWeight: "700", fontSize: "18px", letterSpacing: "-0.5px" }}>VitalAI</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>
          {["Calculator", "Features", "Tips"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#2ECFA8"}
              onMouseLeave={e => e.target.style.color = "rgba(245,240,232,0.7)"}>{l}</a>
          ))}
        </div>
        <button style={{ background: "linear-gradient(135deg, #2ECFA8, #1A7A5E)", color: "#0A0F0D", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          Get Started
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "0 4rem", gap: "2rem", paddingTop: "5rem" }}>
        <div style={{ animation: "fadeInUp 0.8s ease forwards" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(46,207,168,0.1)", border: "1px solid rgba(46,207,168,0.3)", borderRadius: "99px", padding: "6px 16px", fontSize: "12px", color: "#2ECFA8", marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
            ✦ AI-POWERED HEALTH ANALYSIS
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "800", lineHeight: "1.05", letterSpacing: "-2px", marginBottom: "1.5rem" }}>
            Know Your Body.<br />
            <span style={{ background: "linear-gradient(90deg, #2ECFA8, #4fc3f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Transform</span> Your Health.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(245,240,232,0.6)", lineHeight: "1.7", maxWidth: "480px", marginBottom: "2.5rem" }}>
            Get personalized health insights based on your BMI, calorie needs, hydration, and more — backed by clinical science.
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button style={{ background: "linear-gradient(135deg, #2ECFA8, #1A7A5E)", color: "#0A0F0D", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 0 30px rgba(46,207,168,0.3)" }}>
              Analyze My Health →
            </button>
            <button style={{ background: "transparent", color: "#F5F0E8", border: "1px solid rgba(245,240,232,0.2)", borderRadius: "12px", padding: "14px 24px", fontSize: "15px", cursor: "pointer" }}>
              See Demo
            </button>
          </div>
          <div style={{ display: "flex", gap: "2rem", marginTop: "3rem" }}>
            {[["50K+", "Users"], ["98%", "Accuracy"], ["6", "Health Tools"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#2ECFA8" }}>{n}</div>
                <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.5)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <div style={{ position: "relative", height: "550px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "24px", overflow: "hidden" }}>
            <DNACanvas />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, #0A0F0D 75%)", borderRadius: "24px", pointerEvents: "none" }} />
          {/* Floating cards */}
          <div style={{ position: "absolute", bottom: "2rem", left: "-1rem", background: "rgba(13,79,60,0.85)", backdropFilter: "blur(12px)", borderRadius: "14px", padding: "12px 18px", border: "1px solid rgba(46,207,168,0.3)", animation: "float 3s ease-in-out infinite" }}>
            <div style={{ fontSize: "11px", color: "#2ECFA8", marginBottom: "4px" }}>YOUR BMI</div>
            <div style={{ fontSize: "22px", fontWeight: "800" }}>22.4 <span style={{ fontSize: "13px", color: "#2ECFA8" }}>Normal</span></div>
          </div>
          <div style={{ position: "absolute", top: "2rem", right: "-1rem", background: "rgba(13,79,60,0.85)", backdropFilter: "blur(12px)", borderRadius: "14px", padding: "12px 18px", border: "1px solid rgba(46,207,168,0.3)", animation: "float 3s ease-in-out infinite 1.5s" }}>
            <div style={{ fontSize: "11px", color: "#F5A623", marginBottom: "4px" }}>DAILY CALORIES</div>
            <div style={{ fontSize: "22px", fontWeight: "800" }}>2,340 <span style={{ fontSize: "11px", color: "rgba(245,240,232,0.5)" }}>kcal</span></div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div style={{ background: "rgba(46,207,168,0.06)", borderTop: "1px solid rgba(46,207,168,0.15)", borderBottom: "1px solid rgba(46,207,168,0.15)", padding: "2rem 4rem", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[["50,000+", "Active Users"], ["6", "Health Tools"], ["< 30s", "Full Analysis"], ["100%", "Free"]].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#2ECFA8" }}>{n}</div>
            <div style={{ fontSize: "13px", color: "rgba(245,240,232,0.5)", marginTop: "4px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── HEALTH CALCULATOR ── */}
      <section id="calculator" style={{ padding: "5rem 4rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }}>Your Health Dashboard</h2>
          <p style={{ color: "rgba(245,240,232,0.5)", marginTop: "0.75rem" }}>Enter your details and get instant insights</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
          {/* Inputs */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(46,207,168,0.15)", borderRadius: "20px", padding: "2rem" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#2ECFA8", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>YOUR DETAILS</h3>
            {[
              { label: "Height (cm)", val: height, set: setHeight, min: 120, max: 220 },
              { label: "Weight (kg)", val: weight, set: setWeight, min: 30, max: 200 },
              { label: "Age", val: age, set: setAge, min: 10, max: 90 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                  <span style={{ color: "rgba(245,240,232,0.6)" }}>{label}</span>
                  <span style={{ color: "#2ECFA8", fontWeight: "700" }}>{val}</span>
                </div>
                <input type="range" min={min} max={max} value={val} onChange={e => set(+e.target.value)}
                  style={{ width: "100%", accentColor: "#2ECFA8" }} />
              </div>
            ))}

            <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
              {["male", "female"].map(g => (
                <button key={g} onClick={() => setGender(g)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s",
                    borderColor: gender === g ? "#2ECFA8" : "rgba(255,255,255,0.1)",
                    background: gender === g ? "rgba(46,207,168,0.15)" : "transparent",
                    color: gender === g ? "#2ECFA8" : "rgba(245,240,232,0.5)" }}>
                  {g === "male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>

            <div style={{ fontSize: "13px", color: "rgba(245,240,232,0.6)", marginBottom: "6px" }}>Activity Level</div>
            <select value={activity} onChange={e => setActivity(+e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#F5F0E8", border: "1px solid rgba(46,207,168,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", cursor: "pointer" }}>
              {[["1.2", "Sedentary (desk job)"], ["1.375", "Light (1-3x/week)"], ["1.55", "Moderate (3-5x/week)"], ["1.725", "Active (6-7x/week)"], ["1.9", "Very Active (athlete)"]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* BMI Card */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${statusColor}40`, borderRadius: "20px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>BMI</span>
                <span style={{ background: `${statusColor}20`, color: statusColor, fontSize: "11px", padding: "3px 10px", borderRadius: "99px", fontWeight: "600" }}>{bmiStatus}</span>
              </div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: statusColor }}>{bmi}</div>
              <BMIGauge bmi={bmi} />
            </div>

            {/* Other metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Daily Calories", value: tdee.toLocaleString(), unit: "kcal", color: "#F5A623" },
                { label: "Water Intake", value: water, unit: "L/day", color: "#4fc3f7" },
                { label: "BMR", value: Math.round(bmr).toLocaleString(), unit: "kcal", color: "#2ECFA8" },
                { label: "Ideal Weight", value: `${Math.round(21.75 * (height / 100) ** 2)}`, unit: "kg", color: "#c678dd" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, borderRadius: "14px", padding: "1rem" }}>
                  <div style={{ fontSize: "11px", color: "rgba(245,240,232,0.4)", marginBottom: "6px" }}>{label}</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "800", color }}>{value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(245,240,232,0.4)" }}>{unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "5rem 4rem", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }}>All Health Tools</h2>
          <p style={{ color: "rgba(245,240,232,0.5)", marginTop: "0.75rem" }}>Everything you need in one place</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", maxWidth: "900px", margin: "0 auto" }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(46,207,168,0.1)", borderRadius: "16px", padding: "1.5rem", transition: "all 0.3s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(46,207,168,0.4)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(46,207,168,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "28px", marginBottom: "0.75rem" }}>{icon}</div>
              <div style={{ fontWeight: "700", marginBottom: "0.5rem" }}>{title}</div>
              <div style={{ fontSize: "13px", color: "rgba(245,240,232,0.5)", lineHeight: "1.6" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(46,207,168,0.1)", padding: "2rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "rgba(245,240,232,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🌿</span> <span style={{ fontWeight: "700", color: "#F5F0E8" }}>VitalAI</span>
        </div>
        <span>© 2025 VitalAI · Made with care for better health</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0F0D; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        input[type=range] { height: 4px; border-radius: 99px; cursor: pointer; }
        select { outline: none; }
        select option { background: #111814; }
      `}</style>
    </div>
  );
}