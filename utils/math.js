// utils/math.js
const math = require('mathjs');

function solveMath(input) {
  try {
    // Clean input
    let expr = input.replace(/[^0-9a-zA-Z\.\+\-\*\/\^\(\)\=]/g, ' ').trim();

    // Solve equations: "solve 9yxT=50 if y=2"
    const eqMatch = input.toLowerCase().match(/solve\s+(.+?)\s+if\s+(.+)/);
    if (eqMatch) {
      let equation = eqMatch[1].trim();
      const condition = eqMatch[2].trim();
      const varMatch = condition.match(/([a-zA-Z]+)\s*=\s*([0-9\.]+)/);
      if (varMatch) {
        const variable = varMatch[1];
        const value = parseFloat(varMatch[2]);
        equation = equation.replace(new RegExp(variable, 'g'), `(${value})`);
      }
      const result = math.evaluate(equation);
      return `**Solution**: ${input}\n→ ${result}`;
    }

    // Direct evaluation
    const result = math.evaluate(expr);
    return `**Result**: ${input} = ${result}`;
  } catch (err) {
    return null;
  }
}

module.exports = { solveMath };
