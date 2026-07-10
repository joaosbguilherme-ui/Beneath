const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const PHASES = {
  home: {
    needUser: true,
    next: '../fase02/',
    hints: [
      'Access denied.',
      'Look at the page title.',
      'Inspect the source.',
      'The filename matters.'
    ],
    answers: {
      username: 'architect',
      password: 'entropy'
    }
  },
  fase01: {
    needUser: false,
    next: '../fase02/',
    hints: [
      'Key not found.',
      'Be more attentive.',
      'It looks like you do not know where to look.',
      'Where do they hide the key?'
    ],
    answers: {
      password: 'undertherug'
    }
  },
  fase02: {
    needUser: true,
    next: '../fase03/',
    hints: [
      'falling blocks',
      'its name and its release date',
      'Identify the progressive pattern?',
      'Alexei Pajitnov'
    ],
    answers: {
      username: 'architect',
      password: '1984'
    }
  }
};

function getPhaseConfig(phaseId) {
  const phase = PHASES[phaseId];
  if (!phase) {
    return null;
  }

  return {
    phaseId,
    needUser: phase.needUser,
    next: phase.next,
    hints: phase.hints
  };
}

exports.getPhaseConfig = functions.https.onCall(async (data) => {
  const phaseId = data?.phaseId;
  const config = getPhaseConfig(phaseId);

  if (!config) {
    throw new functions.https.HttpsError('not-found', 'Phase not found.');
  }

  return config;
});

exports.validateAnswer = functions.https.onCall(async (data) => {
  const { phaseId, username = '', password = '' } = data || {};
  const phase = PHASES[phaseId];

  if (!phase) {
    throw new functions.https.HttpsError('not-found', 'Phase not found.');
  }

  const expected = phase.answers || {};
  const validUsername = phase.needUser ? username === expected.username : true;
  const validPassword = password === expected.password;

  if (validUsername && validPassword) {
    return {
      ok: true,
      ...getPhaseConfig(phaseId)
    };
  }

  return {
    ok: false,
    ...getPhaseConfig(phaseId)
  };
});
