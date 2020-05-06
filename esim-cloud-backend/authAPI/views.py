from rest_framework.views import APIView
from rest_framework.response import Response
import requests


class UserActivationView(APIView):
    """
    Used to activate accounts,
    sends POST request to /api/auth/users/activation/ route
    internally to activate account.
    Link to this route is sent via email to user for verification
    """

    def get(self, request, uid, token):
        protocol = 'https://' if request.is_secure() else 'http://'
        web_url = protocol + request.get_host()
        post_url = web_url + "/api/auth/users/activation/"
        post_data = {'uid': uid, 'token': token}
        resp = requests.post(post_url, data=post_data)
        response_status = resp.status_code
        if response_status == 204:
            return Response({'status': 'Activated'}, status=201)
        else:
            return Response(resp.json(), status=response_status)
