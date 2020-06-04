const ComponentParameters = {
  // capacitor
  C: {
    PREFIX: 'C',
    NAME: '',
    N1: '',
    N2: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: '',
    UNIT: 'F'
  },

  D: {
    PREFIX: 'D',
    NAME: '',
    N1: '',
    N2: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  I: {
    PREFIX: 'I',
    NAME: '',
    N1: '',
    N2: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: '',
    UNIT: 'A'
  },

  G: {
    PREFIX: 'G',
    NAME: '',
    N1: '',
    N2: '',
    NC1: '',
    NC2: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  F: {
    PREFIX: 'F',
    NAME: '',
    N1: '',
    N2: '',
    VNAM: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  H: {
    PREFIX: 'H',
    NAME: '',
    N1: '',
    N2: '',
    VNAM: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  J: {
    PREFIX: 'J',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  O: {
    PREFIX: 'O',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    N4: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  T: {
    PREFIX: 'T',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    N4: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },
  // Inductor
  L: {
    PREFIX: 'L',
    NAME: '',
    N1: '',
    N2: '',
    VALUE: '',
    EXTRA_EXPRESSION: '',
    MODEL: '',
    UNIT: 'H'
  },

  M: {
    PREFIX: 'M',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    N4: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  Q: {
    PREFIX: 'Q',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  V: {
    VSOURCE: {
      PREFIX: 'V',
      NAME: '',
      N1: '',
      N2: '',
      VALUE: '0',
      EXTRA_EXPRESSION: '',
      MODEL: '',
      VALUE_UNIT: 'V'
    },
    SINE: {
      PREFIX: 'V',
      NAME: '',
      N1: '',
      N2: '',
      VALUE: '0',

      OFFSET: '1.0',
      AMPLITUDE: '1.0',
      FREQUENCY: '1K',
      DELAY: '0.0',
      DAMPING_FACTOR: '0.0',
      PHASE: '0.0',

      EXTRA_EXPRESSION: '',
      MODEL: '',
      VALUE_UNIT: 'V',
      OFFSET_UNIT: 'V',
      AMPLITUDE_UNIT: 'V',
      FREQUENCY_UNIT: 'Hz',
      DELAY_UNIT: 'S',
      DAMPING_FACTOR_UNIT: '1/S',
      PHASE_UNIT: 'deg'
    }

  },
  // resistor
  R: {
    PREFIX: 'R',
    NAME: '',
    N1: '',
    N2: '',
    VALUE: '1',
    EXTRA_EXPRESSION: '',
    MODEL: '',
    UNIT: 'K'
  },

  Z: {
    PREFIX: 'Z',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    EXTRA_EXPRESSION: '',
    MODEL: ''
  },

  S: {
    PREFIX: 'S',
    NAME: '',
    N1: '',
    N2: '',
    NC1: '',
    NC2: '',
    MODEL: '',
    EXTRA_EXPRESSION: ''

  },
  W: {
    PREFIX: 'W',
    NAME: '',
    N1: '',
    N2: '',
    VNAM: '',
    MODEL: '',
    EXTRA_EXPRESSION: ''

  }

}

export default ComponentParameters

// K coupled inductor
// SWITCHES

// IF S,W show model
