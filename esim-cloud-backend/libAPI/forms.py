from libAPI.models import LibrarySet
from django import forms

class LibrarySetForm(forms.ModelForm):
     name = forms.CharField(max_length=16, required=True)
     files = forms.FileField(required=True, widget=forms.ClearableFileInput(attrs={'multiple': True}))
     default = forms.BooleanField(required=False)

     class Meta:
         model = LibrarySet
         fields = ('name', 'files', 'default')
