from django.test import TestCase
from simulationAPI.helpers.error_parser import parse_ngspice_error

class ErrorParserTests(TestCase):
    
    def test_floating_node_error(self):
        stderr = "Error: node is floating abc1"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertIn("floating node", res['codes'])
        
    def test_missing_ground_error(self):
        stderr = "Error: node 0 is not defined in the circuit"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertIn("missing ground", res['codes'])
        
    def test_singular_matrix_error(self):
        stderr = "Warning: singular matrix:  check nodes out and in"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertIn("singular matrix", res['codes'])
        
    def test_timestep_too_small_error(self):
        stderr = "Error: timestep too small at time 1.0000e-05"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertIn("timestep too small", res['codes'])
        
    def test_unknown_subcircuit_error(self):
        stderr = "Error: unknown subcircuit LM358"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertIn("unknown subcircuit", res['codes'])
        
    def test_fallback_unknown_error(self):
        stderr = "Fatal error: Segmentation fault"
        res = parse_ngspice_error(stderr)
        self.assertTrue(len(res['summary']) > 0)
        self.assertTrue(len(res['hints']) > 0)
        self.assertEqual(res['summary'], "Simulation failed with an unknown error")
