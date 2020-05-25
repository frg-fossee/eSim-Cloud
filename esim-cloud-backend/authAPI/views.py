from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from requests_oauthlib import OAuth2Session

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


class GoogleOAuth2(APIView):
    """
    Login with Google OAuth2
    """

    def get(self, request):
        """

        Creates user if OAuth token valid

        """
        client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
        client_secret = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET

        state = request.query_params.get('state')
        code = request.query_params.get('code')
        # redirect_uri = request.query_params.get('redirect_uri')
        print('GOT STATE: ', state)
        print('GOT CODE: ', code)

        google = OAuth2Session(
            client_id,
            redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI,
            state=state
        )
        google.fetch_token(
            'https://accounts.google.com/o/oauth2/token',
            client_secret=client_secret,
            code=code
        )

        user_info = google.get(
            'https://www.googleapis.com/oauth2/v1/userinfo').json()
        print(user_info)
        email = user_info['email']
        print(email)

        # try:
        #     user = get_user_model().objects.get(email=email)
        # except get_user_model().DoesNotExist:
        #     user = get_user_model().objects.create_user()

        return Response(user_info)
