import os
import re
import tempfile
import numpy as np
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.conf import settings
from simulationAPI.helpers.autotune_helper import (
    parse_numeric,
    parse_data_file,
    evaluate_metrics,
    AutotuneStudyCoordinator
)

class AutotuneHelperTests(TestCase):
    def test_parse_numeric(self):
        self.assertEqual(parse_numeric("10"), 10.0)
        self.assertEqual(parse_numeric("1.5e-3"), 0.0015)
        self.assertEqual(parse_numeric("(1.2,3.4)"), complex(1.2, 3.4))
        self.assertEqual(parse_numeric(""), 0.0)
        self.assertEqual(parse_numeric("invalid"), 0.0)

    def test_parse_data_file(self):
        # Create a mock data file
        content = """
Index   frequency   v(out)
--------------------------
0       1.000000e+00    (1.000000e+00,0.000000e+00)
1       1.000000e+01    (7.071067e-01,-7.071067e-01)
"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(content)
            temp_path = f.name

        try:
            headers, x_data, y_data = parse_data_file(temp_path)
            self.assertEqual(headers, ["frequency", "v(out)"])
            self.assertEqual(x_data, [1.0, 10.0])
            self.assertEqual(y_data, [[complex(1.0, 0.0), complex(0.7071067, -0.7071067)]])
        finally:
            os.remove(temp_path)

    def test_parse_data_file_multiple_headers(self):
        # Create a mock data file with multiple headers/tables
        content = """
Index   frequency   v(out)
--------------------------
0       1.000000e+00    (1.000000e+00,0.000000e+00)
1       1.000000e+01    (7.071067e-01,-7.071067e-01)
Index   frequency   v(out)
--------------------------
0       1.000000e+02    (1.000000e-01,0.000000e+00)
1       1.000000e+03    (1.000000e-02,0.000000e+00)
"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(content)
            temp_path = f.name

        try:
            headers, x_data, y_data = parse_data_file(temp_path)
            self.assertEqual(headers, ["frequency", "v(out)"])
            # Should only contain values from the last table block
            self.assertEqual(x_data, [100.0, 1000.0])
            self.assertEqual(y_data, [[complex(0.1, 0.0), complex(0.01, 0.0)]])
        finally:
            os.remove(temp_path)

    def test_evaluate_metrics_ac(self):
        # 1Hz to 1000Hz
        freqs = [1.0, 10.0, 100.0, 1000.0]
        v_out = [
            complex(1.0, 0.0),
            complex(0.7071, -0.7071), # mag = 1.0, angle = -45 deg
            complex(0.0, -0.1),       # mag = 0.1, angle = -90 deg
            complex(-0.007, -0.007)   # mag = ~0.01, angle = -135 deg
        ]
        
        headers = ["frequency", "v(out)"]
        x_data = freqs
        y_data = [v_out]
        
        metrics = evaluate_metrics(headers, x_data, y_data, 'ac')
        self.assertIn('dc_gain', metrics)
        self.assertIn('cutoff_freq', metrics)
        self.assertIn('phase_margin', metrics)
        
        self.assertAlmostEqual(metrics['dc_gain'], 0.0, places=1)
        self.assertTrue(metrics['cutoff_freq'] > 0.0)

    def test_evaluate_metrics_transient(self):
        times = [0.0, 1.0, 2.0, 3.0]
        v_out = [0.0, 5.0, 5.0, 5.0]
        
        headers = ["time", "v(out)"]
        x_data = times
        y_data = [v_out]
        
        metrics = evaluate_metrics(headers, x_data, y_data, 'transient')
        self.assertIn('slew_rate', metrics)
        self.assertAlmostEqual(metrics['slew_rate'], 5.0)

    @patch('simulationAPI.helpers.autotune_helper.run_single_simulation')
    def test_autotune_study_coordinator(self, mock_run_sim):
        def mock_run(netlist_content, file_id):
            r1_val = 1000.0
            match = re.search(r"value=([^\s]+)", netlist_content)
            if match:
                r1_val = float(match.group(1))
            
            sim_dir = os.path.join(settings.MEDIA_ROOT, 'autotune', str(file_id))
            os.makedirs(sim_dir, exist_ok=True)
            data_file = os.path.join(sim_dir, 'data.txt')
            
            # Simple AC response
            # Let's make gain proportional to R1, e.g. R1 / 250.0
            # Target is 20 dB, meaning mag = 10.0, meaning R1 = 2500.0
            gain = r1_val / 250.0
            mag = complex(gain, 0.0)
            
            with open(data_file, 'w') as f:
                f.write("Index frequency v(out)\n")
                f.write(f"0 1.0e+00 ({mag.real:.6e},{mag.imag:.6e})\n")
                f.write(f"1 1.0e+01 (1.000000e-2,0.000000e+00)\n")
            
            return data_file, None

        mock_run_sim.side_effect = mock_run
        
        netlist_template = "* test\nR1 value={R1}"
        params_config = [
            {"name": "R1", "type": "Float", "min": 100, "max": 10000}
        ]
        targets_config = {
            "dc_gain": {"target": 20.0, "weight": 1.0}
        }
        
        coordinator = AutotuneStudyCoordinator(
            netlist_template=netlist_template,
            params_config=params_config,
            targets_config=targets_config,
            max_trials=10
        )
        
        db_path = os.path.join(settings.MEDIA_ROOT, 'autotune', "study_test_run.db")
        if os.path.exists(db_path):
            os.remove(db_path)

        best_params, best_value = coordinator.run_study(
            file_id="test_run",
            analysis_type="ac"
        )
        
        self.assertIn("R1", best_params)
        self.assertTrue(100.0 <= best_params["R1"] <= 10000.0)
