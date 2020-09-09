from django.shortcuts import render
from rest_framework import viewsets
from .models import Domains
from .serializers import  DomainsSerializer

class DomainsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Domains.objects.all()
    serializer_class = DomainsSerializer
