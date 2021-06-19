from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from djoser.conf import settings

User = get_user_model()


class TokenCreateSerializer(serializers.Serializer):
    password = serializers.CharField(required=False,
                                     style={"input_type": "password"})

    default_error_messages = {
        "invalid_credentials": "Incorrect username or password",
        "inactive_account": """Your account is not activated.
                               Please click on the activation link
                               sent by email.""",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.fields[settings.LOGIN_FIELD] = serializers.CharField()

    def validate(self, attrs):
        password = attrs.get("password")
        params = {settings.LOGIN_FIELD: attrs.get(settings.LOGIN_FIELD)}
        self.user = authenticate(
            request=self.context.get("request"), **params, password=password
        )
        if not self.user:
            self.user = User.objects.filter(**params).first()
            if self.user and not self.user.is_active:
                self.fail("inactive_account")

            if self.user and not self.user.check_password(password):
                self.fail("invalid_credentials")

        if self.user and self.user.is_active:
            return attrs

        if self.user and (not self.user.is_active):
            self.fail("inactive_account")

        self.fail("invalid_credentials")
