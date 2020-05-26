class TokenStrategy:
    @classmethod
    def obtain(cls, user):
        from rest_framework.authtoken.models import Token
        from django.utils.six import text_type

        token = Token.objects.create(user=...)
        return {
            "token": text_type(token.key),
        }
