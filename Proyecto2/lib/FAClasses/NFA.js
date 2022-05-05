/* eslint-disable global-require */
const { sortBy } = require('lodash');
const { performance } = require('universal-perf-hooks');

const FSM = require('./FSM');
const { TOKEN_TYPE } = require('./Lexer');

const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'Ñ',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'A1',
  'B1',
  'C1',
  'D1',
  'E1',
  'F1',
  'G1',
  'H1',
  'I1',
  'J1',
  'K1',
  'L1',
  'M1',
  'N1',
  'Ñ1',
  'O1',
  'P1',
  'Q1',
  'R1',
  'S1',
  'T1',
  'U1',
  'V1',
  'W1',
  'X1',
  'Y1',
  'Z1',
  'A2',
  'B2',
  'C2',
  'D2',
  'E2',
  'F2',
  'G2',
  'H2',
  'I2',
  'J2',
  'K2',
  'L2',
  'M2',
  'N2',
  'Ñ2',
  'O2',
  'P2',
  'Q2',
  'R2',
  'S2',
  'T2',
  'U2',
  'V2',
  'W2',
  'X2',
  'Y2',
  'Z2',
  'A3',
  'B3',
  'C3',
  'D3',
  'E3',
  'F3',
  'G3',
  'H3',
  'I3',
  'J3',
  'K3',
  'L3',
  'M3',
  'N3',
  'Ñ3',
  'O3',
  'P3',
  'Q3',
  'R3',
  'S3',
  'T3',
  'U3',
  'V3',
  'W3',
  'X3',
  'Y3',
  'Z3',
  'A4',
  'B4',
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'H4',
  'I4',
  'J4',
  'K4',
  'L4',
  'M4',
  'N4',
  'Ñ4',
  'O4',
  'P4',
  'Q4',
  'R4',
  'S4',
  'T4',
  'U4',
  'V4',
  'W4',
  'X4',
  'Y4',
  'Z4',
  'A5',
  'B5',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'H5',
  'I5',
  'J5',
  'K5',
  'L5',
  'M5',
  'N5',
  'Ñ5',
  'O5',
  'P5',
  'Q5',
  'R5',
  'S5',
  'T5',
  'U5',
  'V5',
  'W5',
  'X5',
  'Y5',
  'Z5',
  'A6',
  'B6',
  'C6',
  'D6',
  'E6',
  'F6',
  'G6',
  'H6',
  'I6',
  'J6',
  'K6',
  'L6',
  'M6',
  'N6',
  'Ñ6',
  'O6',
  'P6',
  'Q6',
  'R6',
  'S6',
  'T6',
  'U6',
  'V6',
  'W6',
  'X6',
  'Y6',
  'Z6',
  'A7',
  'B7',
  'C7',
  'D7',
  'E7',
  'F7',
  'G7',
  'H7',
  'I7',
  'J7',
  'K7',
  'L7',
  'M7',
  'N7',
  'Ñ7',
  'O7',
  'P7',
  'Q7',
  'R7',
  'S7',
  'T7',
  'U7',
  'V7',
  'W7',
  'X7',
  'Y7',
  'Z7',
  'A8',
  'B8',
  'C8',
  'D8',
  'E8',
  'F8',
  'G8',
  'H8',
  'I8',
  'J8',
  'K8',
  'L8',
  'M8',
  'N8',
  'Ñ8',
  'O8',
  'P8',
  'Q8',
  'R8',
  'S8',
  'T8',
  'U8',
  'V8',
  'W8',
  'X8',
  'Y8',
  'Z8',
];

const _EPSILONClosure = (nfaStates, nfaGraph) => {
  let closure = [];
  const stack = [];
  for (let i = 0; i < nfaStates.length; ++i) {
    stack.push(nfaStates[i]);
    closure.push(nfaStates[i]);
  }
  while (stack.length) {
    const stateId = stack.shift();
    for (let i = 0; i < nfaGraph[stateId].length; ++i) {
      const nextId = nfaGraph[stateId][i][1];
      const label = nfaGraph[stateId][i][0];
      if (label === TOKEN_TYPE.EPSILON
        && closure.indexOf(nextId) === -1) {
        closure.push(nextId);
        stack.push(nextId);
      }
    }
  }
  closure = sortBy(closure);
  return closure;
};

const _move = (dfaState, letter, id2States, nfaGraph) => {
  const stateArray = id2States[dfaState.id];
  let result = [];
  for (let i = 0; i < stateArray.length; ++i) {
    const id = stateArray[i];
    for (let k = 0; k < nfaGraph[id].length; ++k) {
      const label = nfaGraph[id][k][0];
      if (label === letter) {
        result.push(nfaGraph[id][k][1]);
      }
    }
  }
  result = sortBy(result);
  return result;
};

const constructGraph = function (startState) {
  const nfaGraph = {};
  const queue = [];
  queue.push(startState);
  const vis = {};
  while (queue.length) {
    const state = queue.shift();
    nfaGraph[state.id] = [];
    for (let i = 0; i < (state.nextStates).length; ++i) {
      const nextId = state.nextStates[i][1].id;
      const label = state.nextStates[i][0].text;
      // const nextState = state.nextStates[i][1];
      nfaGraph[state.id].push([label, nextId]);
      if (nextId in vis) {
        continue;
      }
      vis[nextId] = 1;
      queue.push(state.nextStates[i][1]);
    }
  }

  return nfaGraph;
};

class NFA {
  constructor(startState, endState) {
    this.startState = startState;
    this.endState = endState;
  }

  toDFA() {
    const beginTime = performance.now();

    const nfaGraph = constructGraph(this.startState);
    const alphabetTable = {};
    for (const id in nfaGraph) {
      for (let j = 0; j < nfaGraph[id].length; ++j) {
        const label = nfaGraph[id][j][0];
        if (!alphabetTable.hasOwnProperty(label)
          && label !== TOKEN_TYPE.EPSILON) {
          alphabetTable[label] = 1;
        }
      }
    }

    const dStates = [];
    const states2Id = {}; // [1, 2, 3] => id
    const id2States = {}; // id => [1, 2, 3]
    let id = 0;
    const closure = _EPSILONClosure([this.startState.id], nfaGraph);
    states2Id[JSON.stringify(closure)] = id;
    id2States[id] = closure;
    dStates.push({ id: id++, nextStates: {}, vis: false });

    dStates[dStates.length - 1].accept = closure.indexOf(this.endState.id) !== -1;
    dStates[dStates.length - 1].initial = closure.indexOf(this.startState.id) !== -1;
    let unvisCnt = 1;
    while (unvisCnt) {
      const [unvisState] = dStates.filter((state) => !state.vis);
      unvisState.vis = true;
      --unvisCnt;
      for (const letter in alphabetTable) {
        if (letter === TOKEN_TYPE.EPSILON) { continue; }

        const nextStates = _EPSILONClosure(
          _move(unvisState, letter, id2States, nfaGraph), nfaGraph,
        );

        if (!nextStates.length) { continue; }
        const nextStatesString = JSON.stringify(nextStates);
        if (!states2Id.hasOwnProperty(nextStatesString)) {
          states2Id[nextStatesString] = id;
          id2States[id] = nextStates;
          dStates.push({
            id: id++,
            nextStates: {},
            vis: false,
            accept: nextStates.indexOf(this.endState.id) !== -1,
            initial: nextStates.indexOf(this.startState.id) !== -1,
          });
          ++unvisCnt;
        }

        unvisState.nextStates[letter] = nextStates;
      }
    }

    const dfa = new FSM();
    dfa.type = 'DFA';
    dfa.numOfStates = id;
    const numberToLetter = (number) => letters[number];

    for (let i = 0; i < dStates.length; ++i) {
      if (dStates[i].initial) { dfa.initialState = numberToLetter(dStates[i].id); }
      if (dStates[i].accept) { dfa.acceptStates.push(numberToLetter(dStates[i].id)); }

      for (const letter in alphabetTable) {
        if (!dStates[i].nextStates[letter]) { continue; }
        const arrayId = [];
        for (let j = 0; j < dStates[i].nextStates[letter].length; ++j) {
          arrayId.push(dStates[i].nextStates[letter][j]);
        }

        if (arrayId.length) {
          if (!dfa.transitions[numberToLetter(dStates[i].id)]) {
            dfa.transitions[numberToLetter(dStates[i].id)] = {};
          }

          dfa.transitions[
            numberToLetter(dStates[i].id)
          ][
            numberToLetter(states2Id[JSON.stringify(arrayId)])
          ] = letter;
        }
      }
    }

    const executionTime = performance.now() - beginTime;
    return {
      executionTime,
      dfa,
    };
  }
}

module.exports = NFA;
