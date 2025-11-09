export function hanoiRecursive(n, from, to, aux, moves = []) {
  if (n === 0) return moves;
  hanoiRecursive(n - 1, from, aux, to, moves);
  moves.push({ disk: n, from, to });
  hanoiRecursive(n - 1, aux, to, from, moves);
  return moves;
}

export function hanoiIterative(n, from, to, aux) {
  const pegs = { [from]: [], [aux]: [], [to]: [] };
  for (let i = n; i >= 1; i--) pegs[from].push(i);
  const moves = [];
  const totalMoves = Math.pow(2, n) - 1;

  function moveBetween(src, dst) {
    const s = pegs[src];
    const d = pegs[dst];
    if (s.length === 0) {
      s.push(d.pop());
      moves.push({ disk: s[s.length - 1], from: dst, to: src });
    } else if (d.length === 0) {
      d.push(s.pop());
      moves.push({ disk: d[d.length - 1], from: src, to: dst });
    } else if (s[s.length - 1] > d[d.length - 1]) {
      s.push(d.pop());
      moves.push({ disk: s[s.length - 1], from: dst, to: src });
    } else {
      d.push(s.pop());
      moves.push({ disk: d[d.length - 1], from: src, to: dst });
    }
  }

  const pegOrder = n % 2 === 0
    ? [[from, aux], [from, to], [aux, to]]
    : [[from, to], [from, aux], [aux, to]];

  for (let i = 0; i < totalMoves; i++) {
    const pair = pegOrder[i % 3];
    moveBetween(pair[0], pair[1]);
  }
  return moves;
}

const fsMemo = new Map();
export function frameStewartMoves(n, from, to, auxPegs) {
  const key = `${n}-${from}-${to}-${auxPegs.join(',')}`;
  if (fsMemo.has(key)) return fsMemo.get(key).slice();
  if (n === 0) return [];
  if (n === 1) {
    const m = [{ disk: 1, from, to }];
    fsMemo.set(key, m);
    return m.slice();
  }
  if (auxPegs.length === 1) {
    const moves = hanoiRecursive(n, from, to, auxPegs[0], []);
    fsMemo.set(key, moves);
    return moves.slice();
  }
  let best = null;
  for (let k = 1; k < n; k++) {
    const first = frameStewartMoves(k, from, auxPegs[0], [to, ...auxPegs.slice(1)]);
    const second = frameStewartMoves(n - k, from, to, auxPegs.slice(1).concat([auxPegs[0]]));
    const third = frameStewartMoves(k, auxPegs[0], to, [from, ...auxPegs.slice(1)]);
    const total = first.length + second.length + third.length;
    if (best === null || total < best.total) {
      best = { total, moves: [...first, ...second, ...third] };
    }
  }
  fsMemo.set(key, best.moves);
  return best.moves.slice();
}
