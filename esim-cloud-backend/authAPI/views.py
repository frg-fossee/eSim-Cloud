from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from requests_oauthlib import OAuth2Session
from django.contrib.auth import get_user_model
from djoser.conf import settings as djoser_settings
from random import randint
import requests
from django.shortcuts import render
Token = djoser_settings.TOKEN_MODEL


def activate_user(request, uid, token):
    return render(request,
                  'authAPI/activate_user.html',
                  {'uid': uid, 'token': token})


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

        1. Use the following route to get authorization_url:
           http://localhost/api/auth/o/google-oauth2/?redirect_uri=http://localhost/api/auth/google-callback
        2. This is the callback route
           returns
            {
                "auth_token": "1503a622f9bb9ef705d6f8a4921bf83cc5a9872c"
            }
            Creates user if not already existing

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

        if user_info['email']:
            user, created = get_user_model().objects.get_or_create(
                email=user_info['email'])
            if created:
                # If User was created
                # Set name to firstname_lastname1209
                username = user_info['name'].strip().replace(
                    ' ', '_') + str(randint(0, 9999))
                user.username = username
                user.save()
            token, created = Token.objects.get_or_create(user=user)
        return Response({'auth_token': token.key})
