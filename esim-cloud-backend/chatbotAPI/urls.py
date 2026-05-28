"""
chatbotAPI/urls.py

Registers:
  POST  /api/chat/message/   →  ChatMessageView
"""
from django.urls import path
from .views import ChatMessageView

urlpatterns = [
    path('message/', ChatMessageView.as_view(), name='chat-message'),
]
