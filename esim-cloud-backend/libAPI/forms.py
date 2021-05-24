from libAPI.models import LibrarySet
from django import forms


class LibrarySetForm(forms.ModelForm):
    files = forms.FileField(
        required=False,
        widget=forms.ClearableFileInput(attrs={'multiple': True})
    )

    class Meta:
        model = LibrarySet
        fields = ('name', 'user', 'default', 'files')
