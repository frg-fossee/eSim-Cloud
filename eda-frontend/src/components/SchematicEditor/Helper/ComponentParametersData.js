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
    VALUE_UNIT: 'F',
    IC: '0'
  },

  D: {
    PREFIX: 'D',
    NAME: '',
    N1: '',
    N2: '',
    EXTRA_EXPRESSION: '',
    MODEL: '.model mydiode D'
  },

  I: {

    ISOURCE: {
      PREFIX: 'I',
      NAME: '',
      N1: '',
      N2: '',
      VALUE: '0',
      EXTRA_EXPRESSION: '',
      MODEL: '',
      VALUE_UNIT: 'A'
    },
    SINE: {
      PREFIX: 'I',
      NAME: '',
      N1: '',
      N2: '',

      OFFSET: '1.0',
      AMPLITUDE: '1.0',
      FREQUENCY: '1K',
      DELAY: '0.0',
      DAMPING_FACTOR: '0.0',
      PHASE: '0.0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      OFFSET_UNIT: 'A',
      AMPLITUDE_UNIT: 'A',
      FREQUENCY_UNIT: 'Hz',
      DELAY_UNIT: 'S',
      DAMPING_FACTOR_UNIT: '1/S',
      PHASE_UNIT: 'DEG'
    },

    PULSE: {
      PREFIX: 'I',
      NAME: '',
      N1: '',
      N2: '',

      INITIAL_VALUE: '0',
      PULSED_VALUE: '1',
      DELAY_TIME: '1K',
      RISE_TIME: '1u',
      FALL_TIME: '1u',
      PULSE_WIDTH: '1m',
      PERIOD: '1m',
      PHASE: '0.0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      INITIAL_VALUE_UNIT: 'A',
      PULSED_VALUE_UNIT: 'A',
      DELAY_TIME_UNIT: 'S',
      RISE_TIME_UNIT: 'S',
      FALL_TIME_UNIT: 'S',
      PULSE_WIDTH_UNIT: 'S',
      PERIOD_UNIT: 'S',
      PHASE_UNIT: 'DEG'
    },

    DC: {
      PREFIX: 'I',
      NAME: '',
      N1: '',
      N2: '',
      VALUE: '0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      VALUE_UNIT: 'A'
    },

    EXP: {
      PREFIX: 'I',
      NAME: '',
      N1: '',
      N2: '',

      INITIAL_VALUE: '0',
      PULSED_VALUE: '1',

      RISE_DELAY_TIME: '100u',
      RISE_TIME_CONSTANT: '20u',
      FALL_DELAY_TIME: '500u',
      FALL_TIME_CONSTANT: '60u',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      INITIAL_VALUE_UNIT: 'A',
      PULSED_VALUE_UNIT: 'A',
      RISE_DELAY_TIME_UNIT: 'S',
      RISE_TIME_CONSTANT_UNIT: 'S',
      FALL_DELAY_TIME_UNIT: 'S',
      FALL_TIME_CONSTANT_UNIT: 'S'
    }

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
    MODEL: '',
    VALUE_UNIT: 'mho'
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
    VALUE_UNIT: 'H',
    IC: '0',
    DTEMP: '27'
  },

  M: {
    PREFIX: 'M',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    N4: '',
    EXTRA_EXPRESSION: '',
    MULTIPLICITY_PARAMETER: '1',
    MODEL: '.model mymosfet NMOS',
    DTEMP: '27'
  },

  Q: {
    PREFIX: 'Q',
    NAME: '',
    N1: '',
    N2: '',
    N3: '',
    EXTRA_EXPRESSION: '',
    MODEL: '.model mybjt PNP',
    MULTIPLICITY_PARAMETER: '1',
    DTEMP: '27'
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

      OFFSET: '1.0',
      AMPLITUDE: '1.0',
      FREQUENCY: '1K',
      DELAY: '0.0',
      DAMPING_FACTOR: '0.0',
      PHASE: '0.0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      OFFSET_UNIT: 'V',
      AMPLITUDE_UNIT: 'V',
      FREQUENCY_UNIT: 'Hz',
      DELAY_UNIT: 'S',
      DAMPING_FACTOR_UNIT: '1/S',
      PHASE_UNIT: 'DEG'
    },

    PULSE: {
      PREFIX: 'V',
      NAME: '',
      N1: '',
      N2: '',

      INITIAL_VALUE: '0',
      PULSED_VALUE: '1',
      DELAY_TIME: '1K',
      RISE_TIME: '1u',
      FALL_TIME: '1u',
      PULSE_WIDTH: '1m',
      PERIOD: '1m',
      PHASE: '0.0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      INITIAL_VALUE_UNIT: 'V',
      PULSED_VALUE_UNIT: 'V',
      DELAY_TIME_UNIT: 'S',
      RISE_TIME_UNIT: 'S',
      FALL_TIME_UNIT: 'S',
      PULSE_WIDTH_UNIT: 'S',
      PERIOD_UNIT: 'S',
      PHASE_UNIT: 'DEG'
    },

    DC: {
      PREFIX: 'V',
      NAME: '',
      N1: '',
      N2: '',
      VALUE: '0',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      VALUE_UNIT: 'V'
    },

    EXP: {
      PREFIX: 'V',
      NAME: '',
      N1: '',
      N2: '',

      INITIAL_VALUE: '0',
      PULSED_VALUE: '1',

      RISE_DELAY_TIME: '100u',
      RISE_TIME_CONSTANT: '20u',
      FALL_DELAY_TIME: '500u',
      FALL_TIME_CONSTANT: '60u',

      EXTRA_EXPRESSION: '',
      MODEL: '',

      INITIAL_VALUE_UNIT: 'v',
      PULSED_VALUE_UNIT: 'v',
      RISE_DELAY_TIME_UNIT: 'S',
      RISE_TIME_CONSTANT_UNIT: 'S',
      FALL_DELAY_TIME_UNIT: 'S',
      FALL_TIME_CONSTANT_UNIT: 'S'
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
    VALUE_UNIT: 'Ohm',
    SHEET_RESISTANCE: '0',
    FIRST_ORDER_TEMPERATURE_COEFF: '0',
    SECOND_ORDER_TEMPERATURE_COEFF: '0',
    PARAMETER_MEASUREMENT_TEMPERATURE: '27'
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

  SW: {
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

  },
  E: {
    PREFIX: 'E',
    NAME: '',
    N1: '',
    N2: '',
    NC1: '',
    NC2: '',
    MODEL: '',
    VALUE: '1',
    EXTRA_EXPRESSION: ''
  }

}

export default ComponentParameters

// K coupled inductor
// SWITCHES

// IF S,W show model
