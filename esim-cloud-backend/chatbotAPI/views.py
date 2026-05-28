"""
chatbotAPI/views.py

POST /api/chat/message/
Request body  : { "message": "<str>", "context": { "page": "<str>" } }
Response body : { "reply": "<str>" }

The view first tries to reach the Google Gemini REST API using the key stored
in the GEMINI_API_KEY environment variable.  If that variable is unset or the
call fails for any reason, it falls back to a lightweight rule-based responder
that gives useful ngspice-related answers so development works without a key.

Authentication is optional (AllowAny) — anonymous users on the Simulator page
can use the chat panel.  If a Token is present in the Authorization header it
is accepted automatically by DRF's TokenAuthentication middleware.
"""
import os
import logging
import requests as http_requests
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

logger = logging.getLogger(__name__)

# ── Gemini REST endpoint (no SDK needed, just requests) ──────────────────────
_GEMINI_URL = (
    'https://generativelanguage.googleapis.com/v1beta/models/'
    'gemini-2.0-flash:generateContent'
)
_SYSTEM_PROMPT = (
    'You are an AI assistant embedded in eSim-Cloud, an online circuit simulator '
    'built on ngspice.  Help users debug their SPICE netlists, explain simulation '
    'errors, and suggest fixes.  Keep answers concise and practical.  If the user '
    'pastes an error message, identify the root cause and give a numbered list of '
    'steps to fix it.  Use plain text — no markdown bold or bullet symbols.'
)


def _call_gemini(message: str, context: dict) -> str:
    """
    Calls the Google Gemini API and returns the assistant reply text.
    Raises an exception if the call fails — caller handles the fallback.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
    if not api_key:
        raise ValueError('GEMINI_API_KEY not configured')

    page = (context or {}).get('page', '')
    user_content = message
    if page:
        user_content = f'[Page: {page}] {message}'

    payload = {
        'system_instruction': {
            'parts': [{'text': _SYSTEM_PROMPT}]
        },
        'contents': [
            {'role': 'user', 'parts': [{'text': user_content}]}
        ],
        'generationConfig': {
            'temperature': 0.4,
            'maxOutputTokens': 512,
        }
    }

    resp = http_requests.post(
        _GEMINI_URL,
        params={'key': api_key},
        json=payload,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    # Navigate: candidates[0].content.parts[0].text
    reply = (
        data.get('candidates', [{}])[0]
        .get('content', {})
        .get('parts', [{}])[0]
        .get('text', '')
        .strip()
    )
    if not reply:
        raise ValueError('Empty reply from Gemini')
    return reply


# ── Rule-based fallback (works with zero API keys) ───────────────────────────

_RULES = [
    (
        ['floating node', 'node is floating'],
        'A floating node means a pin is not connected to anything.  '
        'Connect all unconnected pins to a wire, ground (GND), or add a large '
        'pull-down resistor (e.g. 1 GΩ) to ground to fix the issue.'
    ),
    (
        ['no ground', 'no dc path to ground', 'node 0'],
        'Every ngspice circuit needs at least one GND (node 0) connection.  '
        'Add a ground symbol to your schematic and connect it to the reference node.'
    ),
    (
        ['singular matrix', 'matrix singular'],
        'A singular matrix usually means two voltage sources are shorted together '
        'or there is a loop of ideal voltage sources.  Add a small series resistance '
        '(e.g. 1 mΩ) to break the loop.'
    ),
    (
        ['timestep too small', 'time step', 'internal timestep'],
        'The simulator could not converge.  Try: (1) Increase .tran step size, '
        '(2) Add .options reltol=0.01, (3) Check for very fast switching signals '
        'or parasitic loops in your schematic.'
    ),
    (
        ['no .plot', 'no simulations run', 'no simulation'],
        'Your netlist has no simulation command.  Add one of: .tran <step> <stop>, '
        '.ac <type> <points> <start> <stop>, or .dc <source> <start> <stop> <step>.  '
        'Also add a .print or .probe directive to capture output.'
    ),
    (
        ['mal formed b line', 'malformed b line'],
        'A B-source (arbitrary voltage/current source) has invalid syntax.  '
        'Check the expression in the source properties — it must be a valid '
        'ngspice expression such as V=sin(2*pi*1k*time).'
    ),
    (
        ['unknown subcircuit', 'could not find subcircuit'],
        'ngspice cannot find the subcircuit (model) definition.  Make sure the '
        '.lib or .model file for this component is included with a .include or '
        '.lib directive at the top of your netlist.'
    ),
    (
        ['device not found', 'unknown device type'],
        'An unknown device type was used.  Check the component reference letter '
        '(R for resistor, C for capacitor, L for inductor, Q for BJT, M for MOSFET) '
        'and ensure any custom models are included.'
    ),
    (
        ['fatal error', 'exit(1)'],
        'ngspice encountered a fatal error.  Check the Technical Details section '
        'for the specific ERROR: line.  Common causes: missing model files, '
        'syntax errors in .subckt definitions, or unsupported analysis types.'
    ),
]


def _rule_based_reply(message: str) -> str:
    lower = message.lower()
    for keywords, reply in _RULES:
        if any(kw in lower for kw in keywords):
            return reply
    return (
        'I am the eSim-Cloud AI assistant.  To give you a specific answer, please '
        'paste the exact error message from the simulation output.  Common things to '
        'check: all nodes are connected, a ground symbol is present, all component '
        'models are defined, and a simulation analysis command (.tran/.ac/.dc) exists '
        'in your netlist.'
    )


# ── View ─────────────────────────────────────────────────────────────────────

class ChatMessageView(APIView):
    """
    POST /api/chat/message/

    Request  : { "message": "<str>", "context": { "page": "<str>" } }
    Response : { "reply": "<str>" }

    Tries Gemini first; falls back to rule-based reply on any error.
    Returns HTTP 200 in both cases so the frontend never shows a network error
    for expected degraded-mode operation.
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        message = (request.data.get('message') or '').strip()
        context = request.data.get('context') or {}

        if not message:
            return Response(
                {'error': 'message field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Attempt real LLM call, fall back gracefully.
        try:
            reply = _call_gemini(message, context)
            logger.info('[chatbotAPI] Gemini reply generated successfully')
        except Exception as exc:
            logger.warning('[chatbotAPI] Gemini unavailable (%s), using rule-based fallback', exc)
            reply = _rule_based_reply(message)

        return Response({'reply': reply}, status=status.HTTP_200_OK)
