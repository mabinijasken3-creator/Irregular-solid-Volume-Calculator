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