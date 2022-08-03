from libAPI.models import LibrarySet
from django import forms


class LibrarySetForm(forms.ModelForm):
    files = forms.FileField(
        required=False,
        widget=forms.ClearableFileInput(attrs={'multiple': True})
    )

    def __init__(self, *args, **kwargs):
        super(LibrarySetForm, self).__init__(*args, **kwargs)
        instance = getattr(self, 'instance', None)
        if instance and instance.pk:
            self.fields['user'].widget.attrs['disabled'] = True
            self.fields['user'].required = False
            self.fields['name'].widget.attrs['readonly'] = True

    class Meta:
        model = LibrarySet
        fields = ('name', 'user', 'default', 'files')
