let chart = null;

// Build function safely
function createFunction(expr) {
  try {
    const compiled = math.compile(expr);

    return function(x) {
      return compiled.evaluate({
        x: x,
        e: Math.E,
        pi: Math.PI
      });
    };

  } catch (err) {
    return null;
  }
}

// Detect function type
function detectName(expr) {
  expr = expr.toLowerCase();

  if (expr.includes("sin")) return "Sine Function";
  if (expr.includes("cos")) return "Cosine Function";
  if (expr.includes("tan")) return "Tangent Function";
  if (expr.includes("log") || expr.includes("ln")) return "Logarithmic Function";
  if (expr.includes("sqrt")) return "Root Function";
  if (expr.includes("x^2")) return "Parabolic Function";
  if (expr.includes("e^")) return "Exponential Function";

  return "Custom Function";
}

function calculate() {
  const expr = document.getElementById("func").value.trim();
  const a = parseFloat(document.getElementById("min").value);
  const b = parseFloat(document.getElementById("max").value);

  if (!expr) {
    alert("Please enter a function");
    return;
  }

  if (isNaN(a) || isNaN(b) || a >= b) {
    alert("Invalid min/max values");
    return;
  }

  const f = createFunction(expr);

  if (!f) {
    alert("Invalid function format");
    return;
  }

  let n = 1000;
  let h = (b - a) / n;
  let volume = 0;

  let funcData = [];
  let areaData = [];

  for (let i = 0; i <= n; i++) {
    let x = a + i * h;
    let y;

    try {
      y = f(x);
      if (!isFinite(y)) continue;
    } catch {
      continue;
    }

    volume += Math.PI * y * y;

    funcData.push({ x: x, y: y });
    areaData.push({ x: x, y: Math.abs(y) });
  }

  volume *= h;

  document.getElementById("result").innerText =
    "Volume: " + volume.toFixed(4);

  document.getElementById("fname").innerText =
    "Detected: " + detectName(expr);
   drawGraph(funcData, areaData);
  createSolid(f, a, b);
}

function drawGraph(funcData, areaData) {
  const ctx = document.getElementById("graph");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "f(x)",
          data: funcData,
          borderColor: "#9370DB",
          borderWidth: 2,
          fill: false,
          parsing: false
        },
        {
          label: "Disk Area",
          data: areaData,
          backgroundColor: "rgba(147,112,219,0.2)",
          borderColor: "rgba(147,112,219,0.3)",
          fill: true,
          parsing: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          grid: { color: "#333" }
        },
        y: {
          grid: { color: "#333" }
        }
      }
    }
  });
}

 let scene, camera, renderer, mesh;

function init3D() {
  const container = document.getElementById("threeContainer");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  animate();
}

function createSolid(f, a, b) {
  const container = document.getElementById("threeContainer");
  if (!container) return;

  if (!scene) init3D();

  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }

  const points = [];
  let steps = 100;
  let h = (b - a) / steps;

  for (let i = 0; i <= steps; i++) {
    let x = a + i * h;
    let y;

    try {
      y = Math.abs(f(x));
      if (!isFinite(y)) y = 0;
    } catch {
      y = 0;
    }

    points.push(new THREE.Vector2(y, x));
  }

  const geometry = new THREE.LatheGeometry(points, 60);

  const material = new THREE.MeshStandardMaterial({
    color: 0x9370db,
    metalness: 0.3,
    roughness: 0.4,
    side: THREE.DoubleSide
  });

  mesh = new THREE.Mesh(geometry, material);

  // ✅ CENTER THE OBJECT
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  mesh.position.sub(center);

  // ✅ AUTO SCALE (VERY IMPORTANT)
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  const scale = 5 / maxDim; // adjust "5" if needed
  mesh.scale.set(scale, scale, scale);

  scene.add(mesh);

  // ✅ AUTO CAMERA POSITION
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
    }
function animate() {
  requestAnimationFrame(animate);

  if (mesh) {
    mesh.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
